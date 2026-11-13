# PRD — SudutKu: Aplikasi Belajar Hubungan Antar Sudut

> Product Requirements Document · Versi 0.1 (draf) · 13 November 2026
> Status: **Draf awal (rev. 1 setelah interview ke-1)** — bagian bertanda `[TBD-INTERVIEW]` akan difinalkan melalui interview berikutnya.
> Nama "SudutKu" adalah nama kerja dan bisa diganti.

---

## 1. Ringkasan

SudutKu adalah aplikasi pembelajaran matematika untuk siswa SMP (Fase D) pada materi **Hubungan Antar Sudut** (bab Garis dan Sudut): sudut **berpelurus** (jumlah 180°), **berpenyiku** (jumlah 90°), dan **bertolak belakang** (sama besar).

Aplikasi dirancang dengan **pengelolaan beban kognitif (Cognitive Load Theory)** sebagai prinsip utama. Hasil yang ingin ditingkatkan adalah **literasi matematis** siswa. Aplikasi didistribusikan sebagai **Progressive Web App (PWA)** yang dioptimalkan untuk **Chrome di Android**: dibuka lewat link, bisa dipasang ke layar utama, dan berjalan offline (tanpa APK/Play Store). **Three.js** dipakai sebagai pelengkap ilustrasi 3D untuk konteks dunia nyata.

## 2. Latar Belakang & Bukti Lapangan

Sumber: wawancara siswa S01 (kelas VIII A, SMPN 11 Kota Serang, 8 November 2026) oleh Rian Subekti.

| Kode | Temuan | Implikasi desain |
|---|---|---|
| IL01, IL05 | Siswa tertukar antara berpelurus (180°) dan berpenyiku (90°); salah memilih aturan dan lupa bahwa sudut bertolak belakang sama besar. | Langkah **identifikasi hubungan** dipisah dan dilatih *sebelum* menghitung. |
| IL04 | Kesulitan naik saat soal memakai variabel (2x, 3x). | Soal variabel diberikan bertahap: *worked example* → soal melengkapi → soal mandiri. |
| IL02 | Siswa memproses empat hal sekaligus: gambar, jenis hubungan, rumus, hitungan. | **Segmentasi**: satu langkah per layar/panel. |
| EL01, EL03 | Penjelasan panjang, gambar tidak jelas, halaman terlalu padat → sulit fokus. | Teks pendek (≤ 50 kata per kartu) dan satu konsep per layar. |
| EL02 | Penjelasan yang terpisah dari gambar membuat siswa harus bolak-balik melihat. | Angka dan label diletakkan **langsung pada gambar** (menghindari *split-attention*). |
| EL04 | Penjelasan mencari x terlalu cepat. | Langkah dibuka satu per satu sesuai kecepatan siswa. |
| EL05 | Bingung menentukan apa yang diketahui dan apa yang ditanyakan; gambar penuh angka dan garis. | Penanda "Diketahui/Ditanya" dan **sorotan** pada sudut yang relevan saja. |
| GL01 | Paham ketika sudut digambar dengan warna berbeda. | **Kode warna konsisten** untuk tiap jenis hubungan. |
| GL02 | Memeriksa kewajaran jawaban berdasarkan sifat hubungan. | Langkah **"Periksa"** dijadikan bagian wajib dari alur. |
| GL03 | Lebih suka petunjuk bertahap: kenali → pilih rumus → hitung sendiri. | Kerangka 4 langkah **K-A-H-P** (Kenali, Aturan, Hitung, Periksa). |
| GL04 | Menjelaskan kepada teman membantu mengingat. | Fitur **"Jelaskan ke Teman"** (*self-explanation prompt*). |
| GL05 | Pola hubungan bisa ditransfer ke soal baru. | Variasi gambar dan konteks dengan aturan yang sama. |
| DS01 | Ingin gambar sudut interaktif yang besarnya bisa diubah. | **Lab Sudut** dengan garis yang bisa diseret. |
| DS02 | Konsep dijelaskan perlahan; hitungan dicoba sendiri. | Bagian konsep dipandu, bagian hitungan berupa latihan mandiri. |
| DS03 | Jangan terlalu banyak teks; gambar jelas, warna berbeda, penjelasan singkat. | Batas teks, ilustrasi yang bersih, tanpa dekorasi yang tidak bermakna. |

> Catatan metodologis: data saat ini berasal dari **satu responden**. Persyaratan di bawah perlu divalidasi ke lebih banyak siswa dan guru (lihat §12).

## 3. Tujuan

### 3.1 Tujuan Pembelajaran (hasil siswa)
Setelah memakai aplikasi, siswa mampu:
1. **TP1 – Mengidentifikasi** jenis hubungan dua sudut (berpelurus, berpenyiku, bertolak belakang) dari gambar 2D maupun situasi nyata/3D.
2. **TP2 – Memilih aturan** yang tepat (jumlah 180°, jumlah 90°, atau sama besar).
3. **TP3 – Menghitung** besar sudut yang belum diketahui, baik dengan bilangan maupun dengan variabel linear (ax + b).
4. **TP4 – Memeriksa dan menafsirkan** kewajaran jawaban sesuai sifat hubungan dan konteks.
5. **TP5 – Merumuskan** situasi dunia nyata (tangga, gunting, persimpangan jalan, dan sebagainya) menjadi model hubungan sudut.

### 3.2 Literasi Matematis (kerangka PISA 2022)
Literasi matematis diartikan sebagai kemampuan **bernalar secara matematis** serta **merumuskan, menerapkan, dan menafsirkan** matematika untuk memecahkan masalah dalam konteks dunia nyata.

| Proses PISA | Wujud di aplikasi | TP |
|---|---|---|
| Merumuskan (*formulate*) | Mengubah situasi nyata/3D menjadi gambar sudut dan persamaan | TP1, TP5 |
| Menerapkan (*employ*) | Menghitung dengan aturan yang tepat, termasuk aljabar | TP2, TP3 |
| Menafsirkan & mengevaluasi (*interpret/evaluate*) | Memeriksa kewajaran jawaban dalam konteks | TP4 |
| Penalaran matematis (*reasoning*) | Menjelaskan alasan: "Jelaskan ke Teman" | Semua |

Konten: **Ruang dan Bentuk**. Konteks: **pribadi** (gunting, laptop), **pekerjaan** (tukang dan tangga), **sosial** (persimpangan jalan, palang kereta), dan **ilmiah** (sinar pantul sederhana; opsional).

### 3.3 Tujuan Produk
- Menurunkan *extraneous load* yang dirasakan siswa dibanding pembelajaran konvensional (diukur dengan skala usaha mental Paas).
- Meningkatkan skor literasi matematis antara pretest dan posttest pada tahap uji coba **R&D** (lihat §3.5).
- Berjalan lancar di ponsel Android kelas bawah (RAM 2–3 GB, layar 360×640 dp).

### 3.4 Di luar cakupan (v1) — *diputuskan 13 Nov 2026*
- Sudut pada dua garis sejajar yang dipotong garis transversal (sehadap, berseberangan, dan lainnya). v1 **hanya** mencakup 3 hubungan.
- Pengertian/jenis/pengukuran sudut sebagai materi utama. Topik ini hanya muncul sebagai pemanasan prasyarat (F2).
- Backend/server, sinkron data, dan dashboard guru.
- APK Android dan Play Store.
- Chat atau fitur sosial antarsiswa.
- Pembuatan soal oleh AI/LLM secara langsung.

### 3.5 Konteks Penelitian
Desain: **Penelitian dan Pengembangan (R&D) model ADDIE**. Pemetaan tahap ADDIE ke produk:

| Tahap | Kegiatan | Keluaran / dukungan aplikasi |
|---|---|---|
| **A**nalysis | Wawancara siswa (S01 ✅), analisis kurikulum & karakteristik siswa | Dokumen ini (PRD), temuan IL/EL/GL/DS |
| **D**esign | Rancangan alur, storyboard, desain layar, instrumen | desain.md, draf konten & instrumen |
| **D**evelopment | Membangun PWA, validasi ahli materi & ahli media, revisi | Mode Peneliti untuk demo ke validator; tag versi konten |
| **I**mplementation | Uji coba terbatas → uji coba kelas | Pretest → pembelajaran → posttest + angket di dalam aplikasi |
| **E**valuation | Kevalidan, **kepraktisan** (angket respons, SUS), **keefektifan** (N-gain literasi, beban kognitif) | Ekspor CSV seluruh instrumen (F12, api.md §4) |

**Instrumen di dalam aplikasi** (keputusan D6): pretest & posttest literasi (F10), skala usaha mental Paas (F9), kuesioner IL/EL/GL (F9), serta angket respons siswa & SUS (F14). Lembar validasi ahli tetap di luar aplikasi (kertas/Google Form).

## 4. Pengguna

| Persona | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Siswa SMP (utama)** — mis. "Raka", kelas VII/VIII | Memakai ponsel Android pribadi atau milik orang tua; kuota internet terbatas; pernah belajar materi ini tetapi masih tertukar antar-aturan. | Penjelasan singkat, gambar jelas, langkah bertahap, latihan mandiri. |
| **Guru matematika (sekunder)** | Memakai aplikasi di kelas atau memberi tugas. | Melihat progres siswa langsung di ponsel siswa (layar Progres) atau dari data ekspor; tidak ada dashboard online di v1. |
| **Peneliti (pengembang)** | Mahasiswa S1 Pendidikan Matematika. | Data pretest/posttest, usaha mental, dan log aktivitas yang bisa diekspor. |

## 5. Prinsip Desain Cognitive Load (wajib)

| # | Prinsip | Aturan implementasi |
|---|---|---|
| P1 | Segmentasi | Satu konsep/langkah per layar. Langkah berikutnya dibuka oleh siswa sendiri. |
| P2 | Kontiguitas spasial (anti *split-attention*) | Label sudut dan angka berada **di dalam gambar**, tepat di dekat busurnya. |
| P3 | Penandaan (*signaling*) | Warna tetap: berpelurus = biru, berpenyiku = oranye, bertolak belakang = hijau. Warna selalu disertai simbol/teks (aman bagi buta warna). |
| P4 | Koherensi | Tanpa animasi dekoratif atau teks tambahan yang tidak perlu. Maskot Busu hanya mengikuti aturan desain.md §9.2. |
| P5 | *Worked example* → *fading* | Contoh lengkap → soal melengkapi (sebagian langkah kosong) → soal mandiri. |
| P6 | *Expertise reversal* | Bantuan berkurang otomatis untuk siswa yang sudah menguasai; siswa yang kesulitan mendapat bantuan lebih banyak. |
| P7 | *Pre-training* | Istilah (sudut, busur, garis lurus, siku-siku) dikenalkan dulu sebelum hubungan antar sudut. |
| P8 | Kendali tempo | Tidak ada auto-play; siswa yang menentukan kecepatan. |
| P9 | Germane load | *Self-explanation*, pertanyaan "Apakah masuk akal?", dan variasi konteks. |
| P10 | 3D sebagai pelengkap | 3D hanya dipakai jika menambah makna (konteks nyata), dibuka atas pilihan siswa, dan selalu bisa kembali ke tampilan 2D. |

## 6. Fitur & Persyaratan Fungsional

Prioritas: **M** = Must (v1), **S** = Should, **C** = Could.

### F1. Peta Belajar (Beranda) — M
- Menampilkan alur: Pemanasan → Kenali Hubungan → Lab Sudut → Contoh Bertahap → Latihan → Literasi (Misi Dunia Nyata) → Kuis Akhir.
- Status tiap bagian: terkunci, sedang dipelajari, atau dikuasai. Bagian berikutnya terbuka setelah penguasaan minimal tercapai (bisa dilewati guru/peneliti lewat mode demo).

### F2. Pemanasan / Pre-training — M
- 3–5 kartu istilah dasar dengan gambar berlabel, ditambah 3 soal cek prasyarat (IL03): mengenal sudut siku-siku, sudut lurus, dan operasi tambah/kurang.
- Jika prasyarat belum dikuasai, tampilkan kartu remedial singkat.

### F3. Kenali Hubungan (Konsep) — M · menjawab IL01, IL05, DS02
- Satu layar untuk tiap hubungan: gambar 2D berwarna, kalimat inti ≤ 25 kata, dan rumus (mis. ∠A + ∠B = 180°).
- Layar pembanding "Berpelurus vs Berpenyiku" berdampingan (sasaran miskonsepsi utama).
- Ilustrasi 3D opsional (tombol "Lihat di dunia nyata").
- Kuis identifikasi singkat: pilih jenis hubungan dari gambar.

### F4. Lab Sudut Interaktif — M · menjawab DS01, EL02
- Siswa memilih mode: berpelurus, berpenyiku, atau bertolak belakang.
- Siswa menyeret garis/titik pada gambar; besar kedua sudut diperbarui langsung di gambar.
- Persamaan yang ditampilkan ikut berubah: `65° + 115° = 180°`.
- Kelipatan 1° (opsi 5° untuk kemudahan). Tersedia mode "Tebak": aplikasi menyembunyikan satu sudut dan siswa menebaknya.
- Bisa dipakai dengan satu jempol di layar 360 dp.

### F5. Contoh Bertahap (Worked Examples) — M · menjawab IL04, EL04, GL03
- Contoh dibuka langkah demi langkah dengan tombol "Langkah berikutnya", mengikuti kerangka K-A-H-P:
  1. **Kenali** — sorot dua sudut, sebutkan jenis hubungannya.
  2. **Aturan** — tulis persamaan sesuai aturan.
  3. **Hitung** — selesaikan x, lalu substitusikan.
  4. **Periksa** — cek jumlah/kesamaan.
- Setiap contoh berpasangan dengan **soal kembar** (struktur sama, angka berbeda) yang dikerjakan siswa.
- *Fading*: 3 tingkat bantuan (lengkap → sebagian langkah kosong → mandiri).

### F6. Latihan Mandiri Adaptif — M · menjawab DS02, GL02, GL05
- Soal dibangkitkan dari template (angka acak yang valid) dan dari bank soal buatan peneliti.
- Panel langkah K-A-H-P dengan **petunjuk bertingkat** (3 level: arahan → aturan → langkah pertama). Penggunaan petunjuk dicatat.
- **Umpan balik spesifik miskonsepsi**, misalnya:
  - Siswa memakai 180° padahal seharusnya 90° → "Coba lihat tanda siku-siku. Kedua sudut ini membentuk sudut siku-siku, jadi jumlahnya…"
  - Siswa menjumlahkan sudut bertolak belakang hingga 180° → "Sudut bertolak belakang itu *sama besar*, bukan berjumlah 180°."
- Papan angka bawaan aplikasi (bukan keyboard sistem) agar gambar tidak tertutup.
- Mesin adaptif memilih soal berikutnya dan tingkat bantuan berdasarkan model penguasaan siswa (lihat architecture.md §6).

### F7. Misi Dunia Nyata (Literasi Matematis) — M
- 12 misi kontekstual (v0.2; 5 misi di v0.1) dengan adegan **3D Three.js** yang bisa diputar dan diperbesar:
  - Rambu silang perlintasan berbentuk X (bertolak belakang)
  - Pintu kamar dilihat dari atas (berpelurus)
  - Jalan setapak di pojok taman, angka dan bervariabel (berpenyiku)
  - Rangka layang-layang hias bervariabel (berpelurus + bertolak belakang)
- **Konteks misi sengaja berbeda dari konteks butir pretest/posttest** (gunting, persimpangan jalan, kertas, palang kereta, laptop) agar tes literasi tidak bocor (D14).
- Alur literasi: **Rumuskan** (pilih/tandai sudut pada adegan, ubah ke gambar 2D) → **Terapkan** (hitung) → **Tafsirkan** ("Apakah gunting bisa dibuka 200°? Mengapa?").
- Setiap adegan 3D memiliki gambar 2D cadangan jika WebGL tidak tersedia.

### F8. Jelaskan ke Teman (Self-explanation) — S · menjawab GL04
- Setelah menjawab benar, sesekali siswa diminta menyusun alasan dari potongan kalimat (seret kartu) atau memilih alasan yang tepat. Bentuknya tidak berupa esai panjang agar beban tetap rendah.

### F9. Pengukuran Beban Kognitif — M (kebutuhan penelitian)
Dua instrumen dengan frekuensi berbeda, agar pengukuran itu sendiri tidak menambah beban:
- **Skala usaha mental Paas** (1 butir, 9 poin): muncul setelah **setiap set soal** (≈ 4–6 soal). Bisa dijawab ≤ 5 detik.
- **Kuesioner IL/EL/GL** (adaptasi Leppink dkk., 2013; skala 0–10): muncul **sekali di akhir setiap pertemuan/modul**, bukan setelah setiap set. Butir dan terjemahan dimuat dari `content/instruments/cl-questionnaire.json`, sehingga peneliti dapat mengganti versi yang sudah divalidasi tanpa mengubah kode.
- Kedua instrumen tidak boleh dilewati di mode penelitian, tetapi boleh dinonaktifkan di mode bebas.

### F10. Pretest & Posttest Literasi Matematis — M
- **Mode tes**: tanpa petunjuk, tanpa umpan balik benar/salah, tanpa akses ke materi; urutan soal tetap; waktu per butir dicatat.
- Pretest dan posttest dibuka/dikunci oleh peneliti (PIN) agar dikerjakan serentak di kelas.
- **10 butir pilihan ganda** (keputusan D10), 4 opsi, skor 1/0 per butir, skor maksimum 10. Butir boleh memuat gambar 2D (SVG) agar konteksnya jelas; tidak memakai 3D di mode tes supaya beban dan kendala perangkat setara untuk semua siswa.
- Pretest dan posttest berbentuk **paralel**: butir ke-*n* pada keduanya memiliki indikator, konteks, hubungan, dan tingkat kesulitan yang sama, hanya angkanya berbeda (dicatat lewat `parallelOf`).
- Urutan opsi diacak per siswa (ber-*seed* dan tercatat). Opsi pengecoh disusun dari miskonsepsi (mis. 180−a untuk soal berpenyiku).
- Setiap butir diberi metadata indikator literasi (proses PISA: merumuskan/menerapkan/menafsirkan) dan konteks, agar skor bisa dianalisis per indikator. Usulan sebaran: merumuskan 3, menerapkan 4, menafsirkan 3.
- Butir dimuat dari `content/instruments/literacy-pretest.json` dan `literacy-posttest.json`.

### F11. Progres & Lencana — S · gamifikasi **ringan** (keputusan D8)
- Ringkasan penguasaan tiap keterampilan (TP1–TP5) dalam bahasa sederhana: "Kamu sudah jago mengenali sudut berpelurus."
- Bilah progres per bagian dan **lencana di akhir bagian** saja.
- **Maskot Busu** (D8b) menyapa di Beranda/layar penutup dan menjadi "suara" petunjuk & umpan balik (kecil, diam saat soal).
- **Tidak ada**: poin/skor berjalan, papan peringkat, timer kompetitif, atau animasi hadiah di tengah soal.

### F15. Tanya Busu — S (ditambahkan v0.2 atas permintaan peneliti)
- Siswa mengetik pertanyaan; Busu menjawab dari **bank tanya-jawab offline** (`content/mascot/tanya.json`) dan **menghitung otomatis** persamaan x serta pasangan sudut, lengkap dengan langkah dan gambar.
- **Bukan AI/LLM daring** (keputusan D15): tanpa internet, tanpa biaya, pertanyaan tidak keluar dari HP dan tidak disimpan (hanya jenis jawaban yang dicatat).
- Bila tidak paham, Busu jujur berkata belum paham dan memberi saran pertanyaan.
- Dibuka dari Beranda (halaman penuh) atau tombol 💬 di halaman belajar (lembar melayang, soal tidak hilang). **Tidak tersedia** di mode tes/angket.

### F12. Profil, Sesi & Data — M
- Login sederhana: kode kelas + kode siswa dari kartu kode yang dibagikan peneliti (tanpa email atau nomor HP).
- **Multi-profil per perangkat** (keputusan D12): satu ponsel dapat menyimpan banyak profil yang datanya terpisah penuh (progres, penguasaan, jawaban, instrumen).
  - Saat aplikasi dibuka, siswa **mengetik kode siswanya** (bukan memilih dari daftar), agar tidak masuk ke profil teman secara tidak sengaja.
  - Tombol **"Selesai & Ganti Siswa"** menutup sesi, menampilkan ringkasan singkat, lalu kembali ke layar masuk.
  - Sesi otomatis ditutup setelah 20 menit tidak aktif (progres tetap tersimpan).
  - Kode siswa yang sama bisa masuk di ponsel berbeda (mis. pertemuan 1 di ponsel A, pertemuan 2 di ponsel B). Data digabung saat analisis berdasarkan `student_code`.
- Setiap perangkat punya `deviceId` acak (bukan ID hardware) untuk menghindari duplikasi saat penggabungan data.
- Semua data tersimpan lokal di perangkat (IndexedDB) dan **tidak ada server**. Peneliti **mengekspor CSV/JSON** dari setiap perangkat (unduh atau Web Share ke WhatsApp/Drive).
- Aplikasi meminta penyimpanan persisten (`navigator.storage.persist()`) agar data tidak dihapus browser. Pengingat ekspor muncul di Mode Peneliti.

### F13. Mode Peneliti — M
- Dilindungi PIN: buka/kunci pretest & posttest, buka semua bagian (untuk validator ahli), ekspor data, reset data, atur parameter adaptif, aktif/nonaktifkan mode penelitian.
- Menampilkan status: jumlah data belum diekspor, apakah penyimpanan persisten, dan versi konten.

### F14. Angket Respons Siswa & SUS — M (kepraktisan)
- Muncul setelah posttest (dibuka oleh peneliti).
- **SUS**: 10 butir, skala 1–5, versi Bahasa Indonesia; skor SUS (0–100) dihitung otomatis dan ikut diekspor.
- **Angket respons siswa**: butir Likert dari peneliti (mis. aspek tampilan, kemudahan, manfaat) + 1–2 pertanyaan terbuka opsional.
- Butir dimuat dari `content/instruments/sus.json` dan `student-response.json`.

## 7. Persyaratan Non-Fungsional

| Kategori | Persyaratan |
|---|---|
| Platform | **PWA**. Target utama Chrome Android ≥ 100 (Android 8+); juga berjalan di browser modern lain (Samsung Internet, Edge, desktop). Bisa dipasang ("Tambahkan ke layar utama") dan dibuka dalam mode *standalone*. |
| Layar | Responsif 320–480 dp (ponsel, prioritas utama), 600–900 dp (tablet), dan desktop. Portrait sebagai mode utama; landscape didukung. |
| Kinerja | Layar interaktif pertama tampil dalam ≤ 3 detik di perangkat kelas bawah. Lab Sudut berjalan ≥ 50 fps. Adegan 3D ≥ 30 fps dengan *render on demand*. |
| Ukuran | Bundel awal ≤ 250 KB gzip; Three.js dimuat lazy, tetapi di-*precache* setelah instalasi agar tersedia offline; total unduhan pertama ≤ 3 MB (hemat kuota). |
| Offline | Seluruh materi dan latihan bisa dipakai tanpa internet setelah instalasi. |
| Aksesibilitas | Teks minimal 16 sp, area sentuh ≥ 48 dp, kontras WCAG AA, tidak bergantung pada warna saja, mendukung *reduce motion*. |
| Bahasa | Bahasa Indonesia baku dan ramah siswa SMP. |
| Privasi | Pengguna adalah anak di bawah umur: tanpa data identitas pribadi, ada persetujuan orang tua/sekolah, dan data hanya keluar perangkat lewat ekspor manual atau sinkron yang disetujui. |
| Keandalan | Tidak ada kehilangan progres saat aplikasi ditutup paksa (data disimpan setiap ada jawaban). |

## 8. Alur Pengguna Utama

```
Buka aplikasi → Masuk (kode kelas + kode siswa)
  → [Pretest]* → Peta Belajar
  → Pemanasan → Kenali Hubungan (+3D opsional) → Lab Sudut
  → Contoh Bertahap ⇄ Soal Kembar → Latihan Adaptif (K-A-H-P)
  → Misi Dunia Nyata (3D) → Rating usaha mental (setiap set)
  → Kuis Akhir → [Posttest]* → Progres
(* jika mode penelitian aktif)
```

## 9. Metrik Keberhasilan

| Metrik | Target awal | Cara ukur |
|---|---|---|
| Peningkatan literasi (N-gain) | ≥ 0,3 (kategori sedang) | Pretest/posttest F10 |
| Akurasi identifikasi hubungan (TP1) | ≥ 85% di akhir latihan | Log jawaban |
| Kesalahan "180° vs 90°" | Turun ≥ 50% dari set pertama ke set terakhir | Kode miskonsepsi pada log |
| Usaha mental | Turun, sementara skor naik (efisiensi instruksional positif) | Skala Paas + skor |
| Kegunaan | Skor SUS ≥ 70 | Kuesioner SUS |
| Kinerja | ≥ 30 fps 3D pada perangkat uji | Uji perangkat |

## 10. Asumsi & Batasan
- Siswa memakai ponsel Android pribadi/keluarga dengan Chrome versi 100 ke atas.
- Peneliti adalah pengembang tunggal (atau dibantu AI coding agent) dengan waktu terbatas, sehingga stack dipilih yang sederhana dan berbasis web.
- Konten soal dan instrumen divalidasi oleh dosen pembimbing/ahli.

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| 3D menambah *extraneous load* | 3D opsional, adegan sederhana, label tetap ada di 3D, tombol "Kembali ke 2D". |
| Perangkat siswa lemah | Lazy-load, *render on demand*, batas *pixel ratio*, cadangan 2D. |
| Data hanya dari 1 responden | Tambah wawancara/observasi dan lakukan uji coba terbatas (formatif). |
| Data penelitian hilang (siswa menghapus data Chrome/cache, browser mengosongkan penyimpanan) | `storage.persist()`, pengingat ekspor setelah tiap sesi uji coba, peneliti mengekspor di akhir setiap pertemuan, dan instruksi ke siswa agar tidak menghapus data browser selama penelitian. |
| Data siswa tercampur di ponsel bersama | Masuk dengan mengetik kode, "Selesai & Ganti Siswa", auto-logout 20 menit, nama/kode ditampilkan di header, dan konfirmasi "Kamu Raka (S07)?" saat masuk. |
| Siswa salah ketik kode sehingga datanya terpecah | Kode memakai format dengan digit cek (mis. `S07-K`); format yang tidak valid ditolak. Mode Peneliti bisa menggabungkan dua profil. |
| Siswa membuka di browser in-app (WhatsApp/Instagram) yang membatasi PWA | Halaman pembuka mendeteksi kondisi ini dan menampilkan petunjuk "Buka di Chrome". |
| Siswa menebak tanpa berpikir | Batas percobaan, petunjuk bertingkat, dan wajib melewati langkah "Kenali". |

## 12. Keputusan & Pertanyaan Terbuka

**Sudah diputuskan (interview 13 Nov 2026):**
| # | Topik | Keputusan |
|---|---|---|
| D1 | Cakupan materi | 3 hubungan saja (berpelurus, berpenyiku, bertolak belakang) |
| D2 | Desain penelitian | R&D (model ADDIE, lihat D5) |
| D3 | Data | Offline + ekspor CSV, tanpa server |
| D4 | Distribusi | PWA saja (link web, bisa dipasang di Android) |
| D5 | Model R&D | ADDIE |
| D6 | Instrumen di aplikasi | Pretest/posttest literasi, skala Paas, kuesioner IL/EL/GL, angket respons + SUS |
| D7 | Bank soal | Draf disusun AI (Claude) sesuai PRD → direvisi peneliti → divalidasi ahli |
| D8 | Gamifikasi | Ringan: bilah progres + lencana akhir bagian; tanpa poin/leaderboard |
| D8b | Maskot | **Revisi 13 Nov 2026** atas permintaan peneliti: maskot orisinal **Busu** (busur derajat setengah lingkaran) dengan aturan pemakaian desain.md §9.2 |
| D9 | Jadwal uji coba | 2 pertemuan; tanggal `[TBD-INTERVIEW]` (bukan 15 Nov) |
| D10 | Pretest/posttest | 10 butir pilihan ganda, bentuk **paralel** (angka berbeda, kesulitan setara), tanpa uraian |
| D11 | Hosting | Vercel, subdomain gratis (mis. `sudutku.vercel.app`) |
| D12 | Perangkat bersama | Satu ponsel bisa dipakai bergantian → wajib ada multi-profil, ganti sesi, dan ekspor di akhir pertemuan |
| D13 | Membuka instrumen | **Kode dari guru** (`TESAWAL`, `ANGKET1/2`, `TESAKHIR`, `PENDAPAT`) diketik siswa di HP masing-masing; Mode Peneliti tetap untuk ekspor. Lihat panduan-uji-coba.md |
| D15 | Tanya Busu | Asisten **offline berbasis aturan** (bank tanya-jawab + kalkulator), bukan AI daring — menjaga D3 (tanpa server) & privasi anak. AI daring hanya bila peneliti memutuskan lain |
| D16 | Busu v0.2 | 8 ekspresi, perkenalan di halaman Masuk (menyebut pembuat), suara text-to-speech bawaan HP (dipicu ketukan 🔊), Busu bisa diketuk di Beranda |
| D17 | Suara Busu otomatis | **Revisi atas permintaan peneliti:** Busu langsung berbicara setiap muncul (setelah sentuhan pertama, aturan autoplay browser), ekspresi mengikuti kalimat, suara tinggi & cepat (pitch 1,75; rate 1,2). Mitigasi kelas: tombol 🔊/🔇 di header (tersimpan per HP) |
| D18 | Karakter & backsound (v0.3) | Busu berkarakter **gadis remaja yang bersemangat** (suara perempuan Indonesia bila tersedia, pitch 1,9; rate 1,25; melompat saat bicara). Layar pembuka "Ketuk untuk mulai!" agar perkenalan langsung bersuara (aturan autoplay). **Backsound** orisinal disintesis (Web Audio), **hanya di layar santai** (Masuk, Beranda, Progres, Selesai, Kode) — berhenti di materi/soal/tes/angket (prinsip koherensi) dan mengecil saat Busu bicara; tombol 🎵 |
| D14 | Kebocoran tes | Materi, latihan, dan misi tidak boleh memakai butir/konteks yang sama dengan pretest/posttest — dicek otomatis di `content.test.ts` |

**Usulan pembagian 2 pertemuan** (perlu dikonfirmasi):
| Pertemuan | Kegiatan |
|---|---|
| 1 | Pretest → Pemanasan → Kenali Hubungan → Lab Sudut → Contoh Bertahap → Latihan (Paas tiap set) → Kuesioner IL/EL/GL → ekspor |
| 2 | Latihan lanjutan (aljabar) → Misi Dunia Nyata 3D (Paas tiap set) → Kuesioner IL/EL/GL → Posttest → SUS + angket → ekspor |

**Masih terbuka `[TBD-INTERVIEW]`:**
1. Pembagian materi per pertemuan (usulan di atas) dan durasi tiap pertemuan.
