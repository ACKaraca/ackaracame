import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CAMERA_START, corridorLayout, type Surface } from './corridorLayout';

export interface CorridorSceneItem {
  label: string;
  kind: 'project' | 'page';
  image?: string;
  aspect: number;
  palette: string[];
}

export interface CorridorSceneOptions {
  container: HTMLElement;
  pill: HTMLElement;
  items: CorridorSceneItem[];
  dark: boolean;
  reducedMotion: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
}

export interface CorridorScene {
  setProgress: (progress: number) => void;
  focus: (index: number | null) => void;
  dive: (index: number) => Promise<void>;
  setTheme: (dark: boolean) => void;
  dispose: () => void;
}

const HALF_WIDTH = 4;
const HALF_HEIGHT = 3;
const FOV = 55;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

interface Frame { point: THREE.Vector3; tangent: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 }

interface Panel {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  base: Float32Array;
  width: number;
  height: number;
  normal: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
  bend: number;
}

const themeColors = (dark: boolean) => ({
  background: new THREE.Color(dark ? '#070707' : '#f3f2ee'),
  line: new THREE.Color(dark ? '#ffffff' : '#0b0b0b'),
  lineOpacity: dark ? 0.2 : 0.26,
});

const buildCurve = (length: number) => {
  const points: THREE.Vector3[] = [];
  const count = Math.ceil(length / 16) + 3;
  for (let index = 0; index < count; index += 1) {
    points.push(new THREE.Vector3(Math.sin(index * 0.9) * 5, Math.sin(index * 0.55) * 1.5, -index * 16 + 16));
  }
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
};

const frameAt = (curve: THREE.CatmullRomCurve3, distance: number): Frame => {
  const u = THREE.MathUtils.clamp(distance / curve.getLength(), 0, 1);
  const point = curve.getPointAt(u);
  const tangent = curve.getTangentAt(u).normalize();
  const right = new THREE.Vector3().crossVectors(tangent, WORLD_UP).normalize();
  const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
  return { point, tangent, right, up };
};

// Rectangular wireframe corridor: longitudinal rails on every face plus a ring every unit.
const buildTunnel = (curve: THREE.CatmullRomCurve3, length: number) => {
  const offsets: Array<[number, number]> = [];
  for (let x = -HALF_WIDTH; x <= HALF_WIDTH; x += 1) offsets.push([x, -HALF_HEIGHT], [x, HALF_HEIGHT]);
  for (let y = -HALF_HEIGHT + 1; y < HALF_HEIGHT; y += 1) offsets.push([-HALF_WIDTH, y], [HALF_WIDTH, y]);
  const corners: Array<[number, number]> = [[-HALF_WIDTH, -HALF_HEIGHT], [HALF_WIDTH, -HALF_HEIGHT], [HALF_WIDTH, HALF_HEIGHT], [-HALF_WIDTH, HALF_HEIGHT]];
  const frames: Frame[] = [];
  for (let distance = 0; distance <= length; distance += 1) frames.push(frameAt(curve, distance));
  const at = (frame: Frame, [x, y]: [number, number]) => frame.point.clone().addScaledVector(frame.right, x).addScaledVector(frame.up, y);
  const positions: number[] = [];
  const push = (a: THREE.Vector3, b: THREE.Vector3) => positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  frames.forEach((frame, index) => {
    corners.forEach((corner, cornerIndex) => push(at(frame, corner), at(frame, corners[(cornerIndex + 1) % 4]!)));
    const next = frames[index + 1];
    if (next) offsets.forEach((offset) => push(at(frame, offset), at(next, offset)));
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
};

const TILT = THREE.MathUtils.degToRad(24);

// Hang a panel on its surface, then angle it toward the approaching camera so it reads before you pass it.
const placement = (frame: Frame, surface: Surface, width: number, height: number) => {
  const flat = surfacePlacement(frame, surface, height);
  if (surface === 'end') return flat;
  const back = frame.tangent.clone().negate();
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3().crossVectors(flat.normal, back).normalize(), TILT);
  const reach = (surface === 'left' || surface === 'right' ? width : height) / 2;
  return {
    center: flat.center.addScaledVector(flat.normal, reach * Math.sin(TILT)),
    normal: flat.normal.clone().applyQuaternion(tilt),
    up: flat.up.clone().applyQuaternion(tilt),
  };
};

const surfacePlacement = (frame: Frame, surface: Surface, height: number) => {
  const { point, tangent, right, up } = frame;
  switch (surface) {
    case 'left': return { center: point.clone().addScaledVector(right, -HALF_WIDTH + 0.04), normal: right.clone(), up: up.clone() };
    case 'right': return { center: point.clone().addScaledVector(right, HALF_WIDTH - 0.04), normal: right.clone().negate(), up: up.clone() };
    case 'ceiling': return { center: point.clone().addScaledVector(up, HALF_HEIGHT - 0.04), normal: up.clone().negate(), up: tangent.clone().negate() };
    case 'floor': return { center: point.clone().addScaledVector(up, -HALF_HEIGHT + 0.04), normal: up.clone(), up: tangent.clone() };
    default: return { center: point.clone().addScaledVector(up, Math.min(0.4, HALF_HEIGHT - height / 2 - 0.2)), normal: tangent.clone().negate(), up: up.clone() };
  }
};

const paletteTexture = (item: CorridorSceneItem) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 / item.aspect);
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    item.palette.forEach((color, index) => gradient.addColorStop(index / Math.max(1, item.palette.length - 1), color));
    context.fillStyle = item.kind === 'page' ? '#050505' : gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (item.kind === 'page') {
      // Portal: a glowing square frame with the destination name.
      context.strokeStyle = gradient;
      context.lineWidth = 18;
      context.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      context.fillStyle = '#ffffff';
      context.font = `760 ${Math.round(canvas.height * 0.2)}px "Manrope Variable", system-ui, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(item.label.toLocaleUpperCase(), canvas.width / 2, canvas.height / 2, canvas.width - 160);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const lookQuaternion = (eye: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eye, target, up));

export const createCorridorScene = (options: CorridorSceneOptions): CorridorScene => {
  const { container, pill, items, reducedMotion } = options;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const layout = corridorLayout(items.length);
  const curve = buildCurve(layout.tunnelLength + 16);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 140);
  let colors = themeColors(options.dark);
  scene.background = colors.background;
  scene.fog = new THREE.Fog(colors.background, 12, 72);

  const tunnelMaterial = new THREE.LineBasicMaterial({ color: colors.line, transparent: true, opacity: colors.lineOpacity });
  const tunnel = new THREE.LineSegments(buildTunnel(curve, layout.tunnelLength), tunnelMaterial);
  scene.add(tunnel);

  const loader = new THREE.TextureLoader();
  const panels: Panel[] = items.map((item, index) => {
    const surface = layout.surfaces[index]!;
    const maxWidth = surface === 'end' ? 6.4 : 5.2;
    const maxHeight = surface === 'end' ? 3.8 : 3.4;
    const width = Math.min(maxWidth, maxHeight * item.aspect);
    const height = width / item.aspect;
    const frame = frameAt(curve, layout.itemDistance[index]!);
    const place = placement(frame, surface, width, height);
    const geometry = new THREE.PlaneGeometry(width, height, 32, 1);
    const material = new THREE.MeshBasicMaterial({ map: paletteTexture(item), side: THREE.DoubleSide, fog: true });
    if (item.image) {
      loader.load(item.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map?.dispose();
        material.map = texture;
        material.needsUpdate = true;
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    const panelRight = new THREE.Vector3().crossVectors(place.up, place.normal).normalize();
    mesh.position.copy(place.center);
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(panelRight, place.up, place.normal));
    mesh.userData.index = index;
    scene.add(mesh);
    return {
      mesh,
      base: Float32Array.from(geometry.getAttribute('position').array),
      width,
      height,
      normal: place.normal,
      up: place.up,
      right: panelRight,
      bend: 0,
    };
  });

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.55, 0.86);
  // A light background sits above any bloom threshold and would wash the whole frame out.
  bloom.enabled = options.dark;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let targetProgress = 0;
  let progress = 0;
  let mode: 'walk' | 'focus' | 'dive' = 'walk';
  let focused: number | null = null;
  let hovered: number | null = null;
  const pointer = new THREE.Vector2(0, 0);
  const client = { x: 0, y: 0 };
  const rest = new THREE.Vector2(0, 0);
  const parallax = new THREE.Vector2(0, 0);
  let pointerInside = false;
  const raycaster = new THREE.Raycaster();
  const meshes = panels.map((panel) => panel.mesh);

  const resize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    bloom.resolution.set(width, height);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const walkPose = () => {
    const distance = CAMERA_START + progress * (layout.cameraEnd - CAMERA_START);
    const frame = frameAt(curve, distance);
    const ahead = frameAt(curve, distance + 6).point;
    const quaternion = lookQuaternion(frame.point, ahead, frame.up);
    if (!reducedMotion) quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(parallax.y * 0.09, -parallax.x * 0.14, 0)));
    return { position: frame.point, quaternion };
  };

  const focusPose = (index: number, depth?: number) => {
    const panel = panels[index]!;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const narrow = camera.aspect < 1;
    // Wide screens park the panel on the left half; narrow screens put it above the bottom sheet.
    const share = narrow ? 0.9 : 0.42;
    const distance = depth ?? panel.width / (share * 2 * tanHalf * camera.aspect);
    const shift = depth !== undefined ? new THREE.Vector3()
      : narrow ? panel.up.clone().multiplyScalar(-panel.height * 0.75) : panel.right.clone().multiplyScalar(panel.width * 0.5);
    const target = panel.mesh.position.clone().add(shift);
    const position = target.clone().addScaledVector(panel.normal, distance);
    return { position, quaternion: lookQuaternion(position, target, panel.up) };
  };

  const setBend = (panel: Panel, bend: number) => {
    if (Math.abs(panel.bend - bend) < 0.001) return;
    panel.bend = bend;
    const attribute = panel.mesh.geometry.getAttribute('position');
    for (let vertex = 0; vertex < attribute.count; vertex += 1) {
      const x = panel.base[vertex * 3]! / (panel.width / 2);
      // Concave screen: edges lean toward the viewer.
      attribute.setZ(vertex, panel.base[vertex * 3 + 2]! + bend * panel.width * 0.09 * x * x);
    }
    attribute.needsUpdate = true;
  };

  const project = new THREE.Vector3();
  const updatePill = () => {
    if (hovered === null || mode !== 'walk') {
      pill.style.opacity = '0';
      return;
    }
    project.copy(panels[hovered]!.mesh.position).project(camera);
    const visible = project.z < 1;
    pill.style.opacity = visible ? '1' : '0';
    pill.style.transform = `translate(${((project.x + 1) / 2) * container.clientWidth}px, ${((1 - project.y) / 2) * container.clientHeight}px) translate(-50%, -50%)`;
  };

  const pick = (clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1), camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit && hit.distance < 40 ? (hit.object.userData.index as number) : null;
  };

  const setHovered = (index: number | null) => {
    if (index === hovered) return;
    hovered = index;
    container.style.cursor = index === null ? '' : 'pointer';
    options.onHover(index);
  };

  const onPointerMove = (event: PointerEvent) => {
    pointerInside = true;
    client.x = event.clientX;
    client.y = event.clientY;
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  };
  const onPointerLeave = () => {
    pointerInside = false;
    setHovered(null);
  };
  const onClick = (event: MouseEvent) => {
    if (mode !== 'walk') return;
    const index = pick(event.clientX, event.clientY);
    if (index !== null) options.onSelect(index);
  };
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', onPointerLeave);
  container.addEventListener('click', onClick);

  let previous = performance.now();
  let frameId = 0;
  let lastPick = 0;
  const desired = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
  let diveTarget: number | null = null;
  const tick = (now: number) => {
    const delta = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    const ease = (rate: number) => (reducedMotion ? 1 : 1 - Math.exp(-delta * rate));
    progress += (targetProgress - progress) * ease(6);
    parallax.lerp(pointerInside ? pointer : rest, ease(3));

    const pose = mode === 'walk' ? walkPose() : mode === 'dive' && diveTarget !== null ? focusPose(diveTarget, 0.15) : focused !== null ? focusPose(focused) : walkPose();
    desired.position.copy(pose.position);
    desired.quaternion.copy(pose.quaternion);
    const cameraRate = mode === 'walk' ? 10 : mode === 'dive' ? 3.2 : 4;
    camera.position.lerp(desired.position, ease(cameraRate));
    camera.quaternion.slerp(desired.quaternion, ease(cameraRate));

    panels.forEach((panel, index) => setBend(panel, panel.bend + ((mode === 'focus' && index === focused ? 1 : 0) - panel.bend) * ease(5)));

    if (mode === 'walk' && pointerInside && now - lastPick > 50) {
      lastPick = now;
      setHovered(pick(client.x, client.y));
    }
    updatePill();
    composer.render(delta);
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);

  return {
    setProgress: (next) => { targetProgress = THREE.MathUtils.clamp(next, 0, 1); },
    focus: (index) => {
      focused = index;
      mode = index === null ? 'walk' : 'focus';
      if (index !== null) setHovered(null);
    },
    dive: (index) => {
      mode = 'dive';
      diveTarget = index;
      setHovered(null);
      return new Promise((resolve) => { window.setTimeout(resolve, reducedMotion ? 0 : 900); });
    },
    setTheme: (dark) => {
      colors = themeColors(dark);
      scene.background = colors.background;
      (scene.fog as THREE.Fog).color = colors.background;
      tunnelMaterial.color = colors.line;
      tunnelMaterial.opacity = colors.lineOpacity;
      bloom.enabled = dark;
    },
    dispose: () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);
      tunnel.geometry.dispose();
      tunnelMaterial.dispose();
      panels.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.map?.dispose();
        mesh.material.dispose();
      });
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
