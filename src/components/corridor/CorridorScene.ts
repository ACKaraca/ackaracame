import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CAMERA_START, corridorLayout, easeInOutCubic, flightSeconds, type Surface } from './corridorLayout';

export interface CorridorSceneItem {
  label: string;
  kind: 'project' | 'page' | 'note';
  image?: string;
  aspect: number;
  palette: string[];
  /** Text drawn on note panels. */
  eyebrow?: string;
  body?: string;
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
  /** Follow the scroll position (smoothed). */
  setProgress: (progress: number) => void;
  /** Fly along the corridor to a progress value with an eased, timed flight. */
  flyTo: (progress: number) => void;
  focus: (index: number | null) => void;
  dive: (index: number) => Promise<void>;
  setTheme: (dark: boolean) => void;
  dispose: () => void;
}

const HALF_WIDTH = 4.5;
const HALF_HEIGHT = 3;
const CELL = 1.5;
const FOV = 62;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

interface Frame { point: THREE.Vector3; tangent: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 }
interface Pose { position: THREE.Vector3; quaternion: THREE.Quaternion }

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
  background: new THREE.Color(dark ? '#030303' : '#f3f2ee'),
  wall: new THREE.Color(dark ? '#0d0c0c' : '#ebe9e3'),
  line: new THREE.Color(dark ? '#ffffff' : '#111111'),
  lineOpacity: dark ? 0.82 : 0.5,
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

const CORNERS: Array<[number, number]> = [[-HALF_WIDTH, -HALF_HEIGHT], [HALF_WIDTH, -HALF_HEIGHT], [HALF_WIDTH, HALF_HEIGHT], [-HALF_WIDTH, HALF_HEIGHT]];
const at = (frame: Frame, [x, y]: [number, number]) => frame.point.clone().addScaledVector(frame.right, x).addScaledVector(frame.up, y);

// Rectangular corridor: opaque faces for the shell, and a wire grid (rails + rings) drawn on top.
const buildTunnel = (curve: THREE.CatmullRomCurve3, length: number) => {
  const offsets: Array<[number, number]> = [];
  for (let x = -HALF_WIDTH; x <= HALF_WIDTH + 0.001; x += CELL) offsets.push([x, -HALF_HEIGHT], [x, HALF_HEIGHT]);
  for (let y = -HALF_HEIGHT + CELL; y < HALF_HEIGHT - 0.001; y += CELL) offsets.push([-HALF_WIDTH, y], [HALF_WIDTH, y]);
  const frames: Frame[] = [];
  for (let distance = 0; distance <= length; distance += CELL) frames.push(frameAt(curve, distance));

  const lines: number[] = [];
  const faces: number[] = [];
  const pushLine = (a: THREE.Vector3, b: THREE.Vector3) => lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const pushQuad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) =>
    faces.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
  frames.forEach((frame, index) => {
    CORNERS.forEach((corner, cornerIndex) => pushLine(at(frame, corner), at(frame, CORNERS[(cornerIndex + 1) % 4]!)));
    const next = frames[index + 1];
    if (!next) return;
    offsets.forEach((offset) => pushLine(at(frame, offset), at(next, offset)));
    CORNERS.forEach((corner, cornerIndex) => {
      const following = CORNERS[(cornerIndex + 1) % 4]!;
      pushQuad(at(frame, corner), at(frame, following), at(next, following), at(next, corner));
    });
  });
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  const faceGeometry = new THREE.BufferGeometry();
  faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
  return { lineGeometry, faceGeometry };
};

// Panels lie flush on their surface, a hair inside so the grid never cuts through them.
const placement = (frame: Frame, surface: Surface, height: number) => {
  const { point, tangent, right, up } = frame;
  const inset = 0.03;
  switch (surface) {
    case 'left': return { center: point.clone().addScaledVector(right, -HALF_WIDTH + inset), normal: right.clone(), up: up.clone() };
    case 'right': return { center: point.clone().addScaledVector(right, HALF_WIDTH - inset), normal: right.clone().negate(), up: up.clone() };
    case 'ceiling': return { center: point.clone().addScaledVector(up, HALF_HEIGHT - inset), normal: up.clone().negate(), up: tangent.clone().negate() };
    case 'floor': return { center: point.clone().addScaledVector(up, -HALF_HEIGHT + inset), normal: up.clone(), up: tangent.clone() };
    default: return { center: point.clone().addScaledVector(up, Math.min(0.3, HALF_HEIGHT - height / 2 - 0.3)), normal: tangent.clone().negate(), up: up.clone() };
  }
};

const FONT_SANS = '"Manrope Variable", system-ui, sans-serif';
const FONT_MONO = 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace';

const wrapLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/u)) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const drawPanel = (canvas: HTMLCanvasElement, item: CorridorSceneItem) => {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  item.palette.forEach((color, index) => gradient.addColorStop(index / Math.max(1, item.palette.length - 1), color));
  if (item.kind === 'project') {
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    return;
  }
  context.fillStyle = '#070707';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = gradient;
  context.lineWidth = item.kind === 'page' ? 18 : 6;
  context.strokeRect(24, 24, width - 48, height - 48);
  context.fillStyle = '#ffffff';
  if (item.kind === 'page') {
    // Portal: a glowing frame with the destination name.
    context.font = `760 ${Math.round(height * 0.2)}px ${FONT_SANS}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(item.label.toLocaleUpperCase(), width / 2, height / 2, width - 160);
    return;
  }
  // Note: editorial text card (eyebrow, title, body).
  const pad = 80;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = item.palette[0] ?? '#ffffff';
  context.font = `600 26px ${FONT_MONO}`;
  context.fillText((item.eyebrow ?? '').toLocaleUpperCase(), pad, pad);
  context.fillStyle = '#ffffff';
  context.font = `780 72px ${FONT_SANS}`;
  let y = pad + 60;
  for (const line of wrapLines(context, item.label, width - pad * 2).slice(0, 2)) {
    context.fillText(line, pad, y);
    y += 80;
  }
  context.fillStyle = 'rgba(255,255,255,0.72)';
  context.font = `450 34px ${FONT_SANS}`;
  y += 24;
  for (const line of wrapLines(context, item.body ?? '', width - pad * 2).slice(0, 5)) {
    context.fillText(line, pad, y);
    y += 50;
  }
};

const panelTexture = (item: CorridorSceneItem) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 / item.aspect);
  drawPanel(canvas, item);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // Web fonts may still be loading on first paint; redraw once they are ready.
  if (item.kind !== 'project') {
    void document.fonts?.ready.then(() => {
      drawPanel(canvas, item);
      texture.needsUpdate = true;
    });
  }
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

  const layout = corridorLayout(items.length, (index) => items[index]?.kind === 'note');
  const curve = buildCurve(layout.tunnelLength + 16);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 140);
  let colors = themeColors(options.dark);
  scene.background = colors.background;
  scene.fog = new THREE.Fog(colors.background, 14, 78);

  const { lineGeometry, faceGeometry } = buildTunnel(curve, layout.tunnelLength);
  const lineMaterial = new THREE.LineBasicMaterial({ color: colors.line, transparent: true, opacity: colors.lineOpacity });
  // Opaque shell facing inward: it hides the outside from within, and turns see-through when a
  // focused shot sits outside the corridor. The offset keeps it behind the grid lines.
  const wallMaterial = new THREE.MeshBasicMaterial({ color: colors.wall, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const walls = new THREE.Mesh(faceGeometry, wallMaterial);
  const grid = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(walls, grid);

  const loader = new THREE.TextureLoader();
  const panels: Panel[] = items.map((item, index) => {
    const surface = layout.surfaces[index]!;
    const onWall = surface === 'left' || surface === 'right';
    const maxWidth = surface === 'end' ? 6.6 : onWall ? 7.2 : 6;
    const maxHeight = surface === 'end' ? 4 : onWall ? 4.4 : 3.6;
    const width = Math.min(maxWidth, maxHeight * item.aspect);
    const height = width / item.aspect;
    const frame = frameAt(curve, layout.itemDistance[index]!);
    const place = placement(frame, surface, height);
    const geometry = new THREE.PlaneGeometry(width, height, 32, 1);
    const material = new THREE.MeshBasicMaterial({ map: panelTexture(item), side: THREE.DoubleSide });
    if (item.image) {
      loader.load(item.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
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
    return { mesh, base: Float32Array.from(geometry.getAttribute('position').array), width, height, normal: place.normal, up: place.up, right: panelRight, bend: 0 };
  });

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.6, 0.82);
  // A light background sits above any bloom threshold and would wash the whole frame out.
  bloom.enabled = options.dark;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let targetProgress = 0;
  let progress = 0;
  let mode: 'walk' | 'focus' | 'dive' = 'walk';
  let focused: number | null = null;
  let diveTarget: number | null = null;
  let hovered: number | null = null;
  let progressFlight: { from: number; to: number; start: number; duration: number } | null = null;
  let cameraFlight: { from: Pose; start: number; duration: number } | null = null;
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

  const walkPose = (): Pose => {
    const distance = CAMERA_START + progress * (layout.cameraEnd - CAMERA_START);
    const frame = frameAt(curve, distance);
    const ahead = frameAt(curve, distance + 6).point;
    const quaternion = lookQuaternion(frame.point, ahead, frame.up);
    if (!reducedMotion) quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-parallax.y * 0.08, -parallax.x * 0.14, 0)));
    return { position: frame.point, quaternion };
  };

  const focusPose = (index: number, diving = false): Pose => {
    const panel = panels[index]!;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const narrow = camera.aspect < 1;
    // Wide screens park the panel on the left half; narrow screens put it above the bottom sheet.
    const share = narrow ? 0.9 : 0.5;
    const distance = diving ? 0.12 : panel.width / (share * 2 * tanHalf * camera.aspect);
    const shift = diving ? new THREE.Vector3()
      : narrow ? panel.up.clone().multiplyScalar(-panel.height * 0.75) : panel.right.clone().multiplyScalar(panel.width * 0.42);
    const target = panel.mesh.position.clone().add(shift);
    const position = target.clone().addScaledVector(panel.normal, distance);
    return { position, quaternion: lookQuaternion(position, target, panel.up) };
  };

  const startCameraFlight = (duration: number) => {
    cameraFlight = { from: { position: camera.position.clone(), quaternion: camera.quaternion.clone() }, start: performance.now(), duration: duration * 1000 };
  };

  const setBend = (panel: Panel, bend: number) => {
    if (Math.abs(panel.bend - bend) < 0.001) return;
    panel.bend = bend;
    const attribute = panel.mesh.geometry.getAttribute('position');
    for (let vertex = 0; vertex < attribute.count; vertex += 1) {
      const x = panel.base[vertex * 3]! / (panel.width / 2);
      // Concave screen: edges lean toward the viewer.
      attribute.setZ(vertex, panel.base[vertex * 3 + 2]! + bend * panel.width * 0.08 * x * x);
    }
    attribute.needsUpdate = true;
  };

  const project = new THREE.Vector3();
  const updatePill = () => {
    if (hovered === null || mode !== 'walk' || progressFlight) {
      pill.style.opacity = '0';
      return;
    }
    project.copy(panels[hovered]!.mesh.position).project(camera);
    pill.style.opacity = project.z < 1 ? '1' : '0';
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
  const tick = (now: number) => {
    const delta = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    const follow = (rate: number) => 1 - Math.exp(-delta * rate);

    if (progressFlight) {
      const t = Math.min(1, (now - progressFlight.start) / progressFlight.duration);
      progress = THREE.MathUtils.lerp(progressFlight.from, progressFlight.to, easeInOutCubic(t));
      if (t >= 1) progressFlight = null;
    } else {
      progress += (targetProgress - progress) * follow(6);
    }
    parallax.lerp(pointerInside ? pointer : rest, follow(3));

    const pose = mode === 'dive' && diveTarget !== null ? focusPose(diveTarget, true) : mode === 'focus' && focused !== null ? focusPose(focused) : walkPose();
    if (cameraFlight) {
      const t = Math.min(1, (now - cameraFlight.start) / cameraFlight.duration);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(cameraFlight.from.position, pose.position, eased);
      camera.quaternion.slerpQuaternions(cameraFlight.from.quaternion, pose.quaternion, eased);
      if (t >= 1) cameraFlight = null;
    } else if (mode === 'walk') {
      camera.position.lerp(pose.position, follow(12));
      camera.quaternion.slerp(pose.quaternion, follow(12));
    } else {
      camera.position.copy(pose.position);
      camera.quaternion.copy(pose.quaternion);
    }

    panels.forEach((panel, index) => setBend(panel, panel.bend + ((mode === 'focus' && index === focused ? 1 : 0) - panel.bend) * follow(4)));

    if (mode === 'walk' && pointerInside && !progressFlight && now - lastPick > 50) {
      lastPick = now;
      setHovered(pick(client.x, client.y));
    }
    updatePill();
    composer.render(delta);
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);

  return {
    setProgress: (next) => {
      targetProgress = THREE.MathUtils.clamp(next, 0, 1);
      if (!progressFlight) return;
      // A scroll that does not match the running flight is the user taking over.
      if (Math.abs(targetProgress - progressFlight.to) > 0.002) progressFlight = null;
    },
    flyTo: (next) => {
      const to = THREE.MathUtils.clamp(next, 0, 1);
      targetProgress = to;
      progressFlight = { from: progress, to, start: performance.now(), duration: flightSeconds(progress, to) * 1000 };
    },
    focus: (index) => {
      if (index === focused && mode === (index === null ? 'walk' : 'focus')) return;
      startCameraFlight(index === null ? 1.1 : 1.4);
      focused = index;
      mode = index === null ? 'walk' : 'focus';
      if (index !== null) setHovered(null);
    },
    dive: (index) => {
      startCameraFlight(1.1);
      mode = 'dive';
      diveTarget = index;
      setHovered(null);
      return new Promise((resolve) => { window.setTimeout(resolve, 1050); });
    },
    setTheme: (dark) => {
      colors = themeColors(dark);
      scene.background = colors.background;
      (scene.fog as THREE.Fog).color = colors.background;
      wallMaterial.color = colors.wall;
      lineMaterial.color = colors.line;
      lineMaterial.opacity = colors.lineOpacity;
      bloom.enabled = dark;
    },
    dispose: () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);
      lineGeometry.dispose();
      faceGeometry.dispose();
      lineMaterial.dispose();
      wallMaterial.dispose();
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
