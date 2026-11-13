import pre from '../../../content/instruments/literacy-pretest.json';
import post from '../../../content/instruments/literacy-posttest.json';
import cl from '../../../content/instruments/cl-questionnaire.json';
import sus from '../../../content/instruments/sus.json';
import resp from '../../../content/instruments/student-response.json';
import { LiteracyTestSchema, QuestionnaireSchema } from '../../data/schemas';

export const TESTS = {
  awal: LiteracyTestSchema.parse(pre),
  akhir: LiteracyTestSchema.parse(post),
} as const;

export const QUESTIONNAIRES = {
  'cl-questionnaire': QuestionnaireSchema.parse(cl),
  sus: QuestionnaireSchema.parse(sus),
  'student-response': QuestionnaireSchema.parse(resp),
} as const;

export type QuestionnaireId = keyof typeof QUESTIONNAIRES;

/** Kunci penyelesaian; IL/EL/GL dicatat per pertemuan. */
export const doneKey = {
  test: (kind: 'awal' | 'akhir') => TESTS[kind].id,
  questionnaire: (id: QuestionnaireId, meeting: number) => (id === 'cl-questionnaire' ? `${id}@m${meeting}` : id),
};

export const ALL_VALIDATED = [...Object.values(TESTS), ...Object.values(QUESTIONNAIRES)].every((i) => i.validated);
