import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QuestionnaireRunner } from '../features/questionnaire/QuestionnaireRunner';
import { doneKey, QUESTIONNAIRES, type QuestionnaireId } from '../features/research/instruments';
import { getResearch, isDone, markDone } from '../data/research';
import { logEvent } from '../data/log';

/** Angket IL/EL/GL, SUS, dan respons siswa (F9, F14). */
export function AngketPage() {
  const { id } = useParams();
  const qid = (id && id in QUESTIONNAIRES ? id : 'cl-questionnaire') as QuestionnaireId;
  const q = QUESTIONNAIRES[qid];
  const [meeting, setMeeting] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'closed' | 'done' | 'open'>('loading');

  useEffect(() => {
    void (async () => {
      const r = await getResearch();
      setMeeting(r.meeting);
      const open = qid === 'cl-questionnaire' ? r.clOpen : r.susOpen;
      if (await isDone(doneKey.questionnaire(qid, r.meeting))) setStatus('done');
      else setStatus(open ? 'open' : 'closed');
    })();
  }, [qid]);

  if (status === 'loading' || meeting === null) return null;

  if (status !== 'open') {
    return (
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <p className="text-4xl" aria-hidden>
          {status === 'closed' ? '🔒' : '✅'}
        </p>
        <p className="text-xl font-bold">
          {status === 'closed' ? 'Angket ini belum dibuka oleh gurumu.' : 'Terima kasih atas jawabanmu!'}
        </p>
        <Link to="/" className="btn-primary mt-2 w-full max-w-sm">
          Kembali ke Peta Belajar
        </Link>
      </div>
    );
  }

  return (
    <QuestionnaireRunner
      key={qid}
      q={q}
      meeting={meeting}
      onDone={() => {
        void (async () => {
          await markDone(doneKey.questionnaire(qid, meeting));
          await logEvent('questionnaire_submitted', { instrumentId: qid, meeting });
          setStatus('done');
        })();
      }}
    />
  );
}
