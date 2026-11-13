# agents.md — Panduan untuk AI Coding Agent

> File ini dibaca oleh AI coding agent (Claude Code, Codex, Cursor, dan sejenisnya) sebelum mengubah kode SudutKu.
> Manusia juga boleh membacanya sebagai ringkasan aturan proyek.

## 1. Konteks Singkat
SudutKu adalah aplikasi belajar **Hubungan Antar Sudut** (berpelurus, berpenyiku, bertolak belakang) untuk siswa SMP di ponsel Android. Prinsip utamanya adalah **pengelolaan beban kognitif**, dan hasil yang ditargetkan adalah **literasi matematis**. Proyek ini juga menjadi bagian dari skripsi S1 Pendidikan Matematika, sehingga **data penelitian dan keterlacakan** sama pentingnya dengan fitur.

Baca sebelum bekerja: [prd.md](prd.md) → [architecture.md](architecture.md) → [desain.md](desain.md) → [api.md](api.md) → [task.md](task.md).

## 2. Perintah

```bash
npm install
npm run dev            # server pengembangan (buka di Chrome DevTools mode ponsel 360×640)
npm run check          # lint + typecheck + unit test (WAJIB lulus sebelum selesai)
npm run test           # Vitest
npm run test:e2e       # Playwright 360×640 & tablet, memakai Microsoft Edge (PW_CHANNEL untuk mengganti)
npm run content:check  # validasi JSON konten dengan skema Zod (+ cek kebocoran butir tes)
npm run content:review # bangkitkan ulang content/REVIEW-konten.md setelah mengubah konten
npm run build          # build PWA ke dist/
npm run preview        # uji build + service worker (offline) secara lokal
npm run dev -- --host  # buka dari ponsel Android di jaringan Wi-Fi yang sama
```
*(Perintah di atas adalah rencana; perbarui bagian ini jika skrip di `package.json` berubah.)*

## 3. Aturan Arsitektur (jangan dilanggar)
1. `src/domain/**` berisi **TypeScript murni**: dilarang mengimpor React, DOM, Three.js, Dexie, atau Web API browser. Semua fungsi deterministik dan memiliki unit test.
2. Konten pembelajaran (teks, soal, umpan balik) **berada di `/content/*.json`**, bukan ditulis langsung di komponen. Setiap perubahan konten harus lulus `content:check`.
3. Three.js **hanya** dipakai di `src/three/**` dan selalu dimuat **lazy**. Setiap adegan wajib mengimplementasikan `dispose()` dan memiliki gambar SVG cadangan.
4. Gunakan **render on demand**, bukan `requestAnimationFrame` terus-menerus.
5. Penyimpanan hanya lewat repository di `src/data/**`. Perubahan skema harus memakai `db.version(n).upgrade()` dan tidak boleh menghapus data siswa.
6. Akses Web API platform (vibration, share, storage persist, install prompt) hanya lewat `src/platform/**`, dan selalu dengan *feature detection* serta *fallback*.
7. **Distribusi hanya PWA; tidak ada server.** Jangan menambahkan Capacitor, backend, atau `fetch` ke layanan luar tanpa persetujuan (keputusan D3/D4 di prd.md §12).
8. Semua aset (termasuk chunk Three.js dan font) harus masuk *precache* service worker. Uji mode pesawat sebelum menyatakan selesai.

## 4. Aturan Desain Cognitive Load (cek setiap mengubah UI)
- **Satu langkah/ide per layar.** Jangan menambah panel, banner, atau teks "tambahan" tanpa alasan pedagogis.
- **Label dan angka sudut harus di dalam gambar**, dekat busurnya, bukan di paragraf terpisah.
- **Warna hubungan memakai token saja**: `--rel-sup` (biru), `--rel-comp` (oranye), `--rel-vert` (hijau), `--ask` (merah muda). Selalu disertai simbol/teks. Jangan memakai hex langsung.
- Maksimal **2 sudut berwarna** dalam satu gambar.
- Maskot **Busu** hanya dipakai sesuai [desain.md §9.2](desain.md): kecil & diam saat siswa mengerjakan soal, tidak tampil di mode tes/kuesioner.
- Jangan menambah animasi dekoratif, auto-play, atau toast yang cepat hilang untuk umpan balik.
- Gambar tidak boleh tertutup keyboard. Gunakan komponen `NumPad` aplikasi.
- Uji di 360×640 dan 800×1280, mode terang dan gelap.
- Daftar periksa lengkap ada di [desain.md §11](desain.md).

## 5. Gaya Kode
- TypeScript `strict`; hindari `any`. Gunakan tipe dari `domain`.
- Komponen fungsional React + hooks; satu komponen per file; nama file `PascalCase.tsx` untuk komponen dan `camelCase.ts` untuk utilitas.
- Nama di kode dalam **bahasa Inggris**; teks yang dilihat siswa dalam **bahasa Indonesia** (dari `/content` atau `src/app/strings.ts`).
- Tailwind untuk tata letak; token CSS untuk warna.
- Komentar hanya untuk menjelaskan *mengapa*, terutama alasan pedagogis (mis. `// P2: label di dalam gambar untuk menghindari split-attention`).

## 6. Glosarium (kode ↔ UI)

| Kode | UI (Indonesia) |
|---|---|
| `supplementary` | sudut berpelurus (jumlah 180°) |
| `complementary` | sudut berpenyiku (jumlah 90°) |
| `vertical` | sudut bertolak belakang (sama besar) |
| `worked` / `completion` / `independent` | contoh lengkap / soal melengkapi / soal mandiri |
| `identify` / `rule` / `compute` / `check` | Kenali / Aturan / Hitung / Periksa (K-A-H-P) |
| `mentalEffort` | usaha mental (skala Paas 1–9) |
| `KC_*` | keterampilan (lihat architecture.md §4.2) |
| `formulate` / `employ` / `interpret` | merumuskan / menerapkan / menafsirkan (PISA) |

## 7. Ketepatan Matematika
- Sudut berpenyiku: 0° < a < 90°. Sudut berpelurus dan bertolak belakang: 0° < a < 180°.
- Soal bervariabel hanya memakai ekspresi linear satu variabel; x dan semua sudut hasil harus **bilangan bulat positif** kecuali template menyatakan lain.
- Setiap soal baru atau template baru harus memiliki uji yang memverifikasi jawabannya dengan `solveRelation`.
- Jangan mengubah teks konsep atau rumus tanpa menandainya untuk ditinjau peneliti (lihat §8).

## 8. Hal yang Perlu Ditanyakan ke Manusia Terlebih Dahulu
- Mengubah alur pedagogis (urutan K-A-H-P, aturan *fading*, parameter adaptif).
- Mengubah, menambah, atau menghapus butir **instrumen penelitian** (`content/instruments/**`). Butir ini sudah divalidasi dan tidak boleh diubah sembarangan.
- Menambah dependensi besar (> 30 KB gzip), layanan pihak ketiga, analitik, atau izin Android baru.
- Apa pun yang mengirim data siswa keluar perangkat.

## 9. Privasi
Pengguna adalah anak di bawah umur. **Dilarang** mengumpulkan nama lengkap, email, nomor HP, lokasi, foto, atau ID perangkat yang bisa dilacak. Jangan menambahkan SDK analitik/iklan.

## 10. Definisi Selesai (setiap tugas)
- [ ] `npm run check` dan `npm run content:check` lulus
- [ ] Tugas terkait di [task.md](task.md) diperbarui statusnya
- [ ] Untuk UI: daftar periksa desain.md §11 terpenuhi
- [ ] Untuk 3D: diuji dispose (buka-tutup 10×) dan cadangan 2D
- [ ] Dokumen yang terdampak (api.md/architecture.md) ikut diperbarui
