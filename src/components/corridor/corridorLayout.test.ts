import { describe, expect, it } from 'vitest';
import { activeIndexFor, corridorLayout, easeInOutCubic, flightSeconds, titleScale } from './corridorLayout';

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

  it('alternates wall items left/right and overhead items ceiling/floor', () => {
    const { surfaces } = corridorLayout(7, (index) => (index >= 4 ? 'overhead' : 'wall'));
    expect(surfaces).toEqual(['right', 'left', 'right', 'left', 'ceiling', 'floor', 'end']);
  });

  it('hangs neighbouring tight items closer together', () => {
    const { itemDistance, spacing } = corridorLayout(6, undefined, 10, (index) => index >= 2 && index <= 4);
    expect(itemDistance.map((distance, index) => distance - (itemDistance[index - 1] ?? distance))).toEqual([0, spacing, spacing, 4, 4, spacing]);
  });

  it('shrinks long HUD titles', () => {
    expect(titleScale('HypCas')).toBe(1);
    expect(titleScale('Architecture student, product founder, and independent developer.')).toBeLessThan(0.5);
  });

  it('eases flights from rest to rest and scales their length with distance', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
    expect(easeInOutCubic(1)).toBe(1);
    expect(flightSeconds(0, 0.05)).toBeLessThan(flightSeconds(0, 0.6));
    expect(flightSeconds(0, 1)).toBeLessThanOrEqual(2.6);
  });
});
