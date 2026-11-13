# API — SudutKu

> Versi 0.1 (draf) · 13 November 2026
> Aplikasi bersifat **offline-first**, sehingga "API" di sini mencakup:
> 1. **API modul domain** (kontrak TypeScript internal),
> 2. **Skema konten** (JSON materi/soal/adegan 3D),
> 3. **Skema penyimpanan lokal** (IndexedDB),
> 4. **Format ekspor data penelitian**,
> 5. ~~API sinkron server~~ — **tidak dibuat di v1** (keputusan D3: offline + ekspor CSV).

---

## 1. API Modul Domain (`src/domain`)

Semua fungsi di `domain` bersifat **murni** (tanpa I/O), deterministik untuk *seed* yang sama, dan tercakup unit test.

### 1.1 Geometri — `domain/geometry`
```ts
export type Relation = 'supplementary' | 'complementary' | 'vertical';

export const RELATION_TOTAL: Record<Relation, number | null> = {
  supplementary: 180, complementary: 90, vertical: null, // null = sama besar
};

/** Besar sudut pasangan bila satu sudut diketahui. */
export function partnerAngle(rel: Relation, known: number): number;
// partnerAngle('supplementary', 65) === 115
// partnerAngle('complementary', 30) === 60
// partnerAngle('vertical', 70) === 70

/** Validasi rentang: sup 0<a<180, comp 0<a<90, vert 0<a<180. */
export function isValidAngle(rel: Relation, deg: number): boolean;
```

### 1.2 Aljabar linear — `domain/algebra`
```ts
/** Ekspresi linear satu variabel: a·x + b */
export interface Linear { a: number; b: number }

export function parseLinear(src: string): Linear;          // "3x-5" → {a:3,b:-5}; melempar ParseError
export function formatLinear(e: Linear, v?: string): string; // {a:2,b:10} → "2x + 10"
export function evalLinear(e: Linear, x: number): number;

export interface SolveStep { kind: 'combine' | 'move' | 'divide' | 'substitute' | 'check'; text: string; highlight?: string }
/** Menyelesaikan E1 + E2 = total  ATAU  E1 = E2, dengan langkah untuk ditampilkan. */
export function solveRelation(rel: Relation, e1: Linear, e2: Linear): {
  x: number; angle1: number; angle2: number; steps: SolveStep[];
};
```
Contoh acuan (hanya untuk **unit test**; tiga pasangan ini sama dengan butir pretest sehingga **tidak boleh** dipakai sebagai materi belajar, D14):
- `solveRelation('complementary', {a:2,b:0}, {a:3,b:0})` → x = 18, sudut 36° dan 54°
- `solveRelation('supplementary', {a:2,b:10}, {a:3,b:-5})` → x = 35, sudut 80° dan 100°
- `solveRelation('vertical', {a:3,b:-20}, {a:1,b:40})` → x = 30, sudut 70° dan 70°

### 1.3 Soal — `domain/problems`
```ts
export type ProblemMode = 'worked' | 'completion' | 'independent' | 'test';
export type KC = 'KC_IDENTIFY' | 'KC_RULE' | 'KC_NUMERIC' | 'KC_ALGEBRA' | 'KC_INTERPRET' | 'KC_FORMULATE';

export interface Problem {
  id: string;                 // "tpl-comp-alg-01#seed=4821" atau "bank-017"
  relation: Relation;
  kcs: KC[];
  figure: FigureSpec;         // lihat §2.3
  given: { label: string; expr: string }[];   // [{label:'∠A', expr:'2x'}, {label:'∠B', expr:'3x'}]
  ask: { target: 'x' | string };              // 'x' atau label sudut
  context?: { text: string; sceneId?: string; pisaProcess: 'formulate'|'employ'|'interpret' };
  answer: { x?: number; angles: Record<string, number> };
  steps: SolveStep[];
}

export function generateFromTemplate(tpl: ProblemTemplate, seed: number): Problem;
export function loadBankProblem(id: string): Problem;
```

### 1.4 Pemeriksa — `domain/checker`
```ts
export type StepId = 'identify' | 'rule' | 'compute' | 'check';

export interface CheckInput {
  problem: Problem;
  step: StepId;
  response: string | number | Relation;   // mis. 'complementary', "2x+3x=90", 36
}
export interface CheckResult {
  correct: boolean;
  misconception?: MisconceptionCode;       // lihat architecture.md §5
  feedbackKey: string;                     // kunci ke content/feedback.json
  partial?: boolean;                       // mis. nilai x benar tetapi sudut belum dihitung
}
export type MisconceptionCode =
  | 'M_SUP_AS_COMP' | 'M_COMP_AS_SUP' | 'M_VERT_AS_SUP'
  | 'M_X_NOT_ANGLE' | 'M_SUBST_ERR' | 'M_ARITH' | 'M_UNKNOWN';

export function check(input: CheckInput): CheckResult;
```
Toleransi numerik: jawaban sudut harus tepat (bilangan bulat) kecuali template menyatakan `tolerance`.

### 1.5 Model Siswa & Scaffolding — `domain/learner`, `domain/scaffolding`
```ts
export interface Mastery { kc: KC; relation?: Relation; p: number; n: number; updatedAt: number }

export type Outcome = { correct: boolean; hintLevel: 0 | 1 | 2 | 3 };
export function updateMastery(m: Mastery, o: Outcome, cfg: AdaptiveConfig): Mastery;
export function masteryStatus(m: Mastery, cfg: AdaptiveConfig): 'belum' | 'berkembang' | 'menguasai';

export interface NextActivity { problem: Problem; mode: ProblemMode; showSteps: boolean }
export function chooseNext(state: Mastery[], recent: AttemptSummary[], cfg: AdaptiveConfig, seed: number): NextActivity;

export interface AdaptiveConfig {
  alpha: number;            // 0.3
  lowThreshold: number;     // 0.4
  masteryThreshold: number; // 0.8
  minAttempts: number;      // 4
  effortDowngrade: number;  // 7 (skala Paas 1–9)
}
```

## 2. Skema Konten (`/content`, JSON)

Setiap file divalidasi saat build dengan **Zod** (`src/data/schemas.ts`); build gagal jika ada konten yang tidak valid.

### 2.1 Kartu Konsep — `content/concepts/<relation>.json`
```json
{
  "id": "concept-complementary",
  "relation": "complementary",
  "title": "Sudut Berpenyiku",
  "core": "Dua sudut berpenyiku jika bersama-sama membentuk sudut siku-siku. Jumlahnya 90°.",
  "formula": "∠a + ∠b = 90°",
  "figure": { "type": "complementary", "a": 35, "labels": ["a", "b"], "showValues": true },
  "why": "Sudut siku-siku besarnya 90°. Jika dibagi dua, jumlah kedua bagiannya tetap 90°.",
  "sceneId": "ladder-wall",
  "quiz": ["idq-01", "idq-02"]
}
```

### 2.2 Template Soal — `content/problems/templates/*.json`
```json
{
  "id": "tpl-comp-alg-01",
  "relation": "complementary",
  "kcs": ["KC_RULE", "KC_ALGEBRA"],
  "exprs": [ { "label": "∠A", "a": [1, 5], "b": [0, 0] }, { "label": "∠B", "a": [1, 5], "b": [0, 0] } ],
  "constraints": { "xInteger": true, "angleMin": 5, "xMin": 1 },
  "ask": "both",
  "levels": ["worked", "completion", "independent"]
}
```

### 2.3 FigureSpec (gambar 2D)
```ts
type FigureSpec =
  | { type: 'supplementary'; a: number; labels: [string, string]; showValues?: boolean[]; baseRotation?: number }
  | { type: 'complementary'; a: number; labels: [string, string]; showValues?: boolean[]; baseRotation?: number }
  | { type: 'vertical'; a: number; labels: [string, string, string, string]; highlight: [number, number]; showValues?: boolean[] };
```
Label boleh berupa nilai (`"65°"`), variabel (`"2x"`), atau `"?"`.

### 2.4 Misi Literasi — `content/literacy/*.json`
```json
{
  "id": "lit-scissors-01",
  "sceneId": "scissors",
  "context": "Rina membuka gunting. Sudut antara kedua bilah di bagian depan 40°.",
  "pisa": { "process": ["formulate", "employ", "interpret"], "content": "space-shape", "context": "personal" },
  "steps": [
    { "id": "formulate", "prompt": "Ketuk dua sudut yang saling bertolak belakang.", "type": "pick-angles", "answer": ["front", "back"] },
    { "id": "employ", "prompt": "Berapa besar sudut di bagian pegangan?", "type": "number", "answer": 40 },
    { "id": "interpret", "prompt": "Apakah gunting bisa dibuka hingga 200°? Pilih alasannya.", "type": "choice",
      "options": ["Bisa, karena…", "Tidak, karena kedua bilah akan melewati garis lurus (180°)"], "answer": 1 }
  ],
  "fallbackFigure": { "type": "vertical", "a": 40, "labels": ["40°", "?", "", ""], "highlight": [0, 1] }
}
```

### 2.5 Instrumen Penelitian — `content/instruments/*.json`
File: `literacy-pretest.json`, `literacy-posttest.json`, `cl-questionnaire.json`, `paas.json`, `sus.json`, `student-response.json`.

```json
{
  "id": "literacy-pretest",
  "version": "1.0.0",
  "kind": "test",                       // "test" | "questionnaire"
  "validated": false,                   // diubah ke true setelah validasi ahli; tercatat di ekspor
  "items": [
    {
      "id": "PRE01",
      "parallelOf": "POST01",           // pasangan butir paralel di posttest
      "type": "mcq",                    // v1 tes: hanya "mcq" (D10)
      "stem": "Sebuah tangga bersandar pada dinding tegak. Sudut antara tangga dan lantai 65°. Berapa besar sudut antara tangga dan dinding?",
      "figure": { "type": "complementary", "a": 65, "labels": ["65°", "?"] },
      "options": [
        { "id": "A", "text": "25°" },
        { "id": "B", "text": "115°", "distractor": "M_COMP_AS_SUP" },
        { "id": "C", "text": "65°",  "distractor": "M_VERT_AS_SUP" },
        { "id": "D", "text": "35°",  "distractor": "M_ARITH" }
      ],
      "answer": "A",
      "shuffleOptions": true,
      "score": 1,
      "difficulty": "sedang",
      "indicator": { "pisaProcess": "formulate", "context": "occupational", "relation": "complementary" }
    }
  ]
}
```

```json
{
  "id": "cl-questionnaire",
  "version": "1.0.0",
  "kind": "questionnaire",
  "scale": { "min": 0, "max": 10, "minLabel": "Sama sekali tidak", "maxLabel": "Sangat" },
  "items": [
    { "id": "IL1", "subscale": "IL", "text": "<butir terjemahan tervalidasi>" },
    { "id": "EL1", "subscale": "EL", "text": "<butir terjemahan tervalidasi>" },
    { "id": "GL1", "subscale": "GL", "text": "<butir terjemahan tervalidasi>" }
  ]
}
```
`sus.json` memakai `scale 1–5` dan menandai butir positif/negatif (`"polarity": "+" | "-"`) untuk perhitungan skor SUS:
`skor = 2,5 × Σ( butir ganjil: x−1 ; butir genap: 5−x )`.

> Butir instrumen **tidak boleh diubah oleh agent** tanpa persetujuan peneliti (lihat agents.md §8). Teks `<…>` diisi peneliti dengan versi yang sudah divalidasi.

### 2.6 Konten lain (v0.1)
| File | Skema (`src/data/schemas.ts`) | Isi |
|---|---|---|
| `content/warmup/warmup.json` | `WarmupSchema` | Kartu istilah + cek prasyarat (pilihan/angka) dengan kartu remedial |
| `content/worked-examples/worked.json` | `WorkedSchema` | Contoh bertahap + soal kembar, kalimat Kenali, umpan balik miskonsepsi, petunjuk bertingkat |
| `content/problems/templates.json` | `TemplatesSchema` | Template soal latihan acak (angka / bervariabel) |
| `content/literacy/missions.json` | `MissionsSchema` | Misi 3D: konteks, pasangan ekspresi, pertanyaan tafsirkan |
| `content/progress/badges.json` | `BadgesSchema` | Lencana & label keterampilan |
| `content/instruments/access-codes.json` | `AccessCodesSchema` | Kode dari guru → instrumen yang dibuka |
| `content/instruments/{paas,cl-questionnaire,sus,student-response}.json` | `PaasSchema`, `QuestionnaireSchema` | Instrumen kuesioner (DRAF) |

### 2.7 Adegan 3D — rancangan awal kontrak modul (implementasi v0.1 lihat architecture.md §7)
```ts
export interface SceneModule {
  id: string;
  create(ctx: SceneContext, params: Record<string, number>): SceneHandle;
}
export interface SceneHandle {
  update(params: Record<string, number>): void;   // memicu satu kali render
  pick(ndcX: number, ndcY: number): string | null; // id sudut yang diketuk
  toPlanarView(): Promise<void>;                   // animasi kamera ke tampilan 2D
  dispose(): void;
}
```

## 3. Skema Penyimpanan Lokal (Dexie / IndexedDB)

```ts
db.version(1).stores({
  profiles:    '++id, &studentCode, classCode, createdAt',
  sessions:    '++id, profileId, startedAt, endedAt, endReason',      // endReason: 'switch'|'idle'|'close'
  mastery:     '[profileId+kc+relation], profileId, updatedAt',
  attempts:    '++id, profileId, problemId, sessionId, ts',
  events:      '++id, profileId, sessionId, type, ts',
  ratings:     '++id, profileId, sessionId, setId, ts',          // skala Paas per set
  assessments: '++id, profileId, instrumentId, itemId, ts',     // pretest/posttest literasi
  questionnaires: '++id, profileId, instrumentId, itemId, ts',  // IL/EL/GL, SUS, angket respons
  settings:    'key'
});
```

| Tabel | Kolom penting |
|---|---|
| `attempts` | `problemId, relation, kcs[], mode, step, response, correct, misconception, hintLevel, durationMs, ts` |
| `events` | `type` (`screen_view`, `hint_open`, `scene3d_open`, `scene3d_to2d`, `lab_drag`, `step_reveal`, `self_explain`), `payload` |
| `ratings` | `setId, mentalEffort (1–9), durationMs` |
| `assessments` | `instrumentId, instrumentVersion, itemId, response, correct, score, durationMs` (`correct/score` kosong untuk `short-text`, dinilai manual) |
| `questionnaires` | `instrumentId, instrumentVersion, itemId, subscale, value, ts` |

## 4. Format Ekspor Data Penelitian

Ekspor dari Mode Peneliti → `sudutku_<classCode>_<YYYYMMDD>.zip` berisi:

| File | Kolom |
|---|---|
| `attempts.csv` | `student_code, session_id, ts_iso, problem_id, relation, kcs, mode, step, response, correct, misconception, hint_level, duration_ms` |
| `ratings.csv` | `student_code, session_id, set_id, ts_iso, mental_effort, duration_ms` |
| `assessments.csv` | `student_code, instrument_id, instrument_version, item_id, pisa_process, context, response, correct, score, duration_ms` |
| `assessment_summary.csv` | `student_code, pretest_score, posttest_score, pretest_max, n_gain` + skor per proses PISA |
| `questionnaires.csv` | `student_code, instrument_id, instrument_version, item_id, subscale, value, ts_iso` |
| `questionnaire_summary.csv` | `student_code, il_mean, el_mean, gl_mean, sus_score` |
| `sessions.csv` | `device_id, student_code, session_id, started_iso, ended_iso, end_reason` |
| `mastery.csv` | `student_code, kc, relation, p, n, status` |
| `events.csv` | `student_code, session_id, ts_iso, type, payload_json` |
| `meta.json` | versi aplikasi, versi konten, `AdaptiveConfig`, waktu ekspor |

Semua file CSV berisi kolom `device_id` dan `local_id` di awal, untuk penggabungan lintas ponsel tanpa duplikasi. Nama file ZIP: `sudutku_<classCode>_<deviceId>_<YYYYMMDD-HHmm>.zip`.
Encoding UTF-8 dengan BOM (agar langsung terbaca di Excel), pemisah koma, dan waktu dalam ISO 8601 (WIB).

### 4.1 API Ekspor — `src/data/export.ts`
```ts
export interface ExportOptions { classCode?: string; format: 'zip-csv' | 'json'; since?: number }
export async function buildExport(opts: ExportOptions): Promise<Blob>;
/** Web Share (files) jika didukung, jika tidak unduh ke folder Download. */
export async function deliverExport(blob: Blob, filename: string): Promise<'shared' | 'downloaded'>;
```
`meta.json` juga mencatat `storagePersisted: boolean`, `userAgent`, dan `displayMode` (`standalone`/`browser`) untuk keperluan audit data.

## 5. API Sinkron Server — DITUNDA (bukan v1)

> Keputusan D3 (13 Nov 2026): v1 **tanpa server**. Rancangan di bawah hanya disimpan sebagai acuan bila kelak dibutuhkan; **jangan diimplementasikan**. Agar migrasi nanti mudah, setiap baris lokal sudah memiliki `ts` dan `id` yang stabil.

Rancangan REST (JSON, HTTPS, token per kelas):

| Metode | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/v1/auth/class` | Tukar `classCode` + `studentCode` dengan token sesi |
| `POST` | `/v1/sync/batch` | Kirim batch `attempts/events/ratings/assessments` (idempoten via `clientId`) |
| `GET`  | `/v1/content/version` | Cek pembaruan bank soal |
| `GET`  | `/v1/class/{classCode}/summary` | (guru) ringkasan penguasaan per KC & miskonsepsi |
| `GET`  | `/v1/class/{classCode}/export` | (peneliti) unduh data CSV |

Contoh `POST /v1/sync/batch`:
```json
{
  "clientId": "dev-7f3a",
  "since": 1731456000000,
  "attempts": [ { "localId": 42, "problemId": "bank-017", "correct": false, "misconception": "M_COMP_AS_SUP", "hintLevel": 1, "durationMs": 23110, "ts": 1731460000000 } ],
  "ratings": [],
  "events": []
}
```
Respons: `{ "accepted": [42], "rejected": [] }`.

## 6. Versi & Kompatibilitas
- `contentVersion` (semver) disimpan di `meta.json` dan pada setiap `attempt`, agar hasil penelitian dapat dilacak ke versi soal yang dipakai.
- Perubahan skema Dexie wajib melalui `db.version(n).upgrade(...)` tanpa menghapus data siswa.
