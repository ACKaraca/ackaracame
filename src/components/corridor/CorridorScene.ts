import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CAMERA_START, SPACING, corridorLayout, easeInOutCubic, flightSeconds, type CorridorLayout, type Placement, type Surface } from './corridorLayout';
import {
  CELL, HALF_HEIGHT, HALF_WIDTH, branchCurve, buildShell, frameAt, mainCurve, panelTexture, placement, sharedHaloTexture,
  type Hole, type PanelArt,
} from './corridorGeometry';

export interface CorridorSceneItem extends PanelArt {
  image?: string;
  placement?: Placement;
  /** Main-corridor project panels sit in front of a doorway that opens into their own corridor. */
  door?: boolean;
  /** An extra gallery image hung overhead between items; it opens this item. */
  extra?: { image: string; aspect: number };
}

export interface CorridorSceneOptions {
  container: HTMLElement;
  pill: HTMLElement;
  items: CorridorSceneItem[];
  dark: boolean;
  reducedMotion: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  /** Click on the focused panel itself. */
  onActivate: (index: number) => void;
  /** Click on empty space around a focused panel. */
  onDismiss: () => void;
}

export interface CorridorScene {
  /** Follow the scroll position (smoothed) in the corridor you are in. */
  setProgress: (progress: number) => void;
  /** Fly along the current corridor to a progress value with an eased, timed flight. */
  flyTo: (progress: number) => void;
  focus: (index: number | null) => void;
  dive: (index: number) => Promise<void>;
  /** Slide a main-corridor panel away and fly into a new corridor behind it. */
  enterBranch: (index: number, items: CorridorSceneItem[]) => Promise<void>;
  /** Walk back out of the side corridor; resolves once the main corridor is active again. */
  exitBranch: () => Promise<void>;
  setTheme: (dark: boolean) => void;
  dispose: () => void;
}

const FOV = 62;

interface Pose { position: THREE.Vector3; quaternion: THREE.Quaternion }

interface Panel {
  index: number;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  base: Float32Array;
  width: number;
  height: number;
  home: THREE.Vector3;
  normal: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
  bend: number;
  glow: number;
  slide: number;
  slideTarget: number;
}

interface Corridor {
  curve: THREE.Curve<THREE.Vector3>;
  layout: CorridorLayout;
  group: THREE.Group;
  panels: Panel[];
  pickables: THREE.Mesh[];
  doors: Map<number, { group: THREE.Group; start: THREE.Vector3; direction: THREE.Vector3 }>;
  progress: number;
  target: number;
  flight: { from: number; to: number; start: number; duration: number } | null;
}

const themeColors = (dark: boolean) => ({
  background: new THREE.Color(dark ? '#030303' : '#f3f2ee'),
  wall: new THREE.Color(dark ? '#0d0c0c' : '#ebe9e3'),
  line: new THREE.Color(dark ? '#ffffff' : '#111111'),
  lineOpacity: dark ? 0.82 : 0.5,
});

const lookQuaternion = (eye: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eye, target, up));

// Panels sit a touch below full brightness so bright screenshots do not blow out under bloom.
const REST_TONE = 0.8;
const HOVER_TONE = 0.93;

export const createCorridorScene = (options: CorridorSceneOptions): CorridorScene => {
  const { container, pill, reducedMotion } = options;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 160);
  let colors = themeColors(options.dark);
  scene.background = colors.background;
  scene.fog = new THREE.Fog(colors.background, 14, 78);

  const lineMaterial = new THREE.LineBasicMaterial({ color: colors.line, transparent: true, opacity: colors.lineOpacity });
  // Inward-facing opaque shell: hides the outside from within, and turns see-through when a
  // focused shot sits outside the corridor. The offset keeps it behind the grid lines.
  const wallMaterial = new THREE.MeshBasicMaterial({ color: colors.wall, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const loader = new THREE.TextureLoader();
  const disposables = new Set<{ dispose: () => void }>();
  const own = <T extends { dispose: () => void }>(value: T) => { disposables.add(value); return value; };

  const makePanel = (art: PanelArt, image: string | undefined, surface: Surface, distance: number, curve: THREE.Curve<THREE.Vector3>, index: number) => {
    const onWall = surface === 'left' || surface === 'right';
    const maxWidth = surface === 'end' ? 6.6 : onWall ? 6.4 : 5.6;
    const maxHeight = surface === 'end' ? 4 : onWall ? 4.2 : 3.4;
    const width = Math.min(maxWidth, maxHeight * art.aspect);
    const height = width / art.aspect;
    const place = placement(frameAt(curve, distance), surface, height);
    const geometry = own(new THREE.PlaneGeometry(width, height, 32, 1));
    const material = own(new THREE.MeshBasicMaterial({ map: own(panelTexture(art)), side: THREE.DoubleSide }));
    material.color.setScalar(REST_TONE);
    if (image) {
      loader.load(image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        material.map?.dispose();
        material.map = own(texture);
        material.needsUpdate = true;
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    const right = new THREE.Vector3().crossVectors(place.up, place.normal).normalize();
    const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, place.up, place.normal));
    mesh.position.copy(place.center);
    mesh.quaternion.copy(rotation);
    mesh.userData.index = index;
    const haloMaterial = own(new THREE.MeshBasicMaterial({
      map: sharedHaloTexture(), color: new THREE.Color(art.palette[0] ?? '#ffffff'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const halo = new THREE.Mesh(own(new THREE.PlaneGeometry(width * 1.6 + 1.2, height * 1.6 + 1.2)), haloMaterial);
    halo.quaternion.copy(rotation);
    halo.position.copy(place.center).addScaledVector(place.normal, -0.12);
    const panel: Panel = {
      index, mesh, halo, base: Float32Array.from(geometry.getAttribute('position').array), width, height,
      home: place.center.clone(), normal: place.normal, up: place.up, right, bend: 0, glow: 0, slide: 0, slideTarget: 0,
    };
    return panel;
  };

  const buildCorridor = (curve: THREE.Curve<THREE.Vector3>, layout: CorridorLayout, items: CorridorSceneItem[]): Corridor => {
    const group = new THREE.Group();
    const panels = items.map((item, index) => makePanel(item, item.image, layout.surfaces[index]!, layout.itemDistance[index]!, curve, index));
    const extras: Panel[] = [];
    let overhead = 0;
    items.forEach((item, index) => {
      const distance = layout.itemDistance[index]! + SPACING / 2;
      if (!item.extra || index >= items.length - 1) return;
      const surface: Surface = overhead++ % 2 === 0 ? 'ceiling' : 'floor';
      extras.push(makePanel({ ...item, kind: 'image', aspect: item.extra.aspect }, item.extra.image, surface, distance, curve, index));
    });

    const holes: Hole[] = [];
    const doorInfo = new Map<number, { start: THREE.Vector3; direction: THREE.Vector3 }>();
    items.forEach((item, index) => {
      const surface = layout.surfaces[index];
      if (!item.door || (surface !== 'left' && surface !== 'right')) return;
      const distance = layout.itemDistance[index]!;
      const half = panels[index]!.width / 2;
      holes.push({ side: surface, from: Math.floor((distance - half) / CELL) * CELL, to: Math.ceil((distance + half) / CELL) * CELL, key: index });
      const frame = frameAt(curve, distance);
      const sign = surface === 'left' ? -1 : 1;
      doorInfo.set(index, { start: frame.point.clone().addScaledVector(frame.right, sign * HALF_WIDTH), direction: frame.right.clone().multiplyScalar(sign) });
    });

    const parts = buildShell(curve, layout.tunnelLength, holes);
    const doors = new Map<number, { group: THREE.Group; start: THREE.Vector3; direction: THREE.Vector3 }>();
    parts.forEach((part, key) => {
      own(part.faces);
      own(part.lines);
      const piece = new THREE.Group();
      piece.add(new THREE.Mesh(part.faces, wallMaterial), new THREE.LineSegments(part.lines, lineMaterial));
      group.add(piece);
      const info = doorInfo.get(key);
      if (info) doors.set(key, { group: piece, ...info });
    });
    [...panels, ...extras].forEach((panel) => group.add(panel.halo, panel.mesh));
    scene.add(group);
    return {
      curve, layout, group, panels: [...panels, ...extras], pickables: [...panels, ...extras].map((panel) => panel.mesh), doors,
      progress: 0, target: 0, flight: null,
    };
  };

  const placementOf = (items: CorridorSceneItem[]) => (index: number) => items[index]?.placement ?? 'wall';
  const mainLayout = corridorLayout(options.items.length, placementOf(options.items));
  const main = buildCorridor(mainCurve(mainLayout.tunnelLength + 16), mainLayout, options.items);
  let branch: { corridor: Corridor; parent: number } | null = null;
  let active = main;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.6, 0.88);
  // A light background sits above any bloom threshold and would wash the whole frame out.
  bloom.enabled = options.dark;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let mode: 'walk' | 'focus' | 'dive' | 'transit' = 'walk';
  let focused: number | null = null;
  let diveTarget: number | null = null;
  let hovered: Panel | null = null;
  let cameraFlight: { from: Pose; start: number; duration: number } | null = null;
  // Holds the camera still while a door opens, before the flight through it starts.
  let holdCamera = false;
  const pointer = new THREE.Vector2(0, 0);
  const client = { x: 0, y: 0 };
  const rest = new THREE.Vector2(0, 0);
  const parallax = new THREE.Vector2(0, 0);
  let pointerInside = false;
  const raycaster = new THREE.Raycaster();
  const timers = new Set<number>();
  const later = (ms: number) => new Promise<void>((resolve) => {
    const id = window.setTimeout(() => { timers.delete(id); resolve(); }, ms);
    timers.add(id);
  });

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

  const walkPose = (corridor: Corridor): Pose => {
    const distance = CAMERA_START + corridor.progress * (corridor.layout.cameraEnd - CAMERA_START);
    const frame = frameAt(corridor.curve, distance);
    const ahead = frameAt(corridor.curve, distance + 6).point;
    const quaternion = lookQuaternion(frame.point, ahead, frame.up);
    if (!reducedMotion) quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-parallax.y * 0.08, -parallax.x * 0.14, 0)));
    return { position: frame.point, quaternion };
  };

  const focusPose = (corridor: Corridor, index: number, diving = false): Pose => {
    const panel = corridor.panels[index]!;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const narrow = camera.aspect < 1;
    // Wide screens park the panel on the left half; narrow screens put it above the bottom sheet.
    const share = narrow ? 0.9 : 0.5;
    const distance = diving ? 0.12 : panel.width / (share * 2 * tanHalf * camera.aspect);
    const shift = diving ? new THREE.Vector3()
      : narrow ? panel.up.clone().multiplyScalar(-panel.height * 0.75) : panel.right.clone().multiplyScalar(panel.width * 0.42);
    const target = panel.home.clone().add(shift);
    const position = target.clone().addScaledVector(panel.normal, distance);
    return { position, quaternion: lookQuaternion(position, target, panel.up) };
  };

  const startCameraFlight = (seconds: number) => {
    cameraFlight = { from: { position: camera.position.clone(), quaternion: camera.quaternion.clone() }, start: performance.now(), duration: seconds * 1000 };
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

  const projected = new THREE.Vector3();
  const updatePill = () => {
    if (!hovered || mode !== 'walk' || active.flight) {
      pill.style.opacity = '0';
      return;
    }
    projected.copy(hovered.mesh.position).project(camera);
    pill.style.opacity = projected.z < 1 ? '1' : '0';
    pill.style.transform = `translate(${((projected.x + 1) / 2) * container.clientWidth}px, ${((1 - projected.y) / 2) * container.clientHeight}px) translate(-50%, -50%)`;
  };

  const pick = (clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1), camera);
    const hit = raycaster.intersectObjects(active.pickables, false)[0];
    if (!hit || hit.distance > 40) return null;
    return active.panels.find((panel) => panel.mesh === hit.object) ?? null;
  };

  const setHovered = (panel: Panel | null) => {
    if (panel === hovered) return;
    const changedIndex = panel?.index !== hovered?.index;
    hovered = panel;
    container.style.cursor = panel ? 'pointer' : '';
    if (changedIndex) options.onHover(panel?.index ?? null);
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
    const panel = pick(event.clientX, event.clientY);
    if (mode === 'walk') {
      if (panel) options.onSelect(panel.index);
      return;
    }
    if (mode !== 'focus' || cameraFlight) return;
    const current = focused !== null ? active.panels[focused] : null;
    if (panel && current && panel.mesh === current.mesh) options.onActivate(panel.index);
    else options.onDismiss();
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

    if (active.flight) {
      const t = Math.min(1, (now - active.flight.start) / active.flight.duration);
      active.progress = THREE.MathUtils.lerp(active.flight.from, active.flight.to, easeInOutCubic(t));
      if (t >= 1) active.flight = null;
    } else {
      active.progress += (active.target - active.progress) * follow(6);
    }
    parallax.lerp(pointerInside ? pointer : rest, follow(3));

    const pose = mode === 'dive' && diveTarget !== null ? focusPose(active, diveTarget, true)
      : mode === 'focus' && focused !== null ? focusPose(active, focused) : walkPose(active);
    if (cameraFlight) {
      const t = Math.min(1, (now - cameraFlight.start) / cameraFlight.duration);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(cameraFlight.from.position, pose.position, eased);
      camera.quaternion.slerpQuaternions(cameraFlight.from.quaternion, pose.quaternion, eased);
      if (t >= 1) cameraFlight = null;
    } else if (holdCamera) {
      // Stay put.
    } else if (mode === 'walk' || mode === 'transit') {
      camera.position.lerp(pose.position, follow(12));
      camera.quaternion.slerp(pose.quaternion, follow(12));
    } else {
      camera.position.copy(pose.position);
      camera.quaternion.copy(pose.quaternion);
    }

    const updatePanel = (panel: Panel) => {
      const isFocused = mode === 'focus' && panel.index === focused && panel === active.panels[panel.index];
      setBend(panel, panel.bend + ((isFocused ? 1 : 0) - panel.bend) * follow(4));
      panel.glow += ((panel === hovered ? 1 : 0) - panel.glow) * follow(8);
      panel.mesh.material.color.setScalar(REST_TONE + (HOVER_TONE - REST_TONE) * panel.glow);
      panel.halo.material.opacity = 0.12 + 0.55 * panel.glow;
      panel.slide += (panel.slideTarget - panel.slide) * follow(3.5);
      const drop = easeInOutCubic(Math.min(1, Math.max(0, panel.slide))) * (panel.height / 2 + HALF_HEIGHT + 0.6);
      panel.mesh.position.copy(panel.home).addScaledVector(panel.up, -drop);
      panel.halo.position.copy(panel.mesh.position).addScaledVector(panel.normal, -0.12);
    };
    main.panels.forEach(updatePanel);
    branch?.corridor.panels.forEach(updatePanel);

    if (mode === 'walk' && pointerInside && !active.flight && now - lastPick > 50) {
      lastPick = now;
      setHovered(pick(client.x, client.y));
    } else if (mode !== 'walk' && hovered) {
      setHovered(null);
    }
    updatePill();
    composer.render(delta);
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);

  const disposeCorridor = (corridor: Corridor) => {
    scene.remove(corridor.group);
    corridor.group.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        const geometry = object.geometry as THREE.BufferGeometry;
        geometry.dispose();
        disposables.delete(geometry);
        const material = object.material as THREE.Material & { map?: THREE.Texture | null };
        if (material === wallMaterial || material === lineMaterial) return;
        if (material.map && material.map !== sharedHaloTexture()) {
          material.map.dispose();
          disposables.delete(material.map);
        }
        material.dispose();
        disposables.delete(material);
      }
    });
  };

  return {
    setProgress: (next) => {
      active.target = THREE.MathUtils.clamp(next, 0, 1);
      // A scroll that does not match the running flight is the user taking over.
      if (active.flight && Math.abs(active.target - active.flight.to) > 0.002) active.flight = null;
    },
    flyTo: (next) => {
      const to = THREE.MathUtils.clamp(next, 0, 1);
      active.target = to;
      active.flight = { from: active.progress, to, start: performance.now(), duration: flightSeconds(active.progress, to) * 1000 };
    },
    focus: (index) => {
      if (mode === 'transit' || (index === focused && mode === (index === null ? 'walk' : 'focus'))) return;
      startCameraFlight(index === null ? 1.1 : 1.4);
      focused = index;
      mode = index === null ? 'walk' : 'focus';
    },
    dive: (index) => {
      startCameraFlight(1.1);
      mode = 'dive';
      diveTarget = index;
      return later(1050);
    },
    enterBranch: async (index, items) => {
      const door = main.doors.get(index);
      const panel = main.panels[index];
      if (!door || !panel || active !== main) return;
      if (branch) disposeCorridor(branch.corridor);
      const layout = corridorLayout(items.length, placementOf(items));
      const corridor = buildCorridor(branchCurve(door.start, door.direction, layout.tunnelLength + 16), layout, items);
      branch = { corridor, parent: index };
      mode = 'transit';
      focused = null;
      panel.slideTarget = 1;
      door.group.visible = false;
      active = corridor;
      holdCamera = true;
      await later(350);
      holdCamera = false;
      startCameraFlight(1.9);
      await later(1900);
      if (active === corridor) mode = 'walk';
    },
    exitBranch: async () => {
      if (!branch || active !== branch.corridor) return;
      const { corridor, parent } = branch;
      mode = 'transit';
      focused = null;
      if (corridor.progress > 0.01) {
        const seconds = flightSeconds(corridor.progress, 0);
        corridor.target = 0;
        corridor.flight = { from: corridor.progress, to: 0, start: performance.now(), duration: seconds * 1000 };
        await later(seconds * 1000);
      }
      active = main;
      startCameraFlight(1.7);
      void later(1700).then(async () => {
        if (active !== main) return;
        mode = 'walk';
        const panel = main.panels[parent];
        if (panel) panel.slideTarget = 0;
        await later(1100);
        if (branch?.corridor !== corridor) return;
        main.doors.get(parent)!.group.visible = true;
        disposeCorridor(corridor);
        branch = null;
      });
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
      timers.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);
      disposables.forEach((item) => item.dispose());
      sharedHaloTexture().dispose();
      lineMaterial.dispose();
      wallMaterial.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
