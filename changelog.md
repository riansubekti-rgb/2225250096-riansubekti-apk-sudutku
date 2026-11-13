# Changelog — SudutKu

Catatan perubahan aplikasi dan konten. Versi tercatat di setiap ekspor (`meta.json`, `instrument_version`), sehingga setiap data bisa dilacak ke versi yang dipakai.

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Penomoran mengikuti *semver*: versi mayor 1.0 = siap uji coba resmi.

## [Belum dirilis]

## [0.2.1] — 2026-11-14 — Busu bicara otomatis

### Diubah
- Busu **langsung berbicara** setiap kali muncul (perkenalan, Beranda, balon umpan balik, Tanya Busu); perkenalan berlanjut sendiri kalimat demi kalimat dengan teks yang muncul mengikuti suara.
- **Ekspresi mengikuti kalimat** yang sedang diucapkan.
- Suara lebih **lucu dan cepat** (pitch 1,75; kecepatan 1,2×).
- Tombol **🔊/🔇** di header untuk mematikan suara (penting di kelas).
- Balon yang berisi teks tebal/angka kini ikut dibacakan.

## [0.2.0] — 2026-11-14 — Busu lebih hidup, Tanya Busu, 12 misi

### Ditambahkan
- **Busu**: 8 ekspresi (senang, berpikir, bersorak, ups, mengedip, kagum, sedih, bangga), mulut bergerak saat berbicara, suara text-to-speech bawaan HP (tombol 🔊), perkenalan di halaman Masuk yang menyebut pembuat (Kak Rian Subekti), Busu bisa diketuk di Beranda.
- **Tanya Busu** (offline): 27 topik tanya-jawab, kalkulator persamaan x & pasangan sudut dengan langkah, toleran salah ketik & bahasa sehari-hari, jujur bila tidak tahu. Bisa dibuka sebagai halaman atau lembar melayang (💬) di halaman belajar.
- **Misi Dunia Nyata**: 12 misi (dari 5), adegan 3D baru *kursi lipat* & *penggaris siku*, daftar misi dengan tanda selesai.
- Tes: 128 unit test, 10 tes E2E.

### Privasi
- Teks pertanyaan Tanya Busu **tidak disimpan**; yang dicatat hanya jenis jawaban (`ask_busu`).

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
