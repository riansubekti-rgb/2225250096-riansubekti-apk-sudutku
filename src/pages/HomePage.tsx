import { Link } from 'react-router-dom';
import { LEARNING_PATH } from '../app/routes';
import { InstallButton } from '../components/InstallButton';
import { RelationChip } from '../components/RelationChip';
import { Busu } from '../components/mascot/Busu';
import { useSession } from '../data/session';
import { UpdateBanner } from '../components/UpdateBanner';
import { useResearchTasks } from '../features/research/useResearchTasks';

export function HomePage() {
  const nickname = useSession((s) => s.profile?.nickname);
  const { tasks, ready } = useResearchTasks();
  // Tes Awal harus dikerjakan sebelum materi terbuka agar skor pretest tidak tercampur efek belajar.
  const pretestPending = tasks.some((t) => t.key === 'pre');
  if (!ready) return null;

  return (
    <div className="flex flex-col gap-4">
      <UpdateBanner />
      <section
        className="relative overflow-hidden rounded-card p-4 shadow-sm"
        style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))', color: 'var(--on-hero)' }}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-full bg-white/15 p-2">
            <Busu mood="happy" size={84} bob />
          </div>
          <div>
            <p className="text-xl font-bold leading-tight">Hai, {nickname}!</p>
            <p className="mt-1 text-[15px] leading-snug opacity-95">Yuk jelajahi dunia sudut bersamaku. Pilih bagian di bawah, ya.</p>
          </div>
        </div>
      </section>

      {tasks.length > 0 && (
        <section aria-label="Tugas dari guru" className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Link
              key={t.key}
              to={t.to}
              className="flex min-h-touch items-center gap-3 rounded-card border-2 border-accent bg-surface px-4 py-3 shadow-sm"
            >
              <span aria-hidden className="text-2xl">
                {t.kind === 'test' ? '📝' : '💬'}
              </span>
              <span className="flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide text-ink-muted">Tugas dari guru</span>
                <span className="block font-bold">{t.title}</span>
              </span>
              <span aria-hidden className="text-xl text-accent">
                ›
              </span>
            </Link>
          ))}
          {pretestPending && <p className="text-sm text-ink-muted">Kerjakan Tes Awal dulu, ya. Setelah itu materi akan terbuka.</p>}
        </section>
      )}

      <section className="card">
        <p className="text-sm text-ink-muted">Tiga hubungan sudut yang akan kamu kuasai:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <RelationChip relation="supplementary" />
          <RelationChip relation="complementary" />
          <RelationChip relation="vertical" />
        </div>
      </section>

      <nav aria-label="Peta belajar">
        <ol className="grid grid-cols-1 gap-2 min-[600px]:grid-cols-2">
          {LEARNING_PATH.map((r, i) => {
            const body = (
              <>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-2xl"
                  aria-hidden
                >
                  {r.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-ink-muted">Bagian {i + 1}</span>
                  <span className="block font-bold">{r.title}</span>
                </span>
                {r.ready && !pretestPending ? (
                  <span aria-hidden className="text-xl text-accent">
                    ›
                  </span>
                ) : (
                  <span className="rounded-full bg-bg px-2 py-1 text-xs text-ink-muted">{pretestPending && r.ready ? '🔒' : 'Segera'}</span>
                )}
              </>
            );
            const cls = 'flex min-h-touch items-center gap-3 rounded-card border border-line bg-surface px-3 py-3';
            return (
              <li key={r.path}>
                {r.ready && !pretestPending ? (
                  <Link to={r.path} className={`${cls} shadow-sm`}>
                    {body}
                  </Link>
                ) : (
                  <div className={`${cls} opacity-60`} aria-disabled>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {!pretestPending && (
        <Link to="/progres" className="btn-secondary">
          ⭐ Progres &amp; lencanaku
        </Link>
      )}

      <Link to="/kode" className="mx-auto py-2 text-sm text-ink-muted underline">
        🔑 Punya kode dari guru?
      </Link>

      <InstallButton />
    </div>
  );
}
