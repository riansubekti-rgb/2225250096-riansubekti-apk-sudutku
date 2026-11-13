import { isValidAngle, partnerAngle } from './relation';

describe('partnerAngle', () => {
  it('berpelurus berjumlah 180°', () => expect(partnerAngle('supplementary', 65)).toBe(115));
  it('berpenyiku berjumlah 90°', () => expect(partnerAngle('complementary', 30)).toBe(60));
  it('bertolak belakang sama besar', () => expect(partnerAngle('vertical', 70)).toBe(70));
});

describe('isValidAngle', () => {
  it('menolak sudut berpenyiku ≥ 90°', () => {
    expect(isValidAngle('complementary', 89)).toBe(true);
    expect(isValidAngle('complementary', 90)).toBe(false);
  });
  it('menolak sudut ≤ 0 dan ≥ 180', () => {
    expect(isValidAngle('supplementary', 0)).toBe(false);
    expect(isValidAngle('vertical', 180)).toBe(false);
    expect(isValidAngle('supplementary', 179)).toBe(true);
  });
  it('menolak NaN', () => expect(isValidAngle('vertical', Number.NaN)).toBe(false));
});
