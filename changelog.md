# Changelog — SudutKu

Catatan perubahan aplikasi dan konten. Versi tercatat di setiap ekspor (`meta.json`, `instrument_version`), sehingga setiap data bisa dilacak ke versi yang dipakai.

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Penomoran mengikuti *semver*: versi mayor 1.0 = siap uji coba resmi.

## [Belum dirilis]

## [0.1.0] — 2026-11-14 — Prototipe lengkap (siap uji coba terbatas)

### Ditambahkan
- **Bagian belajar:** Pemanasan, Kenali Hubungan (3 konsep, pembanding, 6 kuis), Lab Sudut interaktif, Contoh Bertahap (6 contoh + soal kembar), Latihan adaptif (fading, soal acak ber-seed), Misi Dunia Nyata 3D (5 misi, Three.js), Progres & 6 lencana.
- **Maskot Busu** (busur derajat) dengan 4 ekspresi.
- **Instrumen penelitian:** pretest/posttest 10 butir PG paralel, skala Paas, angket IL/EL/GL per pertemuan, SUS, angket pendapat siswa.
- **Mode Peneliti** (PIN): buka/kunci instrumen, pertemuan, statistik data, ekspor ZIP berisi 10 CSV, cetak kartu kode siswa.
- **Kode dari guru** (`TESAWAL`, `ANGKET1`, `ANGKET2`, `TESAKHIR`, `PENDAPAT`) untuk membuka instrumen di banyak HP.
- Multi-profil per HP, kode siswa dengan huruf cek, auto-keluar setelah 20 menit tidak aktif.
- PWA offline (termasuk 3D), ikon PNG, banner pembaruan versi.
- Pengujian: 100 unit test, 8 tes end-to-end (alur siswa, penelitian, mode pesawat).

### Status konten
- Semua butir tes, angket, materi, dan misi berstatus **DRAF** (`validated: false`). Perlu validasi ahli sebelum uji coba resmi.
- Konteks misi sengaja berbeda dari konteks butir tes, dan soal latihan dijamin tidak sama dengan butir tes (dicek otomatis).

### Perubahan keputusan
- D8b: maskot ditambahkan atas permintaan peneliti (sebelumnya tanpa maskot).
- Contoh di api.md yang sama dengan butir pretest tidak dipakai sebagai materi belajar.
