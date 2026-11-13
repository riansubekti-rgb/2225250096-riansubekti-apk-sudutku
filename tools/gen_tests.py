"""Generate parallel pretest/posttest (10 MCQ each) + review markdown, verifying every key."""
import json, sys, pathlib

OUT = pathlib.Path(sys.argv[1])
TOTAL = {"supplementary": 180, "complementary": 90}

def partner(rel, a):
    return a if rel == "vertical" else TOTAL[rel] - a

def num_item(n, rel, known, stem, figure, distractors, meta):
    """Numeric MCQ: key = partner angle; distractors = list of (value, code)."""
    key = partner(rel, known)
    vals = [key] + [d[0] for d in distractors]
    assert len(set(vals)) == 4, (n, vals)
    assert all(v > 0 for v in vals), (n, vals)
    opts = [{"id": "A", "text": f"{key}°"}] + [
        {"id": "BCD"[i], "text": f"{v}°", "distractor": c} for i, (v, c) in enumerate(distractors)]
    return dict(stem=stem, figure=figure, options=opts, answer="A", _check=f"{rel}: {known} -> {key}", **meta)

def text_item(stem, figure, correct, wrongs, meta, check):
    opts = [{"id": "A", "text": correct}] + [
        {"id": "BCD"[i], "text": t, "distractor": c} for i, (t, c) in enumerate(wrongs)]
    return dict(stem=stem, figure=figure, options=opts, answer="A", _check=check, **meta)

def solve_alg(rel, e1, e2):
    (a1, b1), (a2, b2) = e1, e2
    if rel == "vertical":
        x = (b2 - b1) / (a1 - a2)
    else:
        x = (TOTAL[rel] - b1 - b2) / (a1 + a2)
    assert x == int(x) and x > 0, (rel, e1, e2, x)
    x = int(x)
    return x, a1 * x + b1, a2 * x + b2

def fmt(e):
    a, b = e
    s = f"{a}x" if a != 1 else "x"
    return s if b == 0 else f"{s} {'+' if b > 0 else '−'} {abs(b)}"

def M(pid, process, context, rel, diff, ind):
    return {"indicator": {"pisaProcess": process, "context": context, "relation": rel, "description": ind},
            "difficulty": diff}

def build(form):
    P = form == "pre"
    items = []
    # 1 Employ – complementary numeric
    k = 32 if P else 41
    items.append(num_item(1, "complementary", k,
        f"Pada gambar, ∠AOB adalah sudut siku-siku. Sinar OC membaginya sehingga ∠AOC = {k}°. Berapa besar ∠COB?",
        {"type": "complementary", "a": k, "labels": [f"{k}°", "?"]},
        [(180 - k, "M_COMP_AS_SUP"), (k, "M_VERT_AS_SUP"), (90 - k + 10, "M_ARITH")],
        M(1, "employ", "intra-matematis", "complementary", "mudah", "Menghitung pasangan sudut berpenyiku dari gambar")))
    # 2 Employ – vertical numeric
    k = 47 if P else 52
    items.append(num_item(2, "vertical", k,
        f"Dua garis lurus berpotongan di titik O. Salah satu sudut yang terbentuk besarnya {k}°. Berapa besar sudut yang bertolak belakang dengannya?",
        {"type": "vertical", "a": k, "labels": [f"{k}°", "?", "", ""], "highlight": [0, 1]},
        [(180 - k, "M_VERT_AS_SUP"), (90 - k, "M_SUP_AS_COMP"), (2 * k, "M_UNKNOWN")],
        M(2, "employ", "intra-matematis", "vertical", "mudah", "Menghitung sudut bertolak belakang dari gambar")))
    # 3 Formulate – scissors
    k = 35 if P else 42
    items.append(num_item(3, "vertical", k,
        f"Saat gunting dibuka, sudut antara kedua mata pisaunya {k}°. Berapa besar sudut antara kedua pegangan gunting itu?",
        {"type": "vertical", "a": k, "labels": [f"{k}°", "?", "", ""], "highlight": [0, 1]},
        [(180 - k, "M_VERT_AS_SUP"), (90 - k, "M_SUP_AS_COMP"), (2 * k, "M_UNKNOWN")],
        M(3, "formulate", "personal", "vertical", "mudah", "Memodelkan gunting sebagai dua garis berpotongan (bertolak belakang)")))
    # 4 Formulate – road intersection
    k = 72 if P else 64
    items.append(num_item(4, "supplementary", k,
        f"Jalan Merdeka yang lurus dipotong oleh Jalan Melati. Salah satu sudut di persimpangan itu {k}°. Berapa besar sudut yang bersebelahan dengannya pada sisi Jalan Merdeka yang sama?",
        {"type": "supplementary", "a": k, "labels": [f"{k}°", "?"]},
        [(k, "M_VERT_AS_SUP"), (90 - k, "M_SUP_AS_COMP"), (180 - k + 10, "M_ARITH")],
        M(4, "formulate", "societal", "supplementary", "sedang", "Memodelkan persimpangan jalan lurus sebagai sudut berpelurus")))
    # 5 Formulate – paper corner
    k = 28 if P else 37
    items.append(num_item(5, "complementary", k,
        f"Rina menggunting selembar kertas persegi dengan garis lurus dari salah satu pojoknya, sehingga sudut pojok itu terbagi dua. Salah satu bagian besarnya {k}°. Berapa besar bagian yang lain?",
        {"type": "complementary", "a": k, "labels": [f"{k}°", "?"]},
        [(180 - k, "M_COMP_AS_SUP"), (k, "M_VERT_AS_SUP"), (90 - k + 10, "M_ARITH")],
        M(5, "formulate", "personal", "complementary", "sedang", "Mengenali pojok persegi (90°) sebagai dasar sudut berpenyiku")))
    # 6 Employ – complementary algebra, ask larger angle
    e1, e2 = ((2, 0), (3, 0)) if P else ((4, 0), (5, 0))
    x, s1, s2 = solve_alg("complementary", e1, e2)
    xw, _, w2 = solve_alg("supplementary", e1, e2)  # misconception: used 180
    vals = [max(s1, s2), x, w2, min(s1, s2)]
    assert len(set(vals)) == 4
    items.append(dict(
        stem=f"∠P = ({fmt(e1)})° dan ∠Q = ({fmt(e2)})° adalah sudut berpenyiku. Berapa besar sudut yang lebih besar?",
        figure={"type": "complementary", "a": s1, "labels": [f"{fmt(e1)}", f"{fmt(e2)}"]},
        options=[{"id": "A", "text": f"{max(s1, s2)}°"},
                 {"id": "B", "text": f"{x}°", "distractor": "M_X_NOT_ANGLE"},
                 {"id": "C", "text": f"{w2}°", "distractor": "M_COMP_AS_SUP"},
                 {"id": "D", "text": f"{min(s1, s2)}°", "distractor": "M_UNKNOWN"}],
        answer="A", _check=f"x={x}, angles {s1},{s2}",
        **M(6, "employ", "intra-matematis", "complementary", "sedang", "Menyelesaikan sudut berpenyiku bervariabel")))
    # 7 Employ – supplementary algebra, ask second expression
    e1, e2 = ((2, 10), (3, -5)) if P else ((3, 5), (2, -15))
    x, s1, s2 = solve_alg("supplementary", e1, e2)
    xw, _, w2 = solve_alg("complementary", e1, e2)
    vals = [s2, x, s1, w2]
    assert len(set(vals)) == 4 and w2 > 0, vals
    items.append(dict(
        stem=f"∠K = ({fmt(e1)})° dan ∠L = ({fmt(e2)})° adalah sudut berpelurus. Berapa besar ∠L?",
        figure={"type": "supplementary", "a": s1, "labels": [f"{fmt(e1)}", f"{fmt(e2)}"]},
        options=[{"id": "A", "text": f"{s2}°"},
                 {"id": "B", "text": f"{x}°", "distractor": "M_X_NOT_ANGLE"},
                 {"id": "C", "text": f"{s1}°", "distractor": "M_UNKNOWN"},
                 {"id": "D", "text": f"{w2}°", "distractor": "M_SUP_AS_COMP"}],
        answer="A", _check=f"x={x}, ∠K={s1}, ∠L={s2}",
        **M(7, "employ", "intra-matematis", "supplementary", "sulit", "Menyelesaikan sudut berpelurus bervariabel dengan konstanta")))
    # 8 Interpret – railway barrier
    k = 50 if P else 35
    items.append(text_item(
        f"Palang pintu perlintasan kereta terangkat sehingga membentuk sudut {k}° dengan garis jalan di sisi kanan tiangnya. Sari menghitung sudut palang dengan garis jalan di sisi kiri adalah {180 - k}°, sedangkan Tiara menghitung {90 - k}°. Pendapat mana yang tepat?",
        {"type": "supplementary", "a": k, "labels": [f"{k}°", "?"]},
        f"Sari, karena kedua sudut berada pada garis jalan yang lurus sehingga jumlahnya 180°",
        [(f"Tiara, karena kedua sudut berpenyiku sehingga jumlahnya 90°", "M_SUP_AS_COMP"),
         ("Keduanya benar, karena bergantung pada arah melihatnya", "M_UNKNOWN"),
         (f"Keduanya salah, karena sudut di sisi kiri juga {k}°", "M_VERT_AS_SUP")],
        M(8, "interpret", "societal", "supplementary", "sedang", "Mengevaluasi dua jawaban berdasarkan sifat sudut berpelurus"),
        f"{k} + {180 - k} = 180"))
    # 9 Interpret – laptop
    k = 110 if P else 125
    items.append(text_item(
        f"Sebuah laptop diletakkan di meja datar. Layarnya dibuka sehingga sudut antara layar dan keyboard {k}°. Dina berkata, “Sudut antara layar dan permukaan meja di belakang laptop juga {k}°.” Bagaimana pendapatmu?",
        {"type": "supplementary", "a": k, "labels": [f"{k}°", "?"]},
        f"Dina salah; sudut itu {180 - k}°, karena keyboard dan meja di belakangnya membentuk garis lurus",
        [("Dina benar, karena kedua sudut saling bertolak belakang", "M_VERT_AS_SUP"),
         (f"Dina salah; sudut itu {k - 90}°, karena selisihnya dengan sudut siku-siku", "M_SUP_AS_COMP"),
         (f"Dina salah; sudut itu {360 - k}°, karena satu putaran penuh 360°", "M_UNKNOWN")],
        M(9, "interpret", "personal", "supplementary", "sedang", "Menafsirkan klaim dalam konteks laptop menggunakan sudut berpelurus"),
        f"{k} + {180 - k} = 180"))
    # 10 Interpret – check Budi's algebra
    e1, e2 = ((3, -20), (1, 40)) if P else ((3, -10), (1, 30))
    x, s1, s2 = solve_alg("vertical", e1, e2)
    xb, b1, b2 = solve_alg("supplementary", e1, e2)  # Budi's wrong rule
    assert b1 != b2 and b1 + b2 == 180
    items.append(text_item(
        f"Dua garis berpotongan membentuk sepasang sudut bertolak belakang ({fmt(e1)})° dan ({fmt(e2)})°. Budi menjawab x = {xb}. Pernyataan mana yang paling tepat tentang jawaban Budi?",
        {"type": "vertical", "a": s1, "labels": [fmt(e1), fmt(e2), "", ""], "highlight": [0, 1]},
        f"Salah, karena jika x = {xb} kedua sudut menjadi {b1}° dan {b2}°, padahal sudut bertolak belakang harus sama besar",
        [(f"Benar, karena {b1}° + {b2}° = 180°", "M_VERT_AS_SUP"),
         (f"Benar, karena {xb} adalah bilangan bulat positif", "M_UNKNOWN"),
         ("Salah, karena jumlah kedua sudut itu seharusnya 90°", "M_COMP_AS_SUP")],
        M(10, "interpret", "intra-matematis", "vertical", "sulit", "Memeriksa kewajaran penyelesaian aljabar dengan sifat sudut bertolak belakang"),
        f"benar x={x} ({s1}°={s2}°); Budi x={xb} → {b1}°, {b2}°"))
    other = "POST" if P else "PRE"
    me = "PRE" if P else "POST"
    for i, it in enumerate(items, 1):
        it["id"] = f"{me}{i:02d}"
        it["parallelOf"] = f"{other}{i:02d}"
        it["type"] = "mcq"
        it["shuffleOptions"] = True
        it["score"] = 1
    return items

def strip(it):
    return {k: v for k, v in it.items() if not k.startswith("_")}

forms = {f: build(f) for f in ("pre", "post")}
# parallel check: same indicator/difficulty per index
for a, b in zip(forms["pre"], forms["post"]):
    assert a["indicator"] == b["indicator"] and a["difficulty"] == b["difficulty"]

OUT.mkdir(parents=True, exist_ok=True)
for f, items in forms.items():
    doc = {"id": f"literacy-{f}test", "version": "0.1.0-draft", "kind": "test", "validated": False,
           "title": "Pretest Literasi Matematis" if f == "pre" else "Posttest Literasi Matematis",
           "note": "DRAF disusun AI (Claude) — wajib ditinjau peneliti & divalidasi ahli sebelum dipakai.",
           "items": [strip(i) for i in items]}
    (OUT / f"literacy-{f}test.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")

proc = {"formulate": "Merumuskan", "employ": "Menerapkan", "interpret": "Menafsirkan"}
rel = {"supplementary": "Berpelurus", "complementary": "Berpenyiku", "vertical": "Bertolak belakang"}
md = ["# Lembar Tinjauan — Draf Pretest & Posttest Literasi Matematis (v0.1)", "",
      "> **Status: DRAF disusun AI.** Wajib ditinjau peneliti dan divalidasi ahli materi sebelum dipakai.",
      "> Sumber data aplikasi: `literacy-pretest.json` & `literacy-posttest.json` (file ini dihasilkan dari keduanya).", "",
      "## Kisi-kisi", "", "| No | Proses PISA | Konteks | Hubungan | Kesulitan | Indikator |", "|---|---|---|---|---|---|"]
for i, it in enumerate(forms["pre"], 1):
    d = it["indicator"]
    md.append(f"| {i} | {proc[d['pisaProcess']]} | {d['context']} | {rel[d['relation']]} | {it['difficulty']} | {d['description']} |")
md += ["", "Sebaran: Merumuskan 3 · Menerapkan 4 · Menafsirkan 3 — Berpelurus 4 · Berpenyiku 3 · Bertolak belakang 3.",
       "Kunci selalu ditulis sebagai opsi **A** di sumber; urutan opsi diacak per siswa di aplikasi.", ""]
for f, items in forms.items():
    md += [f"## {'Pretest' if f == 'pre' else 'Posttest'}", ""]
    for it in items:
        md.append(f"**{it['id']}** ({proc[it['indicator']['pisaProcess']]}, {it['difficulty']}) — {it['stem']}  ")
        for o in it["options"]:
            tag = " ✅" if o["id"] == it["answer"] else f" _(pengecoh: {o.get('distractor')})_"
            md.append(f"- {o['id']}. {o['text']}{tag}")
        md.append(f"- _Verifikasi: {it['_check']}_")
        md += ["", "Catatan peninjau: ______________________", ""]
(OUT / "REVIEW-tes-literasi.md").write_text("\n".join(md), encoding="utf-8")
print("OK", {f: len(v) for f, v in forms.items()})
