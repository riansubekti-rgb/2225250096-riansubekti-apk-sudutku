# Task — SudutKu

> Daftar pekerjaan bertahap · Versi 0.1 · 13 November 2026
> Status: `[ ]` belum · `[~]` sedang · `[x]` selesai · `[?]` menunggu keputusan interview
> Setiap tugas mencantumkan rujukan (PRD/desain/arsitektur) dan **kriteria selesai**.

---

## Fase 0 — Finalisasi Kebutuhan (interview)
- [x] 0.1 Cakupan v1: 3 hubungan saja (D1)
- [x] 0.2 Desain penelitian: R&D model ADDIE (D2, D5); instrumen di aplikasi: tes literasi, Paas, IL/EL/GL, SUS + angket (D6)
- [x] 0.2b Bank soal: draf oleh AI → revisi peneliti → validasi ahli (D7)
- [x] 0.2c Pretest/posttest: 10 PG paralel, tanpa uraian (D10)
- [x] 0.4c Hosting Vercel `*.vercel.app` (D11); multi-profil per ponsel (D12)
- [x] 0.3 Tanpa backend; offline + ekspor CSV (D3)
- [x] 0.4 Distribusi: PWA saja (D4)
- [~] 0.5 Jadwal uji coba: 2 pertemuan (D9); tanggal menyusul
- [x] 0.6 Gamifikasi ringan (D8) + maskot Busu (D8b, revisi)
- [ ] 0.7 Wawancara/observasi tambahan (≥ 3 siswa + 1 guru) untuk memvalidasi temuan S01

## Fase 1 — Fondasi Proyek
- [x] 1.1 Inisialisasi Vite + React + TypeScript (strict), ESLint, Prettier
- [x] 1.2 Tailwind + `styles/tokens.css` sesuai desain.md §3 (termasuk mode gelap)
- [~] 1.3 Struktur folder sesuai architecture.md §3 (dibuat bertahap per fitur)
- [x] 1.4 Vitest + Testing Library; Playwright (Edge) dengan 3 skenario E2E
- [x] 1.5 Router + layout responsif + safe area (halaman fitur masih placeholder)
- [x] 1.6 Font Atkinson Hyperlegible lokal
- [x] 1.7 vite-plugin-pwa (manifest, offline cache) — build 55 KB gzip
- [x] 1.8 Manifest (ikon SVG + maskable, standalone) + tombol "Pasang aplikasi" + deteksi browser in-app
- [x] 1.9 `storage.persist()` + adaptor `src/platform` (vibration, share/unduh)
- [ ] 1.10 Deploy otomatis ke Vercel — butuh akun GitHub + Vercel milik peneliti
- [ ] 1.11 Uji di ponsel Android nyata: pasang PWA + mode pesawat
- **Selesai bila:** PWA terpasang di Chrome Android, terbuka *standalone*, dan berjalan dalam mode pesawat; Lighthouse "Installable" lulus; `npm run check` lulus.

## Fase 2 — Domain (logika murni, uji dulu)
- [x] 2.1 `geometry`: `Relation`, `partnerAngle`, `isValidAngle` + unit test
- [x] 2.2 `algebra`: `parseLinear`, `formatLinear`, `solveRelation` dengan langkah-langkah (api.md §1.2); uji 3 contoh acuan
- [x] 2.3 `problems`: generator template ber-seed + validasi batasan (x bulat, sudut > 0, dan seterusnya); uji properti 1.000 seed
- [x] 2.4 `checker`: deteksi miskonsepsi aturan, x, dan substitusi (`domain/checker/misconception.ts`)
- [x] 2.5 `learner`: EMA mastery + status
- [~] 2.6 `scaffolding`: `planNext` + backward fading ✅; *downgrade* karena usaha mental belum
- **Selesai bila:** cakupan uji domain ≥ 90%; tidak ada impor React/DOM di `src/domain`.

## Fase 3 — Data & Konten
- [x] 3.1 Skema Zod untuk semua JSON konten (api.md §2) — divalidasi lewat `npm run content:check`
- [~] 3.2 Dexie DB (api.md §3) + repository + penyimpanan setiap jawaban — profil, sesi, attempts, events ✅
- [x] 3.3 Telemetri event logger (`src/data/log.ts`)
- [x] 3.4 Konten: 3 kartu konsep + 1 pembanding + 6 soal identifikasi (draf, perlu ditinjau)
- [x] 3.5 Konten: 6 worked example + soal kembar (draf; angka dijamin berbeda dari butir tes — dicek otomatis)
- [~] 3.6 Konten: 8 template soal ✅; soal bank buatan peneliti belum
- [x] 3.7 Umpan balik miskonsepsi & petunjuk bertingkat (di `worked.json` dan `concepts.json`)
- [x] 3.8 **Draf AI** (D7): Claude menyusun draf seluruh konten 3.4–3.7 + draf butir pretest/posttest literasi (berlabel indikator PISA) → peneliti merevisi
- [x] 3.9 Skema Zod untuk instrumen + file IL/EL/GL, SUS, respons siswa, Paas (DRAF terjemahan; teks final dari peneliti)
- [ ] 3.10 Validasi konten & instrumen oleh dosen/ahli materi; set `validated: true`
- **Selesai bila:** `npm run content:check` lulus; konten sudah ditinjau ahli.

## Fase 4 — Komponen Gambar 2D
- [x] 4.1 `AngleFigure` SVG untuk 3 tipe `FigureSpec` (label di dalam gambar, warna token, tanda siku)
- [ ] 4.2 Sorotan/berkedip satu kali untuk sudut yang dirujuk umpan balik
- [x] 4.5 Pasangan sudut bersebelahan dibedakan (busur luar lebih besar & lebih tipis); label panjang tidak menempel garis — dicek lewat tangkapan layar 360×640 terang/gelap
- [x] 4.3 Handle seret (sentuh + mouse + keyboard + tombol −/+), *snap* 5°, haptic
- [x] 4.4 `aria-label` deskriptif otomatis
- **Selesai bila:** uji visual pada 320/360/412/800 dp; seret tetap lancar ≥ 50 fps di perangkat uji.

## Fase 5 — Fitur Inti (Must)
- [x] 5.0 Maskot Busu (4 ekspresi) + balon kata (D8b)
- [x] 5.1 F12 Masuk dengan mengetik kode (digit cek), multi-profil, "Selesai & Ganti Siswa", auto-logout 20 menit, tabel `sessions`; uji isolasi data antarprofil
- [x] 5.1b Kartu kode siswa (cetak) di Mode Peneliti
- [x] 5.2 F1 Peta Belajar + materi terkunci sampai Tes Awal selesai
- [x] 5.3 F2 Pemanasan/pre-training + cek prasyarat
- [x] 5.4 F3 Kenali Hubungan + layar pembanding + kuis identifikasi
- [~] 5.5 F4 Lab Sudut — 3 mode ✅, mode Tebak belum
- [x] 5.6 F5 Contoh Bertahap (buka langkah, sorot perubahan, nilai muncul di gambar) + soal kembar
- [x] 5.7 `NumPad` aplikasi (angka, x, +, −, =, ⌫)
- [x] 5.8 F6 Latihan adaptif: set 5 soal, soal acak ber-seed dari template, fading menurut penguasaan, bebas butir tes
- [x] 5.9 F9 Rating usaha mental (Paas) setelah setiap set — teks butir masih DRAF
- **Selesai bila:** alur E2E "masuk → selesai 1 set latihan → rating" lulus di Playwright mobile; daftar periksa desain.md §11 terpenuhi di setiap layar.

## Fase 6 — Ilustrasi 3D & Literasi
- [x] 6.1 `Scene3D` lazy + deteksi WebGL + cadangan SVG + penanganan *context loss*
- [x] 6.2 Utilitas: render-on-demand, pembatasan pixel ratio, `dispose` menyeluruh, label CSS2D
- [x] 6.3 Adegan: rambu silang X (pengganti gunting — D14)
- [x] 6.4 Adegan: pojok taman (pengganti tangga)
- [x] 6.5 Adegan: pintu dari atas (pengganti laptop — D14)
- [x] 6.6 Adegan: rangka layang-layang (pengganti persimpangan — D14)
- ~~6.7 Adegan: palang kereta~~ — dibatalkan (konteks butir tes, D14)
- [x] 6.8 Transisi "Lihat sebagai gambar 2D"
- [x] 6.9 F7 Misi Dunia Nyata (rumuskan → terapkan → tafsirkan) — 12 misi
- [ ] 6.10 Integrasi tombol "Lihat di dunia nyata" pada kartu konsep
- **Selesai bila:** ≥ 30 fps & memori ≤ 150 MB pada perangkat kelas bawah; tidak ada kebocoran memori setelah 10× buka-tutup adegan.

## Fase 7 — Fitur Pendukung (Should/Could)
- [ ] 7.1 F8 Jelaskan ke Teman (susun kartu alasan)
- [x] 7.2 F10 Pretest/posttest mode tes (kunci/buka oleh peneliti, opsi diacak stabil per siswa, simpan tiap jawaban, waktu per butir, materi terkunci sampai pretest selesai)
- [x] 7.2b F9 Kuesioner IL/EL/GL per pertemuan (renderer skala generik) — teks butir DRAF
- [x] 7.2c F14 SUS + angket respons — teks butir DRAF
- [x] 7.2d `domain/scoring`: skor tes, N-gain, subskala IL/EL/GL, skor SUS + unit test
- [x] 7.3 F11 Progres & 6 lencana (tanpa poin/leaderboard)
- [~] 7.4 F13 Mode Peneliti — PIN (hash), buka/kunci instrumen, pertemuan, status data, ekspor ✅; buka semua bagian, atur parameter, reset, gabung profil belum
- [x] 7.5 Ekspor ZIP CSV (10 file) + Web Share / unduh — diuji di Edge sungguhan
- ~~7.6 Sinkron server & dashboard guru~~ — dibatalkan untuk v1 (D3)

## Fase 7b — Tambahan (14 Nov 2026)
- [x] 7.7 F2 Pemanasan (4 kartu + 3 cek prasyarat + remedial)
- [x] 7.8 Kode dari guru (D13) untuk membuka instrumen di banyak HP
- [x] 7.9 Tes E2E Playwright (alur siswa, penelitian, mode pesawat) di 360×640 & tablet — 8/8 lulus
- [x] 7.10 Ikon PNG 192/512/maskable/apple-touch; service worker didaftarkan saat aplikasi dibuka

## Fase 7c — v0.2 (14 Nov 2026)
- [x] 7.11 Busu 8 ekspresi + mulut bicara + suara TTS + perkenalan di Masuk + ketuk di Beranda (D16)
- [x] 7.12 F15 Tanya Busu offline: bank 27 topik, kalkulator langkah, salah ketik, fallback jujur (D15)
- [x] 7.13 12 misi dunia nyata + adegan `chair` & `square` + daftar misi
- [x] 7.15 Busu bicara otomatis + ekspresi mengikuti kalimat + suara lucu & cepat + tombol 🔊/🔇 (D17)
- [x] 7.16 Busu gadis remaja bersemangat + layar pembuka + backsound di layar santai (D18)
- [x] 7.17 Revisi D19: suara normal, bicara saat diketuk, perkenalan satu kalimat, Busu bergerak sendiri
- [x] 7.18 D20: suara remaja, subtitle berjalan, Busu mondar-mandir di halaman Masuk
- [ ] 7.14 Validasi isi Tanya Busu & kalimat Busu oleh peneliti/ahli (lihat content/REVIEW-konten.md §5b)

## Fase 8 — Mutu & Rilis
- [ ] 8.1 Audit aksesibilitas (kontras, ukuran font 130%, pembaca layar dasar)
- [ ] 8.2 Uji perangkat nyata: ≥ 1 ponsel kelas bawah (RAM 2–3 GB), 1 kelas menengah, 1 tablet
- [ ] 8.3 Anggaran ukuran bundel & Lighthouse mobile ≥ 90 (Performance/Accessibility)
- [ ] 8.4 Rilis PWA ke domain final + uji pembaruan versi (service worker update) tanpa kehilangan data siswa
- [x] 8.5 Panduan uji coba (panduan-uji-coba.md), privasi & persetujuan, analisis data, changelog, REVIEW-konten

## Fase 9 — Validasi & Uji Coba (ADDIE: Development → Implementation → Evaluation)
- [x] 9.0 Prosedur pengumpulan data (panduan-uji-coba.md §4, analisis-data.md §1): ekspor dari setiap ponsel di akhir setiap pertemuan, lalu gabungkan berdasarkan `student_code`
- [ ] 9.1 Validasi ahli media & ahli materi (lembar validasi)
- [ ] 9.2 Uji coba perorangan (1–3 siswa): *think-aloud*, catat beban kognitif & kegunaan
- [ ] 9.3 Revisi berdasarkan temuan
- [ ] 9.4 Uji coba kelompok kecil/kelas: pretest → penggunaan → posttest, rating usaha mental, SUS
- [ ] 9.5 Analisis: N-gain literasi, efisiensi instruksional (skor vs usaha), pola miskonsepsi
