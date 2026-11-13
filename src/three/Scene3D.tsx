import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createEngine, type Engine } from './engine';
import { SCENES } from './scenes';
import type { SceneId } from './sceneIds';
import type { Relation } from '../domain/geometry/relation';

export interface Scene3DHandle {
  toPlanar: () => Promise<void>;
  resetView: () => Promise<void>;
}

const REL_VAR: Record<Relation, string> = { supplementary: '--rel-sup', complementary: '--rel-comp', vertical: '--rel-vert' };

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}

/**
 * Pembungkus React untuk adegan 3D. Dimuat lazy (chunk terpisah). Bila WebGL hilang → `onFail`
 * agar halaman beralih ke gambar 2D cadangan.
 */
const Scene3D = forwardRef<
  Scene3DHandle,
  { sceneId: SceneId; a: number; labels: [string, string]; relation: Relation; onFail: () => void; ariaLabel: string }
>(function Scene3D({ sceneId, a, labels, relation, onFail, ariaLabel }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);

  useEffect(() => {
    if (!box.current) return;
    try {
      engine.current = createEngine(
        box.current,
        SCENES[sceneId](a, labels),
        { rel: cssVar(REL_VAR[relation]), ask: cssVar('--ask'), muted: cssVar('--ink-muted') },
        { reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, onLost: onFail },
      );
    } catch {
      onFail();
    }
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
    // labels berupa array baru tiap render; adegan cukup dibuat ulang bila isinya berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, a, labels[0], labels[1], relation]);

  useImperativeHandle(ref, () => ({
    toPlanar: () => engine.current?.toPlanar() ?? Promise.resolve(),
    resetView: () => engine.current?.resetView() ?? Promise.resolve(),
  }));

  return <div ref={box} role="img" aria-label={ariaLabel} className="relative h-[280px] w-full overflow-hidden rounded-card bg-bg" />;
});

export default Scene3D;
