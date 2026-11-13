import { isInAppBrowser } from './browserEnv';

const CHROME =
  'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

describe('isInAppBrowser', () => {
  it('Chrome Android biasa bukan in-app', () => expect(isInAppBrowser(CHROME)).toBe(false));
  it('mendeteksi Instagram', () => expect(isInAppBrowser(`${CHROME} Instagram 300.0.0`)).toBe(true));
  it('mendeteksi Facebook', () => expect(isInAppBrowser(`${CHROME} [FBAN/EMA;FBAV/400.0]`)).toBe(true));
});
