import { angleAt, pointerToAngle, polar, snapClamp, VERT_BASE } from './figure';

const c = { x: 100, y: 100 };

describe('polar & angleAt', () => {
  it('0° ke kanan, 90° ke atas (y layar mengecil)', () => {
    expect(polar(c, 10, 0)).toEqual({ x: 110, y: 100 });
    expect(polar(c, 10, 90)).toEqual({ x: 100, y: 90 });
  });
  it('angleAt kebalikan polar', () => {
    for (const d of [0, 30, 90, 135, 200, 300]) expect(angleAt(c, polar(c, 50, d))).toBeCloseTo(d, 2);
  });
});

describe('pointerToAngle', () => {
  it('berpelurus: di bawah garis dijepit ke ujung terdekat', () => {
    expect(pointerToAngle('supplementary', 65)).toBe(65);
    expect(pointerToAngle('supplementary', 200)).toBe(179);
    expect(pointerToAngle('supplementary', 350)).toBe(1);
  });
  it('berpenyiku tetap di dalam 1–89', () => {
    expect(pointerToAngle('complementary', 120)).toBe(89);
    expect(pointerToAngle('complementary', 300)).toBe(1);
  });
  it('bertolak belakang: kedua ujung garis memberi sudut yang sama', () => {
    expect(pointerToAngle('vertical', VERT_BASE + 50)).toBe(50);
    expect(pointerToAngle('vertical', VERT_BASE + 230)).toBe(50);
  });
  it('snap 5°', () => {
    expect(pointerToAngle('supplementary', 63, 5)).toBe(65);
    expect(snapClamp('complementary', 89, 5)).toBe(85);
  });
});
