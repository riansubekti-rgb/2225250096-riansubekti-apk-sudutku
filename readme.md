# SudutKu

**Aplikasi web (PWA) untuk belajar Hubungan Antar Sudut bagi siswa SMP. Penyajiannya ramah beban kognitif, aplikasinya bisa dipasang di Android, dan tetap berjalan tanpa internet.**

| | Hubungan | Aturan |
|---|---|---|
| 🔵 | Sudut **berpelurus** | ∠a + ∠b = 180° |
| 🟠 | Sudut **berpenyiku** | ∠a + ∠b = 90° |
| 🟢 | Sudut **bertolak belakang** | ∠a = ∠b |

SudutKu dikembangkan untuk penelitian R&D (ADDIE) S1 Pendidikan Matematika. Rancangannya berangkat dari wawancara siswa: siswa sering tertukar antara 180° dan 90°, kesulitan mengerjakan soal bervariabel, dan terganggu oleh penjelasan panjang serta gambar yang tidak jelas.

## Fitur

**Untuk siswa** (ditemani maskot Busu, si busur derajat)
1. **Pemanasan:** istilah dasar dan cek prasyarat.
2. **Kenali Hubungan:** satu konsep per layar, gambar berwarna, kuis identifikasi.
3. **Lab Sudut:** seret garis, angka dan persamaan berubah langsung di gambar.
4. **Contoh Bertahap:** langkah *Kenali → Aturan → Hitung → Periksa* dibuka satu per satu, lalu siswa mengerjakan soal kembar.
5. **Latihan adaptif:** bantuan berkurang saat siswa makin mahir; umpan balik menyasar miskonsepsi; skala usaha mental setiap 5 soal.
6. **Misi Dunia Nyata (3D, Three.js):** rumuskan → terapkan → tafsirkan (literasi matematis PISA).
7. **Progres & lencana.**

**Untuk peneliti**
- Tes Awal/Akhir (10 PG paralel), angket IL/EL/GL, SUS, dan pendapat siswa.
- **Kode dari guru** untuk membuka tes/angket di banyak HP sekaligus.
- **Mode Peneliti** (PIN): ekspor ZIP berisi CSV (skor, N-gain, beban kognitif, log belajar) dan cetak kartu kode siswa.
- Satu HP bisa dipakai bergantian oleh beberapa siswa tanpa data tercampur.

## Dokumentasi

| Dokumen | Isi | Untuk |
|---|---|---|
| [panduan-uji-coba.md](panduan-uji-coba.md) | Langkah sebelum, saat, dan sesudah pertemuan; ekspor data; mengatasi masalah | Peneliti & guru |
| [analisis-data.md](analisis-data.md) | Isi file CSV, cara menggabungkan, N-gain, beban kognitif, SUS | Peneliti |
| [privasi-dan-persetujuan.md](privasi-dan-persetujuan.md) | Data yang dikumpulkan + draf surat izin & persetujuan | Sekolah, orang tua |
| [content/REVIEW-konten.md](content/REVIEW-konten.md) | Seluruh materi dalam satu dokumen untuk validator | Ahli materi |
| [content/instruments/REVIEW-tes-literasi.md](content/instruments/REVIEW-tes-literasi.md) | Kisi-kisi & butir pretest/posttest | Ahli materi |
| [prd.md](prd.md) | Kebutuhan produk, tujuan, keputusan D1–D12 | Semua |
| [desain.md](desain.md) | Prinsip cognitive load, warna, tata letak, 3D, maskot | Pengembang |
| [architecture.md](architecture.md) | Teknologi, struktur, mesin adaptif, 3D, PWA | Pengembang |
| [api.md](api.md) | Kontrak modul, skema konten & data, format ekspor | Pengembang |
| [task.md](task.md) | Rencana kerja & status | Semua |
| [agents.md](agents.md) | Aturan untuk AI coding agent | AI agent |
| [changelog.md](changelog.md) | Catatan perubahan per versi | Semua |

## Teknologi
React 18 · TypeScript · Vite · Tailwind CSS · Three.js · Zustand · Dexie (IndexedDB) · vite-plugin-pwa · Zod · fflate · Vitest · Playwright

## Menjalankan di laptop

Prasyarat: **Node.js 20+** (sudah terpasang: v26) dan **Microsoft Edge** atau Chrome (untuk tes otomatis).

```bash
npm install              # sekali saja
npm run dev              # mode pengembangan → http://localhost:5173
npm run build            # build produksi ke folder dist/
npm run preview -- --host  # jalankan hasil build → http://localhost:4173 (dan alamat Wi-Fi untuk HP)
npm run check            # lint + typecheck + 100 unit test
npm run test:e2e         # 8 tes end-to-end di ukuran HP & tablet (memakai Edge)
npm run content:review   # perbarui content/REVIEW-konten.md setelah mengubah konten
npm run content:gen-tests  # bangkitkan ulang soal tes dari tools/gen_tests.py
npm run icons            # buat ulang ikon PNG dari SVG
```

## Memasang aplikasi online (Vercel, gratis)

Langkah ini cukup dilakukan sekali. Setelah itu, setiap perubahan otomatis ikut online.

1. **Buat akun** di [github.com](https://github.com) dan [vercel.com](https://vercel.com) (pilih *Continue with GitHub*).
2. **Unggah proyek ke GitHub.** Cara termudah adalah memakai [GitHub Desktop](https://desktop.github.com):
   *File › Add local repository* › pilih folder proyek › *create a repository* › *Publish repository* (boleh **Private**).
3. **Hubungkan ke Vercel:** di vercel.com › *Add New… › Project* › pilih repository `sudutku` › *Deploy*. Pengaturan sudah otomatis terbaca dari `vercel.json`.
4. Setelah selesai, Vercel memberi alamat seperti `https://sudutku.vercel.app`. Nama bisa diubah di *Settings › Domains* jika masih tersedia.
5. Buka alamat itu di **Chrome Android**, pasang ke layar utama, lalu uji dengan mode pesawat.

> Jangan mengubah atau menerbitkan versi baru **saat uji coba sedang berlangsung**, agar semua siswa memakai versi yang sama.

## Cara siswa memasang (Android)
1. Buka link SudutKu di **Chrome**. Jika link dibuka dari WhatsApp, ketuk ⋮ › *Buka di Chrome*.
2. Ketuk **Pasang aplikasi** di Beranda, atau ⋮ › *Tambahkan ke layar utama*.
3. Buka SudutKu dari ikon di layar utama. Setelah dibuka sekali, aplikasi bisa dipakai tanpa internet.

> ⚠️ Selama penelitian, siswa **jangan menghapus data Chrome**, karena progres tersimpan di HP.

## Status
✅ **Prototipe lengkap v0.1, siap uji coba terbatas.** Semua fitur M (Must) di PRD sudah berjalan dan teruji otomatis.
⏳ Sebelum uji coba resmi: **validasi ahli** atas butir tes, angket, dan materi (masih berstatus DRAF), lalu pasang online.

## Kredit
- Pengembang & peneliti: Rian Subekti, Pendidikan Matematika
- Responden studi pendahuluan: siswa SMPN 11 Kota Serang
- Maskot Busu, ilustrasi, dan kode: dibuat khusus untuk proyek ini

## Lisensi
`[TBD]`
