import * as THREE from 'three';
import { HALF_HEIGHT, HALF_WIDTH, type Frame } from './corridorGeometry';

export interface MenuItem { label: string; href: string }
export type MenuCorner = 'top-left' | 'bottom-right';

const LENGTH = 8;
const WIDTH = 0.42;
/** The strip starts this far ahead of the camera, roughly where the corner enters the frame. */
export const MENU_AHEAD = 5.5;
const CANVAS_W = 3072;
const CANVAS_H = Math.round((CANVAS_W * WIDTH) / LENGTH);
const PAD = 120;
const GAP = 90;
const FONT = '"Manrope Variable", system-ui, sans-serif';

/**
 * A thin menu strip bevelled 45° across a corridor corner. The camera owner moves it each
 * frame with `place`; `pick` maps a hit's UV back to a menu item.
 */
export const createMenuStrip = (items: MenuItem[], corner: MenuCorner, dark: boolean) => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(LENGTH, WIDTH), material);
  let ranges: Array<[number, number]> = [];
  let hover = -1;
  let isDark = dark;

  const draw = () => {
    if (!context) return;
    const ink = isDark ? '#f6f5f2' : '#0b0b0b';
    const paper = isDark ? 'rgba(10, 10, 10, 0.88)' : 'rgba(243, 242, 238, 0.92)';
    context.clearRect(0, 0, CANVAS_W, CANVAS_H);
    context.fillStyle = paper;
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
    context.fillStyle = isDark ? 'rgba(246, 245, 242, 0.55)' : 'rgba(11, 11, 11, 0.45)';
    context.fillRect(0, 0, CANVAS_W, 3);
    context.fillRect(0, CANVAS_H - 3, CANVAS_W, 3);
    // Shrink the type until every item fits on the strip.
    let size = Math.round(CANVAS_H * 0.66);
    const labels = items.map((item) => item.label.toLocaleUpperCase());
    const measure = () => labels.reduce((sum, label) => sum + context.measureText(label).width, 0) + GAP * (labels.length - 1) + PAD * 2;
    context.font = `760 ${size}px ${FONT}`;
    while (size > 24 && measure() > CANVAS_W) {
      size -= 4;
      context.font = `760 ${size}px ${FONT}`;
    }
    context.textBaseline = 'middle';
    ranges = [];
    let x = PAD;
    labels.forEach((label, index) => {
      const width = context.measureText(label).width;
      if (index === hover) {
        context.fillStyle = ink;
        context.fillRect(x - 24, CANVAS_H * 0.1, width + 48, CANVAS_H * 0.8);
        context.fillStyle = isDark ? '#0b0b0b' : '#f6f5f2';
      } else {
        context.fillStyle = ink;
      }
      context.fillText(label, x, CANVAS_H / 2 + size * 0.04);
      ranges.push([(x - GAP / 2) / CANVAS_W, (x + width + GAP / 2) / CANVAS_W]);
      x += width + GAP;
    });
    texture.needsUpdate = true;
  };
  draw();
  void document.fonts?.ready.then(draw);

  const signX = corner === 'top-left' ? -1 : 1;
  const signY = corner === 'top-left' ? 1 : -1;
  const inward = new THREE.Vector3();
  const along = new THREE.Vector3();
  const textUp = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  return {
    mesh,
    /** `frame` is the corridor frame at the strip's centre. */
    place: (frame: Frame) => {
      inward.copy(frame.right).multiplyScalar(-signX).addScaledVector(frame.up, -signY).normalize();
      // Text reads left to right on screen: away from the camera on the top-left, toward it on the bottom-right.
      along.copy(frame.tangent).multiplyScalar(corner === 'top-left' ? 1 : -1);
      textUp.crossVectors(inward, along);
      mesh.position.copy(frame.point)
        .addScaledVector(frame.right, signX * HALF_WIDTH)
        .addScaledVector(frame.up, signY * HALF_HEIGHT)
        .addScaledVector(inward, WIDTH / 2 + 0.03);
      mesh.quaternion.setFromRotationMatrix(basis.makeBasis(along, textUp, inward));
    },
    centerOffset: MENU_AHEAD + LENGTH / 2,
    pick: (uv: THREE.Vector2 | undefined) => (uv ? ranges.findIndex(([from, to]) => uv.x >= from && uv.x <= to) : -1),
    setHover: (index: number) => {
      if (index === hover) return;
      hover = index;
      draw();
    },
    setTheme: (next: boolean) => {
      isDark = next;
      draw();
    },
    dispose: () => {
      mesh.geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
};

export type MenuStrip = ReturnType<typeof createMenuStrip>;
