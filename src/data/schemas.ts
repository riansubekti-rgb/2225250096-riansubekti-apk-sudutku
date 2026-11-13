import { z } from 'zod';

/** Skema konten (api.md §2). Divalidasi oleh `npm run content:check`. */
export const RelationSchema = z.enum(['supplementary', 'complementary', 'vertical']);

export const FigureSpecSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('supplementary'), a: z.number().gt(0).lt(180), labels: z.tuple([z.string(), z.string()]) }),
  z.object({ type: z.literal('complementary'), a: z.number().gt(0).lt(90), labels: z.tuple([z.string(), z.string()]) }),
  z.object({
    type: z.literal('vertical'),
    a: z.number().gt(0).lt(180),
    labels: z.tuple([z.string(), z.string(), z.string(), z.string()]),
    // urutan label: [∠A, ∠A' (bertolak belakang dg A), ∠B, ∠B']
    highlight: z.tuple([z.number().int().min(0).max(3), z.number().int().min(0).max(3)]),
  }),
]);

const MisconceptionSchema = z.enum([
  'M_SUP_AS_COMP',
  'M_COMP_AS_SUP',
  'M_VERT_AS_SUP',
  'M_X_NOT_ANGLE',
  'M_SUBST_ERR',
  'M_ARITH',
  'M_UNKNOWN',
]);

export const McqItemSchema = z.object({
  id: z.string().regex(/^(PRE|POST)\d{2}$/),
  parallelOf: z.string(),
  type: z.literal('mcq'),
  stem: z.string().min(10),
  figure: FigureSpecSchema.optional(),
  options: z
    .array(z.object({ id: z.enum(['A', 'B', 'C', 'D']), text: z.string().min(1), distractor: MisconceptionSchema.optional() }))
    .length(4),
  answer: z.enum(['A', 'B', 'C', 'D']),
  shuffleOptions: z.boolean(),
  score: z.number().positive(),
  difficulty: z.enum(['mudah', 'sedang', 'sulit']),
  indicator: z.object({
    pisaProcess: z.enum(['formulate', 'employ', 'interpret']),
    context: z.string(),
    relation: RelationSchema,
    description: z.string(),
  }),
});

export const LiteracyTestSchema = z.object({
  id: z.enum(['literacy-pretest', 'literacy-posttest']),
  version: z.string(),
  kind: z.literal('test'),
  validated: z.boolean(),
  title: z.string(),
  note: z.string().optional(),
  items: z.array(McqItemSchema).length(10), // D10: 10 butir PG
});

export type LiteracyTest = z.infer<typeof LiteracyTestSchema>;

/** Kalimat inti kartu konsep ≤ 25 kata (desain.md §4.3). */
const coreText = z.string().refine((s) => s.trim().split(/\s+/).length <= 25, 'kalimat inti > 25 kata');
const tipText = z.string().max(60);

const ConceptCardSchema = z.object({
  kind: z.literal('concept'),
  relation: RelationSchema,
  title: z.string(),
  core: coreText,
  formula: z.string(),
  figure: FigureSpecSchema,
  why: z.string(),
  tip: tipText,
});

const CompareSideSchema = z.object({ relation: RelationSchema, figure: FigureSpecSchema, cue: z.string(), total: z.string() });

const CompareCardSchema = z.object({
  kind: z.literal('compare'),
  title: z.string(),
  left: CompareSideSchema,
  right: CompareSideSchema,
  tip: tipText,
});

const QuizCardSchema = z.object({
  kind: z.literal('quiz'),
  id: z.string(),
  figure: FigureSpecSchema,
  answer: RelationSchema,
});

export const ConceptsSchema = z.object({
  version: z.string(),
  quizPrompt: z.string(),
  feedback: z.object({
    correct: z.string(),
    wrong: z.string(),
    supplementary: z.string(),
    complementary: z.string(),
    vertical: z.string(),
  }),
  cards: z.array(z.discriminatedUnion('kind', [ConceptCardSchema, CompareCardSchema, QuizCardSchema])),
});

export type Concepts = z.infer<typeof ConceptsSchema>;

const PairSchema = z.object({ e1: z.string(), e2: z.string() });

export const WorkedSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  identify: z.object({ supplementary: z.string(), complementary: z.string(), vertical: z.string() }),
  feedback: z.object({
    correct: z.string(),
    wrong: z.string(),
    reveal: z.string(),
    M_COMP_AS_SUP: z.string(),
    M_SUP_AS_COMP: z.string(),
    M_VERT_AS_SUP: z.string(),
    M_X_NOT_ANGLE: z.string().includes('{expr}'),
    check: z.string(),
  }),
  hints: z.object({
    identify: z.array(z.string()).min(1),
    rule: z.array(z.string()).min(1),
    computeX: z.array(z.string()).min(1),
    computeAngle: z.array(z.string()).min(1),
  }),
  examples: z.array(
    PairSchema.extend({ id: z.string(), relation: RelationSchema, title: z.string(), twin: PairSchema }),
  ),
});

const range = z.tuple([z.number().int(), z.number().int()]);

export const TemplatesSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  templates: z.array(
    z.object({
      id: z.string(),
      relation: RelationSchema,
      kind: z.enum(['numeric', 'algebra']),
      known: range.optional(),
      a1: range.optional(),
      a2: range.optional(),
      b1: range.optional(),
      b2: range.optional(),
      bStep: z.number().int().positive().optional(),
    }),
  ),
});

export const PaasSchema = z.object({
  id: z.literal('paas'),
  version: z.string(),
  validated: z.boolean(),
  note: z.string().optional(),
  question: z.string(),
  min: z.literal(1),
  max: z.literal(9),
  minLabel: z.string(),
  maxLabel: z.string(),
});

/** Kuesioner skala (IL/EL/GL, SUS, respons siswa) — api.md §2.5. */
export const QuestionnaireSchema = z.object({
  id: z.enum(['cl-questionnaire', 'sus', 'student-response']),
  version: z.string(),
  validated: z.boolean(),
  title: z.string(),
  note: z.string().optional(),
  intro: z.string(),
  scale: z.object({ min: z.number().int(), max: z.number().int(), minLabel: z.string(), maxLabel: z.string() }),
  items: z.array(
    z.object({ id: z.string(), subscale: z.string(), text: z.string(), polarity: z.enum(['+', '-']).optional() }),
  ),
  open: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
});

export type Questionnaire = z.infer<typeof QuestionnaireSchema>;

const BasicFigureSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('angle'), deg: z.number().gt(0).lt(180), label: z.string().optional() }),
  z.object({ kind: z.literal('right') }),
  z.object({ kind: z.literal('straight') }),
]);

export const WarmupSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  cards: z.array(z.object({ id: z.string(), title: z.string(), text: z.string().max(140), figure: BasicFigureSchema })),
  checks: z.array(
    z.discriminatedUnion('type', [
      z.object({ id: z.string(), type: z.literal('choice'), question: z.string(), options: z.array(z.string()).min(2), answer: z.number().int(), remedial: z.string().nullable() }),
      z.object({ id: z.string(), type: z.literal('number'), question: z.string(), answer: z.number().int(), remedial: z.string().nullable(), hint: z.string() }),
    ]),
  ),
});

export const MissionsSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  missions: z.array(
    z.object({
      id: z.string(),
      sceneId: z.enum(['crossbuck', 'door', 'garden', 'kite', 'chair', 'square']),
      title: z.string(),
      context: z.string().max(220),
      ask: z.string(),
      pisaContext: z.enum(['personal', 'occupational', 'societal', 'scientific']),
      relation: RelationSchema,
      e1: z.string(),
      e2: z.string(),
      interpret: z.object({
        question: z.string(),
        options: z.array(z.string()).min(2),
        answer: z.number().int().min(0),
        explain: z.string(),
      }),
    }),
  ),
});

export type Mission = z.infer<typeof MissionsSchema>['missions'][number];

export const BadgesSchema = z.object({
  version: z.string(),
  badges: z.array(z.object({ id: z.string(), icon: z.string(), title: z.string(), desc: z.string() })),
  kcLabel: z.object({ KC_IDENTIFY: z.string(), KC_RULE: z.string(), KC_NUMERIC: z.string(), KC_ALGEBRA: z.string() }),
});

export const AccessCodesSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  codes: z.array(
    z.object({
      code: z.string().regex(/^[A-Z0-9]{3,12}$/),
      label: z.string(),
      patch: z.object({
        pretestOpen: z.boolean().optional(),
        posttestOpen: z.boolean().optional(),
        clOpen: z.boolean().optional(),
        susOpen: z.boolean().optional(),
        meeting: z.number().int().min(1).max(2).optional(),
      }),
    }),
  ),
});

const MoodSchema = z.enum(['happy', 'think', 'cheer', 'oops', 'wink', 'wow', 'sad', 'proud']);
const BusuLineSchema = z.object({ mood: MoodSchema, text: z.string().max(160) });

export const TanyaSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  greeting: z.string(),
  suggestions: z.array(z.string()).min(1),
  fallback: z.object({ mood: MoodSchema, text: z.string(), followups: z.array(z.string()).optional() }),
  entries: z.array(
    z.object({
      id: z.string(),
      keywords: z.array(z.string().regex(/^[a-z0-9 &]+$/, 'kata kunci huruf kecil')).min(1),
      mood: MoodSchema,
      answer: z.string().max(320),
      figure: FigureSpecSchema.optional(),
      followups: z.array(z.string()).optional(),
    }),
  ),
});

export const BusuContentSchema = z.object({
  version: z.string(),
  note: z.string().optional(),
  intro: z.array(BusuLineSchema).min(1),
  welcomeBack: BusuLineSchema,
  tapLines: z.array(BusuLineSchema).min(2),
});

export type Worked = z.infer<typeof WorkedSchema>;
export type WorkedExample = Worked['examples'][number];
export type ConceptCard = z.infer<typeof ConceptCardSchema>;
export type CompareCard = z.infer<typeof CompareCardSchema>;
export type QuizCard = z.infer<typeof QuizCardSchema>;
export type McqItem = z.infer<typeof McqItemSchema>;
