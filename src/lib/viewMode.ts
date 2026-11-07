import { useSyncExternalStore } from 'react';

/**
 * Which presentation the visitor chose: the 3D corridor (default) or the classic site. Picking the
 * classic home switches the sub-pages to their classic layout for the rest of the session.
 */
export type ViewMode = 'corridor' | 'classic';

const KEY = 'ack.view';
const listeners = new Set<() => void>();

const read = (): ViewMode => {
  try {
    return window.sessionStorage.getItem(KEY) === 'classic' ? 'classic' : 'corridor';
  } catch {
    return 'corridor';
  }
};

export const setViewMode = (mode: ViewMode) => {
  if (read() === mode) return;
  try {
    window.sessionStorage.setItem(KEY, mode);
  } catch {
    // Storage blocked: the choice simply does not persist.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The prerendered HTML is the classic page, so the server snapshot is classic. */
export const useViewMode = () => useSyncExternalStore(subscribe, read, (): ViewMode => 'classic');

/** Routes that have a corridor presentation besides the home page. */
export const CORRIDOR_PAGES = ['work', 'about', 'lab', 'journal', 'contact', 'privacy', 'terms'] as const;
export type CorridorPage = (typeof CORRIDOR_PAGES)[number];
