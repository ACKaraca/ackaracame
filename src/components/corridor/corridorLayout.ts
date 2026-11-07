// Pure layout math for the corridor, kept free of three.js so SSR and tests can use it.

export type Surface = 'left' | 'right' | 'ceiling' | 'floor' | 'end';
export type Placement = 'wall' | 'overhead';

export const SPACING = 11;
/** Tighter rhythm for text-heavy corridors (sub-pages and project corridors). */
export const DENSE_SPACING = 9;
export const FIRST_ITEM_AT = 20;
export const CAMERA_START = 2;
/** Gap between neighbouring items of a tight group, as a share of the spacing. */
export const TIGHT_GAP = 0.4;
const LEAD = 8;
const END_VIEW_DISTANCE = 8;

export interface CorridorLayout {
  spacing: number;
  /** Distance along the curve where each item hangs. */
  itemDistance: number[];
  surfaces: Surface[];
  /** Scroll progress (0..1) at which each item is the active one. */
  stops: number[];
  cameraEnd: number;
  tunnelLength: number;
}

/**
 * Wall items alternate left/right among themselves, overhead items alternate ceiling/floor,
 * and the last item faces the camera at the end of the corridor. Neighbouring `tight` items
 * (a group of related notes) hang closer together.
 */
export const corridorLayout = (
  count: number,
  placement: (index: number) => Placement = () => 'wall',
  spacing = SPACING,
  tight: (index: number) => boolean = () => false,
): CorridorLayout => {
  const itemDistance: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const previous = itemDistance[index - 1];
    itemDistance.push(previous === undefined ? FIRST_ITEM_AT
      : previous + (tight(index) && tight(index - 1) ? spacing * TIGHT_GAP : spacing));
  }
  const last = itemDistance[count - 1] ?? FIRST_ITEM_AT;
  const cameraEnd = Math.max(CAMERA_START + 1, last - END_VIEW_DISTANCE);
  const span = cameraEnd - CAMERA_START;
  let walls = 0;
  let overheads = 0;
  const surfaces = itemDistance.map((_, index): Surface => {
    if (index === count - 1) return 'end';
    if (placement(index) === 'overhead') return overheads++ % 2 === 0 ? 'ceiling' : 'floor';
    return walls++ % 2 === 0 ? 'right' : 'left';
  });
  const stops = itemDistance.map((distance, index) => {
    const lead = index === count - 1 ? END_VIEW_DISTANCE : LEAD;
    return Math.min(1, Math.max(0, (distance - lead - CAMERA_START) / span));
  });
  return { spacing, itemDistance, surfaces, stops, cameraEnd, tunnelLength: last + 12 };
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

/** HUD title scale so long headings stay within two or three lines. */
export const titleScale = (title: string) => {
  const length = title.length;
  if (length > 40) return 0.42;
  if (length > 26) return 0.55;
  if (length > 16) return 0.72;
  return 1;
};
