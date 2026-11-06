import { describe, expect, it } from 'vitest';
import { activeIndexFor, corridorLayout } from './corridorLayout';

describe('corridorLayout', () => {
  it('spreads stops monotonically across the scroll and ends on the facing panel', () => {
    const { stops, surfaces } = corridorLayout(16);
    expect(stops[0]).toBeGreaterThanOrEqual(0);
    expect(stops.at(-1)).toBe(1);
    stops.slice(1).forEach((stop, index) => expect(stop).toBeGreaterThan(stops[index]!));
    expect(surfaces.at(-1)).toBe('end');
    expect(surfaces.slice(0, -1)).not.toContain('end');
  });

  it('maps every stop back to its own item', () => {
    const { stops } = corridorLayout(9);
    stops.forEach((stop, index) => expect(activeIndexFor(stop, stops)).toBe(index));
    expect(activeIndexFor(0, stops)).toBe(0);
    expect(activeIndexFor(1, stops)).toBe(8);
  });
});
