import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestRunner } from '../features/assessment/TestRunner';
import { doneKey, TESTS } from '../features/research/instruments';
import { getResearch, isDone, markDone } from '../data/research';
import { useSession } from '../data/session';
import { logEvent } from '../data/log';

/** Tes Awal / Tes Akhir (F10). Hanya bisa dibuka bila peneliti membukanya di Mode Peneliti. */
export function TesPage() {
  const { kind } = useParams();
  const navigate = useNavigate();
  const profile = useSession((s) => s.profile);
  const [status, setStatus] = useState<'loading' | 'closed' | 'done' | 'open' | 'submitted'>('loading');
  const k = kind === 'akhir' ? 'akhir' : 'awal';
  const test = TESTS[k];

  useEffect(() => {
    void (async () => {
      const r = await getResearch();
      const open = k === 'awal' ? r.pretestOpen : r.posttestOpen;
      if (await isDone(doneKey.test(k))) setStatus('done');
      else setStatus(open ? 'open' : 'closed');
    })();
  }, [k]);

  if (status === 'loading' || !profile) return null;

  if (status === 'closed' || status === 'done' || status === 'submitted') {
    return (
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <p className="text-4xl" aria-hidden>
          {status === 'closed' ? '🔒' : '✅'}
        </p>
        <p className="text-xl font-bold">
          {status === 'closed' ? 'Tes ini belum dibuka oleh gurumu.' : 'Terima kasih! Jawabanmu sudah tersimpan.'}
        </p>
        <Link to="/" className="btn-primary mt-2 w-full max-w-sm">
          Kembali ke Peta Belajar
        </Link>
      </div>
    );
  }

  return (
    <TestRunner
      test={test}
      studentCode={profile.studentCode}
      onSubmit={(answers) => {
        void (async () => {
          await markDone(doneKey.test(k));
          await logEvent('test_submitted', { instrumentId: test.id, answered: Object.keys(answers).length });
          setStatus('submitted');
          navigate(`/tes/${k}`, { replace: true });
        })();
      }}
    />
  );
}
