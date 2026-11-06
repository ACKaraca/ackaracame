import * as THREE from 'three';
import type { Surface } from './corridorLayout';

export const HALF_WIDTH = 4.5;
export const HALF_HEIGHT = 3;
export const CELL = 1.5;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

export interface Frame { point: THREE.Vector3; tangent: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 }

export const frameAt = (curve: THREE.Curve<THREE.Vector3>, distance: number): Frame => {
  const u = THREE.MathUtils.clamp(distance / curve.getLength(), 0, 1);
  const point = curve.getPointAt(u);
  const tangent = curve.getTangentAt(u).normalize();
  const right = new THREE.Vector3().crossVectors(tangent, WORLD_UP).normalize();
  const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
  return { point, tangent, right, up };
};

/** The main corridor: a gentle S-curve heading down -z. */
export const mainCurve = (length: number) => {
  const points: THREE.Vector3[] = [];
  const count = Math.ceil(length / 16) + 3;
  for (let index = 0; index < count; index += 1) {
    points.push(new THREE.Vector3(Math.sin(index * 0.9) * 5, Math.sin(index * 0.55) * 1.5, -index * 16 + 16));
  }
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
};

/** A level side corridor leaving a wall straight, then meandering. */
export const branchCurve = (start: THREE.Vector3, direction: THREE.Vector3, length: number) => {
  const forward = direction.clone().setY(0).normalize();
  const lateral = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize();
  const points: THREE.Vector3[] = [];
  const count = Math.ceil(length / 16) + 3;
  for (let index = 0; index < count; index += 1) {
    const sway = index < 2 ? 0 : Math.sin((index - 1) * 0.8) * 3;
    points.push(start.clone().addScaledVector(forward, index * 16).addScaledVector(lateral, sway));
  }
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
};

type Side = 'left' | 'right' | 'floor' | 'ceiling';

/** A doorway cut into a side wall between two distances; its cells are built as a separate plug. */
export interface Hole { side: 'left' | 'right'; from: number; to: number; key: number }

const SIDES: Array<{ side: Side; start: [number, number]; end: [number, number] }> = [
  { side: 'floor', start: [-HALF_WIDTH, -HALF_HEIGHT], end: [HALF_WIDTH, -HALF_HEIGHT] },
  { side: 'right', start: [HALF_WIDTH, -HALF_HEIGHT], end: [HALF_WIDTH, HALF_HEIGHT] },
  { side: 'ceiling', start: [HALF_WIDTH, HALF_HEIGHT], end: [-HALF_WIDTH, HALF_HEIGHT] },
  { side: 'left', start: [-HALF_WIDTH, HALF_HEIGHT], end: [-HALF_WIDTH, -HALF_HEIGHT] },
];

class Buckets {
  readonly lines = new Map<number, number[]>();
  readonly faces = new Map<number, number[]>();
  line(key: number, a: THREE.Vector3, b: THREE.Vector3) {
    const list = this.lines.get(key) ?? [];
    list.push(a.x, a.y, a.z, b.x, b.y, b.z);
    this.lines.set(key, list);
  }
  quad(key: number, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) {
    const list = this.faces.get(key) ?? [];
    list.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    this.faces.set(key, list);
  }
}

export interface ShellPart { lines: THREE.BufferGeometry; faces: THREE.BufferGeometry }

const toGeometry = (values: number[] | undefined) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(values ?? [], 3));
  return geometry;
};

/**
 * Rectangular corridor shell: inward-facing opaque cells plus the wire grid on top.
 * Cells and grid inside a hole go to that hole's own part so it can be hidden to open a doorway.
 * Key -1 is the permanent shell.
 */
export const buildShell = (curve: THREE.Curve<THREE.Vector3>, length: number, holes: Hole[] = []) => {
  const frames: Frame[] = [];
  for (let distance = 0; distance <= length; distance += CELL) frames.push(frameAt(curve, distance));
  const at = (frame: Frame, x: number, y: number) => frame.point.clone().addScaledVector(frame.right, x).addScaledVector(frame.up, y);
  const owner = (side: Side, distance: number) => holes.find((hole) => hole.side === side && distance > hole.from && distance < hole.to)?.key ?? -1;
  const buckets = new Buckets();

  frames.forEach((frame, index) => {
    const distance = index * CELL;
    const next = frames[index + 1];
    for (const { side, start, end } of SIDES) {
      const steps = Math.round(Math.hypot(end[0] - start[0], end[1] - start[1]) / CELL);
      const across = (step: number): [number, number] => [
        THREE.MathUtils.lerp(start[0], end[0], step / steps),
        THREE.MathUtils.lerp(start[1], end[1], step / steps),
      ];
      for (let step = 0; step < steps; step += 1) {
        const [x0, y0] = across(step);
        const [x1, y1] = across(step + 1);
        // Ring segment across this cell at the current frame.
        buckets.line(owner(side, distance), at(frame, x0, y0), at(frame, x1, y1));
        if (!next) continue;
        const cellOwner = owner(side, distance + CELL / 2);
        buckets.quad(cellOwner, at(frame, x0, y0), at(frame, x1, y1), at(next, x1, y1), at(next, x0, y0));
        // Rail along the corridor; the side's first rail is a corner and stays as the door frame.
        buckets.line(step === 0 ? -1 : cellOwner, at(frame, x0, y0), at(next, x0, y0));
      }
    }
  });

  const keys = new Set<number>([-1, ...holes.map((hole) => hole.key)]);
  const parts = new Map<number, ShellPart>();
  keys.forEach((key) => parts.set(key, { lines: toGeometry(buckets.lines.get(key)), faces: toGeometry(buckets.faces.get(key)) }));
  return parts;
};

/** Panels lie flush on their surface, inset enough to clear the wall where the corridor bends. */
export const placement = (frame: Frame, surface: Surface, height: number) => {
  const { point, tangent, right, up } = frame;
  switch (surface) {
    case 'left': return { center: point.clone().addScaledVector(right, -HALF_WIDTH + 0.45), normal: right.clone(), up: up.clone() };
    case 'right': return { center: point.clone().addScaledVector(right, HALF_WIDTH - 0.45), normal: right.clone().negate(), up: up.clone() };
    case 'ceiling': return { center: point.clone().addScaledVector(up, HALF_HEIGHT - 0.3), normal: up.clone().negate(), up: tangent.clone().negate() };
    case 'floor': return { center: point.clone().addScaledVector(up, -HALF_HEIGHT + 0.3), normal: up.clone(), up: tangent.clone() };
    default: return { center: point.clone().addScaledVector(up, Math.min(0.3, HALF_HEIGHT - height / 2 - 0.3)), normal: tangent.clone().negate(), up: up.clone() };
  }
};

export interface PanelArt {
  label: string;
  kind: 'image' | 'note' | 'page';
  aspect: number;
  palette: string[];
  eyebrow?: string;
  body?: string;
}

const FONT_SANS = '"Manrope Variable", system-ui, sans-serif';
const FONT_MONO = 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace';

const wrapLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/u)) {
    let line = '';
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

/** Largest font size (stepping down) at which the text fits the given number of lines. */
const fitText = (context: CanvasRenderingContext2D, text: string, weight: number, sizes: number[], maxWidth: number, maxLines: number) => {
  for (const size of sizes) {
    context.font = `${weight} ${size}px ${FONT_SANS}`;
    const lines = wrapLines(context, text, maxWidth);
    if (lines.length <= maxLines) return { size, lines };
  }
  const size = sizes[sizes.length - 1]!;
  context.font = `${weight} ${size}px ${FONT_SANS}`;
  const lines = wrapLines(context, text, maxWidth).slice(0, maxLines);
  lines[maxLines - 1] = `${lines[maxLines - 1]?.replace(/\s+\S*$/u, '') ?? ''}…`;
  return { size, lines };
};

const drawPanel = (canvas: HTMLCanvasElement, art: PanelArt) => {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  art.palette.forEach((color, index) => gradient.addColorStop(index / Math.max(1, art.palette.length - 1), color));
  if (art.kind === 'image') {
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    return;
  }
  context.fillStyle = '#0a0a0a';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = gradient;
  context.lineWidth = art.kind === 'page' ? 20 : 8;
  context.strokeRect(30, 30, width - 60, height - 60);
  context.fillStyle = '#ececec';
  if (art.kind === 'page') {
    // Portal: a glowing frame with the destination name.
    const { size, lines } = fitText(context, art.label.toLocaleUpperCase(), 780, [240, 200, 160, 128, 100], width - 260, 2);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    lines.forEach((line, index) => context.fillText(line, width / 2, height / 2 + (index - (lines.length - 1) / 2) * size * 1.05));
    return;
  }
  // Note: editorial text card sized for reading at a distance.
  const pad = 110;
  const inner = width - pad * 2;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = art.palette[0] ?? '#ececec';
  context.font = `700 34px ${FONT_MONO}`;
  context.fillText((art.eyebrow ?? '').toLocaleUpperCase(), pad, pad, inner);
  let y = pad + 70;
  context.fillStyle = '#ececec';
  const title = fitText(context, art.label, 780, [112, 96, 84, 72, 62], inner, 3);
  title.lines.forEach((line) => {
    context.fillText(line, pad, y);
    y += title.size * 1.08;
  });
  if (!art.body) return;
  y += 34;
  const bodyLines = Math.max(1, Math.floor((height - pad - y) / 64));
  context.fillStyle = 'rgba(236,236,236,0.74)';
  const body = fitText(context, art.body, 460, [48, 44, 40], inner, bodyLines);
  body.lines.forEach((line) => {
    context.fillText(line, pad, y);
    y += body.size * 1.42;
  });
};

export const panelTexture = (art: PanelArt) => {
  const canvas = document.createElement('canvas');
  canvas.width = art.kind === 'image' ? 512 : 1600;
  canvas.height = Math.round(canvas.width / art.aspect);
  drawPanel(canvas, art);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  // Web fonts may still be loading on first paint; redraw once they are ready.
  if (art.kind !== 'image') {
    void document.fonts?.ready.then(() => {
      drawPanel(canvas, art);
      texture.needsUpdate = true;
    });
  }
  return texture;
};

let haloTexture: THREE.CanvasTexture | null = null;
/** Soft white rounded glow, tinted per panel through the material colour. */
export const sharedHaloTexture = () => {
  if (haloTexture) return haloTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    context.filter = 'blur(26px)';
    context.fillStyle = '#ffffff';
    context.fillRect(56, 56, 144, 144);
  }
  haloTexture = new THREE.CanvasTexture(canvas);
  return haloTexture;
};
