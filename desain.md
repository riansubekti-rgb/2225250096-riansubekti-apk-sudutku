# Desain — SudutKu

> Versi 0.1 (draf) · 13 November 2026 · Panduan desain antarmuka, interaksi, visual, dan konten berbasis Cognitive Load Theory.
> Rujukan: [prd.md](prd.md) §5 (prinsip P1–P10), [architecture.md](architecture.md).

## 1. Filosofi Desain

> **"Satu layar, satu ide. Angka ada di gambar. Warna punya arti."**

Setiap elemen di layar harus membantu siswa melakukan langkah yang sedang dikerjakan. Elemen yang tidak membantu dihapus. Tiga pertanyaan uji untuk setiap layar:
1. Apa *satu* hal yang harus dipikirkan siswa di layar ini?
2. Apakah siswa perlu memindahkan pandangan antara teks dan gambar? Jika ya, satukan.
3. Apakah ada sesuatu yang bergerak, berbunyi, atau berwarna tanpa makna? Jika ya, hapus.

## 2. Kode Warna Hubungan Sudut (penandaan / *signaling*)

Warna ini **tetap di seluruh aplikasi**, baik di 2D, 3D, tombol, chip, maupun umpan balik. Palet berbasis Okabe–Ito agar aman bagi buta warna, dan **selalu dipasangkan dengan simbol**.

| Hubungan | Token | Warna (terang / gelap) | Simbol pendamping | Rumus singkat |
|---|---|---|---|---|
| Berpelurus | `--rel-sup` | `#0072B2` / `#56B4E9` | garis lurus `—` + "180°" | ∠a + ∠b = 180° |
| Berpenyiku | `--rel-comp` | `#D55E00` / `#F0A35E` | kotak siku `∟` + "90°" | ∠a + ∠b = 90° |
| Bertolak belakang | `--rel-vert` | `#009E73` / `#4FD1A5` | tanda sama `=` / silang `✕` | ∠a = ∠b |
| Sudut yang ditanyakan | `--ask` | `#CC79A7` | tanda tanya `?` | — |
| Netral (garis bantu) | `--ink-muted` | abu-abu 500 | — | — |

Aturan:
- Pada satu gambar, **paling banyak 2 sudut berwarna**. Sudut lain tetap netral (abu-abu) agar perhatian tidak terpecah (EL05).
- Busur sudut berpenyiku selalu disertai tanda siku-siku pada sudut 90°-nya (isyarat visual kunci untuk IL05).
- Warna merah/hijau **tidak** dipakai untuk benar/salah agar tidak bentrok dengan kode hubungan. Benar ditandai ✓ dengan aksen netral; salah ditandai ikon ⓘ dan kalimat umpan balik.

## 3. Token Desain

```css
:root {
  /* hubungan */
  --rel-sup:#0072B2; --rel-comp:#D55E00; --rel-vert:#009E73; --ask:#CC79A7;
  /* dasar */
  --bg:#FAFAF7; --surface:#FFFFFF; --ink:#1F2328; --ink-muted:#6B7280; --line:#D9DCE1;
  --accent:#3B3F99;  /* aksi utama (tombol) */
  --radius:14px; --space:8px;
  --font: "Atkinson Hyperlegible", "Noto Sans", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --rel-sup:#56B4E9; --rel-comp:#F0A35E; --rel-vert:#4FD1A5;
  --bg:#14161A; --surface:#1D2026; --ink:#ECEDEE; --ink-muted:#9AA0A6; --line:#30343B; --accent:#A5A8FF;
}}
```

- **Tipografi**: Atkinson Hyperlegible (keterbacaan tinggi; disertakan lokal agar tetap berfungsi offline). Skala: 14 / 16 (isi) / 20 / 24 / 32. Angka sudut di gambar minimal 16 sp dan tebal.
- **Spasi**: kelipatan 8 dp. Margin layar 16 dp.
- **Area sentuh**: ≥ 48×48 dp; *handle* seret di Lab Sudut berukuran 44 dp (area sentuh 56 dp).

## 4. Pola Layar Inti

### 4.1 Tata letak "Gambar di atas, Langkah di bawah" (ponsel portrait)
```
┌──────────────────────────────┐
│ ←  Latihan 3/8      ●●●○○○○○ │  ← header tipis + progres
├──────────────────────────────┤
│                              │
│      [ GAMBAR SUDUT ]        │  ← ~45% tinggi, *sticky*
│    label angka di gambar     │    tidak tertutup keyboard
│                              │
├──────────────────────────────┤
│ ① Kenali ② Aturan ③ Hitung ④ Periksa │ ← indikator langkah K-A-H-P
│ ┌──────────────────────────┐ │
│ │ Langkah aktif (1 kalimat)│ │  ← hanya langkah aktif yang terbuka
│ │ [pilihan / isian]        │ │
│ └──────────────────────────┘ │
│ [💡 Petunjuk]   [Lanjut →]  │
├──────────────────────────────┤
│  NumPad aplikasi (muncul saat│  ← menggantikan keyboard sistem
│  langkah Hitung)  7 8 9 x ⌫ │
└──────────────────────────────┘
```

### 4.2 Landscape / Tablet (≥ 600 dp)
Gambar di kiri (55%) dan panel langkah di kanan (45%), berdampingan; NumPad berada di panel kanan.

### 4.3 Kartu Konsep (F3)
- Judul hubungan (berwarna) + simbol.
- Gambar 2D (60% layar).
- Satu kalimat inti ≤ 25 kata. Contoh: *"Dua sudut berpelurus jika keduanya membentuk garis lurus. Jumlahnya selalu 180°."*
- Rumus dalam kotak.
- Tombol sekunder: "Lihat di dunia nyata (3D)".
- **Bukan** paragraf panjang. Penjelasan tambahan ditaruh di tombol "Kenapa begitu?" (*progressive disclosure*).

### 4.4 Layar Pembanding "Berpelurus vs Berpenyiku" (sasaran IL01)
Dua panel berdampingan dengan struktur identik. Perbedaannya diberi *highlight*: garis lurus vs tanda siku-siku, 180 vs 90. Diakhiri pertanyaan cepat: "Kalau ada tanda ∟, jumlahnya berapa?"

### 4.5 Contoh Bertahap (F5)
- Tombol besar "Tunjukkan langkah berikutnya". Langkah yang sudah dibuka tetap terlihat dalam bentuk ringkas (satu baris) agar siswa bisa melihat kembali tanpa harus menggulir jauh.
- Pada langkah **Hitung**, setiap baris aljabar hanya mengubah satu hal, dan bagian yang berubah disorot:
  ```
  2x + 3x = 90
      5x  = 90        ← "gabungkan suku x"
       x  = 18        ← "bagi kedua ruas dengan 5"
  ∠A = 2·18 = 36°,  ∠B = 3·18 = 54°
  Periksa: 36° + 54° = 90° ✓
  ```
- Nilai yang ditemukan **langsung muncul di gambar** (label "2x" berubah menjadi "36°").

### 4.6 Umpan Balik
- Muncul di panel langkah (bukan *toast* yang cepat hilang), maksimal 2 kalimat, menunjuk ke gambar (sudut terkait berkedip lembut satu kali).
- Struktur: *apa yang terjadi* + *petunjuk arah*. Jangan langsung memberi jawaban.
  - ✗ "Salah!"
  - ✓ "Kamu memakai 180°. Lihat tanda ∟ di gambar. Itu artinya kedua sudut membentuk 90°."

### 4.7 Petunjuk Bertingkat
| Level | Isi | Contoh |
|---|---|---|
| 1 Arahan | Pertanyaan pemandu | "Apakah kedua sudut membentuk garis lurus atau siku-siku?" |
| 2 Aturan | Menyebut aturannya | "Sudut berpenyiku: jumlahnya 90°." |
| 3 Langkah | Langkah pertama dikerjakan | "Tulis: 2x + 3x = 90" |

### 4.8 Rating Usaha Mental (F9)
Satu layar, satu pertanyaan, 9 tombol dalam satu baris (atau slider) dengan label ujung "Sangat ringan" ↔ "Sangat berat". Bisa dijawab dalam ≤ 5 detik. Tidak diberi wajah emoji yang bisa menggiring jawaban.

## 5. Lab Sudut Interaktif (F4)

- Satu titik sudut (vertex) di tengah. Siswa menyeret *handle* berbentuk bulatan berwarna di ujung sinar.
- **Berpelurus**: garis dasar horizontal tetap; satu sinar bisa diputar 1°–179°. Tampil ∠a (biru) dan ∠b (biru muda), dengan persamaan hidup `a + b = 180°` di bawah gambar, dekat busur.
- **Berpenyiku**: sudut siku-siku tetap (dengan tanda ∟); sinar di dalamnya bisa diputar 1°–89°.
- **Bertolak belakang**: dua garis berpotongan; memutar satu garis membuat keempat sudut ikut berubah. Pasangan sudut yang sama besar diberi warna sama (hijau tua dan hijau muda), dan pasangan yang bersebelahan otomatis menunjukkan sifat berpelurus (tombol "Tunjukkan pasangan berpelurus").
- *Snap* opsional ke kelipatan 5°. Getaran halus (haptic) saat melewati 90°/45°.
- Pilihan "Tebak": salah satu label menjadi `?`, siswa mengetik tebakan, lalu aplikasi menampilkan nilainya.
- Aksesibilitas: *handle* bisa digeser dengan tombol −/+ (untuk siswa yang kesulitan menyeret).

## 6. Responsivitas (Android first)

| Lebar | Kelas | Tata letak |
|---|---|---|
| < 360 dp | Kecil | Gambar 40% tinggi, font isi 15 sp, NumPad 4 kolom |
| 360–599 dp | Ponsel (target utama) | Pola 4.1 |
| 600–899 dp | Tablet kecil / landscape | Pola 4.2 |
| ≥ 900 dp | Tablet besar / desktop | Pola 4.2, lebar konten maksimal 1040 px |

- Memakai `dvh` dan `env(safe-area-inset-*)`; hindari tinggi 100vh karena bermasalah dengan toolbar browser.
- Dicek pada: 320×568, 360×640, 393×851, 412×915, 800×1280.
- Gambar SVG memakai `viewBox` dan diskalakan; ketebalan garis dikunci dengan `vector-effect: non-scaling-stroke`.
- Tidak ada scroll horizontal.

## 7. Panduan Ilustrasi 3D (Three.js)

Prinsip: **3D menunjukkan "di mana sudut ini ada di dunia nyata", bukan pamer efek.**

| Adegan | Hubungan | Parameter yang bisa diubah | Sudut yang ditandai |
|---|---|---|---|
| Rambu silang X (`crossbuck`) | Bertolak belakang | Sudut antarpapan | Sudut atas & bawah |
| Pintu dari atas (`door`) | Berpelurus | Bukaan pintu | Pintu–ambang & pintu–dinding |
| Pojok taman (`garden`) | Berpenyiku | Arah jalan setapak | Jalan–pagar bawah & jalan–pagar samping (+ tanda siku) |
| Rangka layang-layang (`kite`) | Berpelurus (+ bertolak belakang) | Sudut antarbilah | Dua sudut bersebelahan |

> Revisi 14 Nov 2026 (D14): adegan gunting/laptop/persimpangan/palang/kertas **tidak dipakai** karena konteks itu ada di butir tes. Parameter dibangkitkan dari data misi; siswa memutar/memperbesar adegan, tidak mengubah parameternya (agar soal tetap tetap).

Aturan visual 3D:
- Gaya *low-poly* datar, warna objek netral pastel. **Hanya busur sudut yang memakai warna hubungan.**
- Busur dan label sudut digambar di atas objek (selalu terlihat, tidak tertutup), dengan label teks yang menghadap kamera.
- Latar polos, tanpa *skybox* dan tanpa animasi idle. Pencahayaan: 1 directional + 1 ambient.
- Kamera awal sudah memperlihatkan sudut dengan jelas. Rotasi dibatasi agar siswa tidak "tersesat". Ada tombol "Atur ulang".
- Tombol **"Lihat sebagai gambar 2D"**: kamera berpindah ke tampilan tegak lurus terhadap bidang sudut, lalu SVG 2D muncul (jembatan dari dunia nyata ke model matematis, sesuai proses *merumuskan* PISA).
- Transisi kamera ≤ 600 ms dan dinonaktifkan bila `prefers-reduced-motion` aktif.

## 8. Pedoman Penulisan Konten

- Kalimat ≤ 15 kata; satu ide per kalimat; kalimat aktif; sapaan "kamu".
- Istilah baku: *sudut berpelurus*, *sudut berpenyiku*, *sudut bertolak belakang*, *besar sudut*. Satu istilah untuk satu konsep, tanpa sinonim bergantian.
- Jangan menulis ulang di teks informasi yang sudah ada di gambar (prinsip redundansi).
- Simbol: ∠ untuk sudut, ° untuk derajat, variabel huruf kecil miring (*x*).
- Soal cerita: pisahkan blok **Diketahui** dan **Ditanya** dengan ikon. Tampilkan konteks dalam 1–2 kalimat saja.

## 9. Gerak, Suara, dan Gamifikasi

- Animasi hanya untuk: perubahan sudut (umpan balik langsung), transisi langkah (≤ 200 ms), dan sorotan sudut yang dirujuk umpan balik.
- Suara mati secara bawaan; boleh ada bunyi singkat untuk "benar" jika diaktifkan.
- Gamifikasi **ringan** (keputusan D8): bilah progres + lencana yang muncul **di akhir bagian**, bukan di tengah soal (agar tidak memotong fokus).
- **Tanpa** poin berjalan, papan peringkat, atau *countdown timer*.

### 9.2 Maskot Busu (D8b)
Busu adalah busur derajat setengah lingkaran (180°) berwarna kuning dengan mata, pipi, dan kaki. Warnanya sengaja **bukan** salah satu warna hubungan sudut. Bentuknya mengingatkan pada konsep "garis lurus = 180°". Komponen: `src/components/mascot/Busu.tsx` (ekspresi: `happy`, `think`, `cheer`, `oops`).

| Tempat | Ukuran | Gerak | Peran |
|---|---|---|---|
| Masuk, Beranda, layar penutup bagian | Besar (84–130 px) | Boleh bergoyang pelan (`bob`), mati bila *reduce motion* | Sapaan, motivasi, hasil |
| Kartu konsep, Lab, petunjuk, umpan balik | Kecil (≤ 56 px) | **Diam** | "Suara" yang menyampaikan kalimat inti/petunjuk (≤ 2 kalimat) |
| Mode tes (pretest/posttest), kuesioner | — | — | **Tidak tampil** (menjaga kesetaraan kondisi tes) |

Aturan: Busu tidak pernah menutupi gambar sudut, tidak bersuara, dan tidak menambah teks di luar balon kata. Ekspresi `oops` dipakai untuk jawaban salah (lembut, tidak mengejek), dan `cheer` untuk jawaban benar.

### 9.1 Layar Instrumen Penelitian
- **Mode tes** (pretest/posttest) memakai tampilan yang dibedakan dengan jelas: header abu-abu bertuliskan "Tes", tanpa tombol petunjuk, dan tanpa tanda ✓/ⓘ setelah menjawab. Tetap satu butir per layar, dengan navigasi "Sebelumnya/Berikutnya" dan ringkasan butir yang belum dijawab sebelum mengirim.
- **Kuesioner (IL/EL/GL, SUS, angket)**: satu butir per layar *atau* maksimal 3 butir pendek per layar; skala ditampilkan sebagai deretan tombol besar dengan label ujung; tanpa warna hubungan sudut (agar tidak memberi kesan benar/salah).
- Skala Paas: lihat §4.8.

## 10. Aksesibilitas
- Kontras teks ≥ 4.5:1; garis gambar ≥ 3:1 terhadap latar.
- Semua gambar SVG memiliki `aria-label` berisi deskripsi (mis. "Dua sudut berpelurus, sudut A 65 derajat, sudut B ditanyakan").
- Tidak mengandalkan warna saja (lihat §2).
- Mendukung pengaturan ukuran font sistem hingga 130% tanpa merusak tata letak.

## 11. Daftar Periksa Desain per Layar (Definition of Done)
- [ ] Hanya satu tujuan/langkah aktif.
- [ ] Teks ≤ 50 kata (kartu konsep ≤ 25 kata untuk kalimat inti).
- [ ] Angka/label berada di gambar, bukan di paragraf terpisah.
- [ ] Warna hubungan sesuai token dan disertai simbol.
- [ ] Maksimal 2 sudut berwarna di gambar.
- [ ] Gambar tidak tertutup keyboard/NumPad.
- [ ] Lulus uji pada 360×640 dan 800×1280, mode terang dan gelap.
- [ ] Tidak ada animasi dekoratif.
