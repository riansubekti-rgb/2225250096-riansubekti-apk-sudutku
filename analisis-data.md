# Panduan Analisis Data SudutKu

> Untuk: peneliti (Bab IV skripsi, tahap *Evaluation* ADDIE). Semua angka dihitung dari file ZIP hasil ekspor (panduan-uji-coba.md §4).

## 1. Menggabungkan data dari beberapa HP

Setiap HP menghasilkan satu ZIP berisi 10 file. Setiap baris memuat `device_id` (kode acak HP) dan `local_id` (nomor baris di HP itu). Gabungkan data dengan cara berikut:

1. Ekstrak semua ZIP ke folder terpisah, mis. `P1/hp-01/`, `P1/hp-02/`, …
2. Untuk setiap jenis file (mis. `assessments.csv`), tempel semua isinya menjadi satu tabel. Di Excel: *Data › Get Data › From Folder* lalu *Combine*.
3. **Hapus duplikat** berdasarkan kombinasi `device_id` + `local_id`. Duplikat muncul jika satu HP diekspor lebih dari sekali.
4. Periksa `profiles.csv`: siswa dengan `self_created = 1` yang hanya punya pretest atau hanya posttest mungkin membuat dua kode — cocokkan dengan daftar nama milik peneliti.
5. Analisis per siswa memakai kolom `student_code`. Siswa yang memakai HP berbeda di pertemuan 1 dan 2 tetap tergabung lewat kode yang sama.

> Catatan: `assessment_summary.csv` dan `questionnaire_summary.csv` adalah **ringkasan per HP**. Jika seorang siswa mengerjakan pretest di HP A dan posttest di HP B, hitung ulang ringkasannya dari `assessments.csv` gabungan (lihat §3).

## 2. Isi setiap file

| File | Satu baris = | Kolom penting |
|---|---|---|
| `assessments.csv` | satu jawaban butir tes | `instrument_id` (literacy-pretest/posttest), `item_id`, `pisa_process`, `response` (id opsi asli A–D), `shown_order`, `correct`, `score`, `duration_ms` |
| `assessment_summary.csv` | satu siswa (per HP) | `pretest_score`, `posttest_score`, `max_score`, `n_gain`, `n_gain_category`, skor per proses PISA |
| `questionnaires.csv` | satu jawaban angket | `instrument_id` (cl-questionnaire / sus / student-response), `meeting`, `item_id`, `subscale` (IL/EL/GL/SUS/…), `value`, `text` |
| `questionnaire_summary.csv` | satu siswa per pertemuan | `il_mean`, `el_mean`, `gl_mean`, `sus_score` |
| `ratings.csv` | satu rating usaha mental | `set_id`, `mental_effort` (1–9) |
| `attempts.csv` | satu langkah pengerjaan latihan/kuis | `problem_id`, `relation`, `kcs`, `mode`, `step`, `correct`, `misconception`, `hint_level`, `duration_ms` |
| `mastery.csv` | satu keterampilan siswa | `kc`, `relation`, `p` (0–1), `n` |
| `profiles.csv` | satu profil di HP | `student_code`, `class_code`, `self_created` (1 = kode dibuat siswa sendiri), `created_iso` — tanpa nama panggilan |
| `sessions.csv` | satu sesi masuk–keluar | `started_iso`, `ended_iso`, `end_reason` (switch/idle) |
| `events.csv` | satu aktivitas | `type` (lab_drag, mission_complete, scene3d_to2d, …), `payload_json` |
| `meta.json` | info ekspor | versi aplikasi, versi & status validasi instrumen, parameter adaptif |

Kode miskonsepsi pada `attempts.csv`:

| Kode | Arti |
|---|---|
| `M_COMP_AS_SUP` | Soal berpenyiku, tetapi siswa memakai 180° |
| `M_SUP_AS_COMP` | Soal berpelurus, tetapi siswa memakai 90° |
| `M_VERT_AS_SUP` | Sudut bertolak belakang dianggap berjumlah 180° |
| `M_X_NOT_ANGLE` | Menjawab nilai x, padahal yang ditanya besar sudut |
| `M_SUBST_ERR` | Salah substitusi x ke ekspresi |
| `M_ARITH` | Aturan benar, salah hitung |

## 3. Keefektifan: literasi matematis

**Skor tes** = jumlah `score` per siswa per `instrument_id` (maksimum 10).

**N-gain** (Hake, 1998):

$$g = \frac{S_{post} - S_{pre}}{S_{maks} - S_{pre}}$$

Kategori: tinggi (g ≥ 0,7), sedang (0,3 ≤ g < 0,7), rendah (g < 0,3). Siswa dengan pretest = 10 tidak punya N-gain dan dikeluarkan dari rata-rata.

Di Excel, dengan pretest di kolom B dan posttest di kolom C: `=IF(B2=10,"",(C2-B2)/(10-B2))`

**Per indikator literasi:** kelompokkan skor menurut `pisa_process` (formulate = merumuskan, employ = menerapkan, interpret = menafsirkan) untuk melihat proses mana yang paling meningkat.

**Uji statistik (opsional):** uji normalitas selisih skor (Shapiro–Wilk). Jika normal, gunakan *paired t-test*; jika tidak, gunakan *Wilcoxon signed-rank*.

## 4. Beban kognitif

- **Usaha mental (Paas):** rata-rata `mental_effort` per siswa per set. Tren yang diharapkan: usaha menurun sementara akurasi naik.
- **IL/EL/GL (Leppink dkk.):** `il_mean`, `el_mean`, `gl_mean` per pertemuan. Harapan sesuai desain: **EL rendah** (penyajian tidak membebani) dan **GL tinggi**.
- **Efisiensi instruksional** (Paas & van Merriënboer, 1993) per siswa:

$$E = \frac{z_{\text{skor}} - z_{\text{usaha}}}{\sqrt{2}}$$

  dengan z = skor baku dalam kelompok. Nilai E > 0 berarti hasil tinggi dicapai dengan usaha relatif rendah.

## 5. Kepraktisan

- **SUS:** `sus_score` 0–100. Interpretasi umum: ≥ 68 di atas rata-rata, ≥ 80,3 sangat baik (Bangor dkk., 2009). Target PRD: ≥ 70.
- **Angket respons siswa:** persentase skor = Σ skor / (jumlah butir × 4) × 100%, lalu kategorikan sesuai kriteria kepraktisan yang dipakai di skripsi.
- Jawaban terbuka (`subscale = open`, kolom `text`) dianalisis secara kualitatif.

## 6. Analisis tambahan dari log belajar

- **Miskonsepsi "180° vs 90°"** (target PRD: turun ≥ 50%): hitung proporsi `attempts` dengan `misconception` = `M_COMP_AS_SUP` atau `M_SUP_AS_COMP` pada set pertama dibandingkan set terakhir setiap siswa.
- **Akurasi identifikasi** (target ≥ 85%): `attempts` dengan `step = identify`.
- **Penggunaan bantuan:** rata-rata `hint_level` dan proporsi soal `mode = completion` vs `independent` dari waktu ke waktu, sebagai bukti *fading*.
- **Penggunaan 3D:** jumlah event `scene3d_to2d` per siswa.

## 7. Hal yang perlu dilaporkan di skripsi

- Versi aplikasi dan versi instrumen (dari `meta.json`), termasuk apakah `validated = true`.
- Jumlah siswa dengan data lengkap (pretest dan posttest) dibandingkan jumlah peserta.
- Kejadian khusus selama uji coba (catatan dari panduan-uji-coba.md §6).
