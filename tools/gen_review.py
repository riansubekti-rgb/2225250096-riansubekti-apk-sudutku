"""Bangkitkan content/REVIEW-konten.md dari file JSON konten (untuk validasi ahli materi).
Jalankan: py -I tools/gen_review.py   (atau npm run content:review)
Dokumen ini DIHASILKAN OTOMATIS — ubah isinya di file JSON, lalu jalankan ulang skrip ini."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
C = ROOT / 'content'
REL = {'supplementary': 'Berpelurus', 'complementary': 'Berpenyiku', 'vertical': 'Bertolak belakang'}
TOTAL = {'supplementary': 180, 'complementary': 90}


def load(p):
    return json.loads((C / p).read_text(encoding='utf-8'))


def parse(e):
    """'3x+10' -> (3, 10)"""
    s = e.replace(' ', '').replace('−', '-')
    a = b = 0
    for t in re.findall(r'[+-]?[^+-]+', s):
        m = re.fullmatch(r'([+-]?)(\d*)(x?)', t)
        sign = -1 if m.group(1) == '-' else 1
        n = int(m.group(2)) if m.group(2) else 1
        if m.group(3):
            a += sign * n
        else:
            b += sign * n
    return a, b


def solve(rel, e1, e2):
    (a1, b1), (a2, b2) = parse(e1), parse(e2)
    x = (TOTAL[rel] - b1 - b2) / (a1 + a2) if rel in TOTAL else (b2 - b1) / (a1 - a2)
    return x, a1 * x + b1, a2 * x + b2


def fmt(n):
    return str(int(n)) if float(n).is_integer() else f'{n:.2f}'


NOTE = '\n_Catatan validator:_ ______________________________________\n'
out = [
    '# Lembar Tinjauan Konten Pembelajaran — SudutKu',
    '',
    '> **Dihasilkan otomatis** dari folder `content/` oleh `tools/gen_review.py`. Jangan sunting file ini langsung.',
    '> Untuk validasi ahli materi (tahap *Development* ADDIE). Butir pretest/posttest ada di `content/instruments/REVIEW-tes-literasi.md`.',
    '',
    'Petunjuk untuk validator: periksa **ketepatan konsep**, **kesesuaian bahasa untuk siswa SMP**, dan **kebenaran angka**.',
    'Tulis catatan pada baris yang disediakan.',
    '',
]

# 1. Pemanasan
w = load('warmup/warmup.json')
out += ['## 1. Pemanasan (istilah dasar & cek prasyarat)', '']
for c in w['cards']:
    out += [f"**{c['title']}** — {c['text']}", '']
for i, ch in enumerate(w['checks'], 1):
    ans = ch['options'][ch['answer']] if ch['type'] == 'choice' else ch['answer']
    opts = f" Pilihan: {', '.join(ch['options'])}." if ch['type'] == 'choice' else ''
    out += [f"Cek {i}. {ch['question']}{opts} **Kunci: {ans}**", '']
out.append(NOTE)

# 2. Kenali Hubungan
k = load('concepts/concepts.json')
out += ['## 2. Kenali Hubungan (kartu konsep, pembanding, kuis identifikasi)', '']
for c in k['cards']:
    if c['kind'] == 'concept':
        out += [f"### {c['title']}", f"- Kalimat inti: {c['core']}", f"- Rumus: `{c['formula']}`",
                f"- Gambar: sudut {', '.join(l for l in c['figure']['labels'] if l)}", f"- \"Kenapa begitu?\": {c['why']}",
                f"- Kata Busu: {c['tip']}", '']
    elif c['kind'] == 'compare':
        out += [f"### {c['title']}", f"- Kiri: {REL[c['left']['relation']]} — {c['left']['cue']}, {c['left']['total']}",
                f"- Kanan: {REL[c['right']['relation']]} — {c['right']['cue']}, {c['right']['total']}", f"- Kata Busu: {c['tip']}", '']
quiz = [c for c in k['cards'] if c['kind'] == 'quiz']
out += [f"### Kuis identifikasi — \"{k['quizPrompt']}\"", '', '| No | Gambar | Kunci |', '|---|---|---|']
for i, q in enumerate(quiz, 1):
    out.append(f"| {i} | {REL[q['figure']['type']]}, sudut a = {q['figure']['a']}° | {REL[q['answer']]} |")
out += ['', '**Umpan balik:**'] + [f"- {kk}: {v}" for kk, v in k['feedback'].items()]
out.append(NOTE)

# 3. Contoh bertahap
we = load('worked-examples/worked.json')
out += ['## 3. Contoh Bertahap (contoh lengkap + soal kembar)', '']
for ex in we['examples']:
    x, s1, s2 = solve(ex['relation'], ex['e1'], ex['e2'])
    tx, t1, t2 = solve(ex['relation'], ex['twin']['e1'], ex['twin']['e2'])
    out += [f"**{ex['title']}** ({REL[ex['relation']]})",
            f"- Contoh: sudut {ex['e1']} dan {ex['e2']} → x = {fmt(x)}, sudut {fmt(s1)}° dan {fmt(s2)}°",
            f"- Soal kembar: sudut {ex['twin']['e1']} dan {ex['twin']['e2']} → x = {fmt(tx)}, sudut {fmt(t1)}° dan {fmt(t2)}°", '']
out += ['**Kalimat langkah Kenali:**'] + [f"- {REL[r]}: {t}" for r, t in we['identify'].items()]
out += ['', '**Umpan balik:**'] + [f"- {kk}: {v}" for kk, v in we['feedback'].items()]
out += ['', '**Petunjuk bertingkat:**']
for step, hs in we['hints'].items():
    out += [f"- {step}: " + ' → '.join(f'({i}) {h}' for i, h in enumerate(hs, 1))]
out.append(NOTE)

# 4. Latihan (template)
tp = load('problems/templates.json')
out += ['## 4. Latihan Adaptif (template soal acak)', '',
        'Soal dibuat acak oleh aplikasi dari template berikut. Semua soal dijamin menghasilkan x dan sudut bilangan bulat positif yang sah, dan **tidak pernah sama dengan butir pretest/posttest**.', '',
        '| Template | Hubungan | Jenis | Rentang |', '|---|---|---|---|']
for t in tp['templates']:
    rng = f"sudut diketahui {t['known'][0]}–{t['known'][1]}°" if t['kind'] == 'numeric' else \
        f"a₁ {t['a1'][0]}–{t['a1'][1]}, a₂ {t['a2'][0]}–{t['a2'][1]}, b {t['b1'][0]}–{t['b1'][1]}"
    out.append(f"| {t['id']} | {REL[t['relation']]} | {'angka' if t['kind'] == 'numeric' else 'bervariabel'} | {rng} |")
out.append(NOTE)

# 5. Misi
ms = load('literacy/missions.json')
out += ['## 5. Misi Dunia Nyata (literasi matematis, ilustrasi 3D)', '']
for i, m in enumerate(ms['missions'], 1):
    x, s1, s2 = solve(m['relation'], m['e1'], m['e2'])
    it = m['interpret']
    out += [f"### Misi {i}: {m['title']} — konteks {m['pisaContext']}, {REL[m['relation']]}",
            f"- Konteks: {m['context']}", f"- Pertanyaan: {m['ask']}",
            f"- Jawaban: x = {fmt(x)}; sudut {fmt(s1)}° dan {fmt(s2)}°",
            f"- Tafsirkan: {it['question']}"] + \
           [f"  - {'**' if j == it['answer'] else ''}{o}{' ✅**' if j == it['answer'] else ''}" for j, o in enumerate(it['options'])] + \
           [f"- Penjelasan: {it['explain']}", '']
out.append(NOTE)

# 6. Instrumen kuesioner (draf)
out += ['## 6. Instrumen Kuesioner (DRAF terjemahan — ganti dengan versi tervalidasi)', '']
pa = load('instruments/paas.json')
out += [f"**Skala usaha mental (Paas)** — {pa['question']} ({pa['min']} = {pa['minLabel']}, {pa['max']} = {pa['maxLabel']})", '']
for f in ['cl-questionnaire.json', 'sus.json', 'student-response.json']:
    q = load(f'instruments/{f}')
    out += [f"**{q['title']}** (skala {q['scale']['min']}–{q['scale']['max']}: {q['scale']['minLabel']} … {q['scale']['maxLabel']})", '']
    out += [f"{i}. [{it['subscale']}{(' ' + it['polarity']) if it.get('polarity') else ''}] {it['text']}" for i, it in enumerate(q['items'], 1)]
    out += [f"- Terbuka: {o['text']}" for o in q.get('open', [])]
    out.append('')
out.append(NOTE)

(C / 'REVIEW-konten.md').write_text('\n'.join(l for l in out if l is not None), encoding='utf-8')
print('OK -> content/REVIEW-konten.md')
