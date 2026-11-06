// Pure layout math for the corridor, kept free of three.js so SSR and tests can use it.

export type Surface = 'left' | 'right' | 'ceiling' | 'floor' | 'end';

export const SPACING = 14;
export const FIRST_ITEM_AT = 20;
export const CAMERA_START = 2;
const LEAD = 8;
const END_VIEW_DISTANCE = 8;
const SURFACE_CYCLE: Surface[] = ['right', 'left', 'ceiling', 'left', 'right', 'floor'];

export interface CorridorLayout {
  /** Distance along the curve where each item hangs. */
  itemDistance: number[];
  surfaces: Surface[];
  /** Scroll progress (0..1) at which each item is the active one. */
  stops: number[];
  cameraEnd: number;
  tunnelLength: number;
}

/** `wallOnly` items (text panels) stay on the side walls so they read head-on. */
export const corridorLayout = (count: number, wallOnly: (index: number) => boolean = () => false): CorridorLayout => {
  const itemDistance = Array.from({ length: count }, (_, index) => FIRST_ITEM_AT + index * SPACING);
  const last = itemDistance[count - 1] ?? FIRST_ITEM_AT;
  const cameraEnd = Math.max(CAMERA_START + 1, last - END_VIEW_DISTANCE);
  const span = cameraEnd - CAMERA_START;
  const surfaces = itemDistance.map((_, index): Surface => {
    if (index === count - 1) return 'end';
    if (wallOnly(index)) return index % 2 === 0 ? 'right' : 'left';
    return SURFACE_CYCLE[index % SURFACE_CYCLE.length]!;
  });
  const stops = itemDistance.map((distance, index) => {
    const lead = index === count - 1 ? END_VIEW_DISTANCE : LEAD;
    return Math.min(1, Math.max(0, (distance - lead - CAMERA_START) / span));
  });
  return { itemDistance, surfaces, stops, cameraEnd, tunnelLength: last + 12 };
};

export const activeIndexFor = (progress: number, stops: number[]): number => {
  let best = 0;
  for (let index = 1; index < stops.length; index += 1) {
    if (Math.abs(stops[index]! - progress) < Math.abs(stops[best]! - progress)) best = index;
  }
  return best;
};

/** Smooth start and stop for camera flights. */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Longer jumps along the corridor get more flight time, within a readable range. */
export const flightSeconds = (fromProgress: number, toProgress: number) =>
  Math.min(2.6, 0.9 + Math.abs(toProgress - fromProgress) * 3.2);
