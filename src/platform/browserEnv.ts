/** Deteksi browser dalam aplikasi (WhatsApp, Instagram, Facebook, Line, TikTok) yang membatasi PWA. */
const IN_APP_PATTERNS = [/FBAN|FBAV|FB_IAB/i, /Instagram/i, /WhatsApp/i, /Line\//i, /TikTok|musical_ly|BytedanceWebview/i];

export function isInAppBrowser(ua: string = navigator.userAgent): boolean {
  return IN_APP_PATTERNS.some((re) => re.test(ua));
}

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

export function displayMode(): 'standalone' | 'browser' {
  return isStandalone() ? 'standalone' : 'browser';
}
