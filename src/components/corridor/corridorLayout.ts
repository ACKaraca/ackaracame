// Pure layout math for the corridor, kept free of three.js so SSR and tests can use it.

export type Surface = 'left' | 'right' | 'ceiling' | 'floor' | 'end';

export const SPACING = 14;
export const FIRST_ITEM_AT = 20;
export const CAMERA_START = 2;
const LEAD = 8;
const END_VIEW_DISTANCE = 8;
const SURFACE_CYCLE: Surface[] = ['left', 'right', 'ceiling', 'right', 'left', 'floor'];

export interface CorridorLayout {
  /** Distance along the curve where each item hangs. */
  itemDistance: number[];
  surfaces: Surface[];
  /** Scroll progress (0..1) at which each item is the active one. */
  stops: number[];
  cameraEnd: number;
  tunnelLength: number;
}

export const corridorLayout = (count: number): CorridorLayout => {
  const itemDistance = Array.from({ length: count }, (_, index) => FIRST_ITEM_AT + index * SPACING);
  const last = itemDistance[count - 1] ?? FIRST_ITEM_AT;
  const cameraEnd = Math.max(CAMERA_START + 1, last - END_VIEW_DISTANCE);
  const span = cameraEnd - CAMERA_START;
  const surfaces = itemDistance.map((_, index) => (index === count - 1 ? 'end' : SURFACE_CYCLE[index % SURFACE_CYCLE.length]!));
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
