import { useEffect, useState } from 'react';
import { getResearch, isDone, type ResearchState } from '../../data/research';
import { doneKey, QUESTIONNAIRES, type QuestionnaireId } from './instruments';

export interface ResearchTask {
  key: string;
  title: string;
  to: string;
  kind: 'test' | 'questionnaire';
}

/** Tugas penelitian yang sedang dibuka peneliti dan belum dikerjakan siswa aktif. */
export function useResearchTasks(): { tasks: ResearchTask[]; state: ResearchState | null; ready: boolean } {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [state, setState] = useState<ResearchState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const r = await getResearch();
      const list: ResearchTask[] = [];
      if (r.pretestOpen && !(await isDone(doneKey.test('awal'))))
        list.push({ key: 'pre', title: 'Tes Awal', to: '/tes/awal', kind: 'test' });
      if (r.posttestOpen && !(await isDone(doneKey.test('akhir'))))
        list.push({ key: 'post', title: 'Tes Akhir', to: '/tes/akhir', kind: 'test' });
      const qs: [boolean, QuestionnaireId][] = [
        [r.clOpen, 'cl-questionnaire'],
        [r.susOpen, 'sus'],
        [r.susOpen, 'student-response'],
      ];
      for (const [open, id] of qs)
        if (open && !(await isDone(doneKey.questionnaire(id, r.meeting))))
          list.push({ key: id, title: QUESTIONNAIRES[id].title, to: `/angket/${id}`, kind: 'questionnaire' });
      if (alive) {
        setState(r);
        setTasks(list);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { tasks, state, ready };
}
