# Changelog — SudutKu

Catatan perubahan aplikasi dan konten. Versi tercatat di setiap ekspor (`meta.json`, `instrument_version`), sehingga setiap data bisa dilacak ke versi yang dipakai.

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Penomoran mengikuti *semver*: versi mayor 1.0 = siap uji coba resmi.

## [Belum dirilis]

## [0.3.3] — 2026-11-14 — Busu bicara sendiri & jalan-jalan

### Diubah
- Busu **bicara otomatis** lagi: perkenalan di halaman Masuk langsung diucapkan (dengan subtitle berjalan) pada sentuhan pertama di mana pun; Peta Belajar, balon petunjuk, dan Tanya Busu langsung dibacakan.
- Busu punya **rumah** (halaman Masuk & Peta Belajar) dan setiap beberapa detik **berjalan-jalan keliling layar** — atas, bawah, kiri, kanan, menghadap arah jalannya — lalu **kembali ke rumah**.

### Diperbaiki
- Busu sempat "melompat" dari pojok kiri atas saat mulai berjalan (elemen dipakai ulang oleh React).

## [0.3.2] — 2026-11-14 — Subtitle berjalan & Busu mondar-mandir

### Diubah
- Suara Busu seperti **remaja ±15 tahun** (nada 1,3; kecepatan 1,05×).
- Perkenalan di halaman Masuk tampil sebagai **subtitle berjalan** (potongan pendek, kata yang diucapkan disorot), bukan paragraf diam.
- Di halaman Masuk, Busu **mondar-mandir naik-turun** di sisi kanan layar setiap beberapa detik; berhenti saat diketuk dan berbicara.

## [0.3.1] — 2026-11-14 — Busu bicara saat diketuk

### Diubah
- Suara Busu **normal** (nada & kecepatan biasa).
- **Layar "Ketuk untuk mulai" dihapus.** Busu bicara **hanya saat diketuk** (atau tombol 🔊) di semua halaman.
- Perkenalan di halaman Masuk menjadi **satu kalimat utuh** yang diucapkan sekali.
- Busu **bergerak sendiri setiap beberapa detik** (lompat kecil & menoleh; di layar soal hanya miring sedikit).

## [0.3.0] — 2026-11-14 — Busu gadis remaja yang heboh + backsound

### Ditambahkan
- **Layar pembuka "Ketuk untuk mulai!"** — setelah diketuk, Busu langsung memperkenalkan diri dan musik menyala.
- **Backsound** ceria orisinal (disintesis Web Audio, tanpa file, offline): hanya di layar santai, berhenti di materi/soal/tes, mengecil saat Busu bicara; tombol 🎵/🔕.

### Diubah
- Busu berkarakter **gadis remaja yang bersemangat**: kalimat lebih seru, melompat saat bicara, suara perempuan Indonesia bila tersedia (nada 1,9; kecepatan 1,25×).
- Umpan balik lebih ceria ("Yeay, benar!", "Ups, belum tepat!").

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
