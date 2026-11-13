# Arsitektur — SudutKu

> Versi 0.1 (draf) · 13 November 2026 · Rujukan: [prd.md](prd.md), [desain.md](desain.md), [api.md](api.md)

## 1. Keputusan Teknologi

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Bahasa | **TypeScript** (strict) | Tipe aman untuk logika soal dan pemeriksa jawaban. |
| UI | **React 18 + Vite** | Ekosistem besar, mudah dikerjakan dengan AI agent, build cepat. |
| Styling | **Tailwind CSS** + design token (CSS variables) | Responsif dengan cepat; token warna hubungan sudut terpusat. |
| Gambar 2D | **SVG** (komponen React buatan sendiri) | Tajam di semua layar, ringan, label menyatu dengan gambar (anti *split-attention*), aksesibel. |
| Ilustrasi 3D | **Three.js** (vanilla, dibungkus komponen React) | Sesuai permintaan; tanpa lapisan abstraksi tambahan, sehingga ukuran dan kendali *render loop* lebih terjaga. |
| State | **Zustand** | Sederhana dan ringan. |
| Penyimpanan | **IndexedDB via Dexie** | Offline-first; data progres, log, dan rating. |
| Routing | **React Router** (browser history) | Tombol/gestur *back* Android bekerja lewat History API. |
| PWA | **vite-plugin-pwa** (Workbox) | **Satu-satunya kanal distribusi** (keputusan D4): dipasang dari Chrome Android, berjalan offline, bisa diperbarui otomatis. |
| API Web | Vibration, Web Share (files), Storage (`persist`), Screen Orientation | Pengganti fitur native: haptic, berbagi file ekspor, penyimpanan persisten. |
| Ekspor | **fflate** (ZIP kecil) | Membuat ZIP berisi CSV di perangkat. |
| Uji | **Vitest** (unit), **Testing Library** (komponen), **Playwright** (E2E dengan emulasi ponsel) | |
| Kualitas | ESLint + Prettier, `tsc --noEmit` di CI | |

> Alternatif yang ditolak: Flutter/Kotlin native (Three.js tidak bisa dipakai langsung; kurva belajar lebih tinggi bagi pengembang tunggal), Capacitor/APK (tidak diperlukan karena distribusi hanya PWA; bisa ditambahkan nanti tanpa mengubah kode inti), dan React Three Fiber (menambah ukuran dan abstraksi).

## 2. Gambaran Sistem

```
┌───────────────────────────── Perangkat Android ─────────────────────────────┐
│  Chrome Android — PWA terpasang (standalone) + Service Worker (offline)      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ UI (React)  pages/ · components/ · features/*                         │  │
│  │   │                │                     │                            │  │
│  │   ▼                ▼                     ▼                            │  │
│  │ Figure2D (SVG)   Scene3D (Three.js, lazy chunk)   StepPanel K-A-H-P   │  │
│  │   │                │                     │                            │  │
│  │   └────────┬───────┴─────────────────────┘                            │  │
│  │            ▼                                                          │  │
│  │ DOMAIN (TypeScript murni, tanpa React/DOM)                            │  │
│  │   geometry · problems(generator, templates) · checker(+misconceptions)│  │
│  │   learner-model · scaffolding-policy · literacy                       │  │
│  │            │                                                          │  │
│  │            ▼                                                          │  │
│  │ DATA  content/*.json (materi, soal, adegan) · repo (Dexie/IndexedDB)  │  │
│  │       telemetry (event log) · export (CSV/JSON)                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  Web API: History(back) · Vibration · Web Share/unduh (ekspor) · Storage    │
└─────────────────────────────────────────────────────────────────────────────┘
           │ ekspor manual (ZIP CSV) — TIDAK ADA server di v1 (keputusan D3)
           ▼
   Laptop peneliti → Excel/SPSS
```

**Aturan dependensi:** `ui → features → domain`. `domain` tidak boleh mengimpor React, DOM, Three.js, atau Dexie. `data` diakses lewat antarmuka *repository*.

## 3. Struktur Folder (rencana)

```
sudutku/
├─ public/                     # ikon (maskable 192/512), font, screenshot manifest
├─ content/                    # konten sebagai data (divalidasi skema)
│  ├─ concepts/*.json          # kartu konsep per hubungan
│  ├─ worked-examples/*.json
│  ├─ problems/bank/*.json     # soal buatan peneliti
│  ├─ problems/templates/*.json
│  ├─ literacy/*.json          # Misi Dunia Nyata
│  └─ instruments/*.json       # pretest/posttest, kuesioner (mode penelitian)
├─ src/
│  ├─ app/                     # bootstrap, router, providers, tema
│  ├─ pages/                   # Beranda, Kenali, Lab, Contoh, Latihan, Misi, Progres, Pengaturan
│  ├─ features/
│  │  ├─ concept/              # F3
│  │  ├─ angle-lab/            # F4
│  │  ├─ worked-example/       # F5
│  │  ├─ practice/             # F6 (panel K-A-H-P, petunjuk, umpan balik)
│  │  ├─ literacy-mission/     # F7
│  │  ├─ self-explain/         # F8
│  │  ├─ effort-rating/        # F9 skala Paas
│  │  ├─ questionnaire/        # F9 IL/EL/GL, F14 SUS & angket (renderer skala generik)
│  │  ├─ assessment/           # F10 mode tes pretest/posttest
│  │  ├─ researcher/           # F13 Mode Peneliti (PIN, kunci tes, ekspor)
│  │  └─ progress/             # F11
│  ├─ components/              # Button, Card, NumPad, StepDots, ColorChip, ...
│  ├─ figure2d/                # renderer SVG: AngleFigure, Arc, Label, DragHandle
│  ├─ three/                   # Scene3D, sceneRegistry, scenes/*.ts, disposal utils
│  ├─ domain/
│  │  ├─ geometry/             # tipe Relation, aturan, validasi sudut
│  │  ├─ algebra/              # parser & penyelesai ekspresi linear ax+b
│  │  ├─ problems/             # generator dari template, seed RNG
│  │  ├─ checker/              # pemeriksa jawaban + deteksi miskonsepsi
│  │  ├─ learner/              # model penguasaan per keterampilan (KC)
│  │  ├─ scaffolding/          # kebijakan level bantuan & pemilihan soal
│  │  └─ scoring/              # skor tes, N-gain, subskala IL/EL/GL, skor SUS
│  ├─ data/                    # db.ts (Dexie), repositories, telemetry, export
│  ├─ platform/                # adaptor Web API: haptic, share/unduh, storage persist, deteksi in-app browser, install prompt
│  └─ styles/                  # tokens.css, tailwind.css
├─ tests/                      # e2e Playwright
└─ docs: prd.md, architecture.md, desain.md, api.md, task.md, agents.md, readme.md
```

## 4. Model Domain

### 4.1 Hubungan sudut
```ts
type Relation = 'supplementary'  // berpelurus: a + b = 180
              | 'complementary'  // berpenyiku: a + b = 90
              | 'vertical';      // bertolak belakang: a = b
```
Nama di kode memakai istilah Inggris; teks UI memakai istilah Indonesia (lihat glosarium di [agents.md](agents.md)).

### 4.2 Keterampilan / Knowledge Components (KC)
| KC | Deskripsi | TP |
|---|---|---|
| `KC_IDENTIFY` | Mengenali jenis hubungan dari gambar | TP1 |
| `KC_RULE` | Memilih aturan/persamaan yang tepat | TP2 |
| `KC_NUMERIC` | Menghitung dengan bilangan | TP3 |
| `KC_ALGEBRA` | Menyelesaikan soal bervariabel | TP3 |
| `KC_INTERPRET` | Memeriksa kewajaran & menafsirkan konteks | TP4 |
| `KC_FORMULATE` | Memodelkan situasi nyata/3D | TP5 |

Setiap KC dilacak per hubungan (mis. `KC_RULE:complementary`), karena miskonsepsi biasanya spesifik pada hubungan tertentu.

## 5. Mesin Soal & Pemeriksa

- **Template soal** mendefinisikan hubungan, bentuk ekspresi (mis. `ax`, `ax+b`), dan batas nilai. Generator memakai RNG ber-*seed* (dapat direproduksi untuk penelitian), lalu menolak hasil yang tidak valid (sudut ≤ 0°, x bukan bilangan bulat, sudut berpenyiku ≥ 90°, dan sebagainya).
- **Aljabar**: hanya ekspresi linear satu variabel. Persamaan selalu berbentuk `E1 + E2 = 180`, `E1 + E2 = 90`, atau `E1 = E2`. Parser kecil buatan sendiri; tidak memakai CAS.
- **Pemeriksa** mengembalikan `correct`, `misconception?`, dan `feedbackKey`. Daftar miskonsepsi awal:

| Kode | Pola | Deteksi |
|---|---|---|
| `M_SUP_AS_COMP` | Memakai 90 pada sudut berpelurus | jawaban = 90 − diketahui |
| `M_COMP_AS_SUP` | Memakai 180 pada sudut berpenyiku | jawaban = 180 − diketahui |
| `M_VERT_AS_SUP` | Sudut bertolak belakang dianggap berjumlah 180 | jawaban = 180 − diketahui |
| `M_X_NOT_ANGLE` | Menjawab nilai x, bukan besar sudut | jawaban = x |
| `M_SUBST_ERR` | Salah substitusi x | x benar, sudut salah |
| `M_ARITH` | Salah hitung | aturan benar, selisih kecil |

## 6. Adaptivitas (Learner Model & Scaffolding)

**Model penguasaan (v1, sederhana dan transparan):** setiap KC menyimpan skor `p ∈ [0,1]` yang diperbarui dengan *exponential moving average*:
`p ← p + α·(hasil − p)`, dengan α = 0,3. Hasil bernilai 1 (benar tanpa petunjuk), 0,6 (benar dengan petunjuk level 1), 0,3 (benar setelah petunjuk level 2–3), atau 0 (salah).
Status: `belum` (p < 0,4), `berkembang` (0,4–0,8), `menguasai` (p ≥ 0,8 dan minimal 4 percobaan).

> Pilihan EMA dibuat agar mudah dijelaskan di skripsi. BKT (*Bayesian Knowledge Tracing*) bisa menjadi pengembangan lanjutan.

**Kebijakan bantuan (*fading*, *expertise reversal*):**

| Kondisi KC | Mode soal | Petunjuk |
|---|---|---|
| `belum` | Soal melengkapi: langkah **Kenali + Aturan** sudah dicontohkan, siswa menghitung & memeriksa | Petunjuk bertingkat saat diminta |
| `berkembang` | Soal melengkapi: hanya **Kenali** dicontohkan | Petunjuk bertingkat saat diminta |
| `menguasai` | Soal mandiri (semua langkah K-A-H-P) | Petunjuk bertingkat saat diminta |

*Implementasi (14 Nov 2026):* `src/domain/scaffolding/policy.ts` (`GIVEN_BY_LEVEL`, *backward fading*). Tingkat ditentukan oleh keterampilan **terlemah** di antara Kenali/Aturan/Hitung untuk hubungan itu. Contoh lengkap (*worked example*) disajikan terpisah di halaman Contoh Bertahap. Skor langkah: benar tanpa bantuan 1; ≤ 1 petunjuk/kesalahan 0,6; lebih dari itu 0,3; jawaban ditunjukkan 0. Soal aljabar suatu hubungan terbuka setelah soal angkanya ≥ `berkembang`. Soal latihan **tidak pernah** sama dengan butir pretest/posttest (`src/data/exclusions.ts`, diuji). Aturan *downgrade* karena rating usaha mental tinggi belum diimplementasikan.

Turun satu level jika siswa salah 2 kali berturut-turut, atau jika rating usaha mental ≥ 7 disertai skor rendah.
**Pemilihan soal berikutnya:** prioritaskan KC dengan p terendah yang prasyaratnya sudah terpenuhi (urutan: IDENTIFY → RULE → NUMERIC → ALGEBRA → INTERPRET/FORMULATE), sambil menyelingi hubungan yang berbeda (*interleaving*) setelah status `berkembang` tercapai.
Semua parameter (α, ambang) disimpan di `src/domain/scaffolding/config.ts` dan bisa diubah dari Mode Peneliti.

## 7. Subsistem 3D (Three.js)

- Komponen `<Scene3D sceneId=… params=… onSelectAngle=…/>` dimuat dengan `React.lazy` + `import()` sehingga Three.js berada di chunk terpisah.
- *Implementasi v0.1:* `src/three/engine.ts` (renderer, OrbitControls, CSS2DRenderer, busur tabung + sektor transparan, terbang kamera ke tampilan 2D, `dispose`) dan `src/three/scenes.ts` (4 adegan prosedural: `crossbuck`, `door`, `garden`, `kite`; tiap adegan mengembalikan objek, bidang sudut, busur, dan posisi kamera). `Scene3D.tsx` dimuat lazy; chunk `three` ±127 KB gzip, ikut di-*precache*.
- Pemilihan sudut dengan mengetuk objek 3D (`pick`) **belum** diimplementasikan; langkah *Rumuskan* memakai pilihan jenis hubungan + tampilan 2D.
- **Render on demand**: render hanya saat ada interaksi/perubahan parameter, tidak memakai loop 60 fps terus-menerus.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; antialias dimatikan pada perangkat lemah; geometri *low-poly* dan material sederhana (tanpa bayangan real-time pada v1).
- Label sudut di 3D memakai **CSS2DRenderer**/sprite agar angka tetap terbaca (prinsip P2).
- Kontrol: OrbitControls dengan batas sudut pandang, mendukung sentuhan (putar 1 jari, zoom 2 jari), serta tombol "Atur ulang tampilan".
- Deteksi WebGL; jika gagal atau terjadi *context loss*, tampilkan gambar SVG cadangan dari data adegan yang sama.
- `dispose()` wajib membersihkan geometry, material, texture, dan renderer saat keluar layar (mencegah kebocoran memori di browser ponsel).

- Service worker didaftarkan **saat aplikasi pertama dibuka** (`src/platform/pwa.ts`), bukan menunggu Beranda, agar halaman Masuk pun langsung tersedia offline (ditemukan oleh tes E2E mode pesawat).

## 8. Data & Telemetri

Tabel Dexie (detail skema di [api.md](api.md)): `profiles`, `mastery` (per KC), `attempts`, `events`, `ratings`, `assessments`, `questionnaires`, `settings`.
- Penilaian otomatis (skor tes, N-gain, rata-rata IL/EL/GL, skor SUS) dihitung oleh fungsi murni di `src/domain/scoring/` dan diuji unit. Data mentah tetap diekspor agar peneliti bisa menghitung ulang.
- Ditulis setiap kali ada jawaban (tahan terhadap force-close).
- Ekspor: CSV (satu file per tabel, dikompres ZIP) atau JSON. Dibagikan lewat `navigator.share({files})` jika didukung; jika tidak, diunduh ke folder Download.
- Saat pertama kali dibuka, aplikasi memanggil `navigator.storage.persist()` dan mencatat hasilnya (ikut diekspor di `meta.json`).
- Tidak menyimpan nama lengkap; `studentCode` dibuat oleh peneliti.

## 9. Platform: PWA di Android

- **Manifest**: `name: "SudutKu"`, `display: "standalone"`, `orientation: "any"`, `theme_color`/`background_color` sesuai token, ikon *maskable* 192/512, `start_url: "/?source=pwa"`.
- **Service worker** (Workbox, `generateSW`): *precache* seluruh shell, konten JSON, font, dan chunk Three.js/adegan agar 100% offline setelah kunjungan pertama. Strategi pembaruan: `prompt`. Banner "Versi baru tersedia" hanya muncul di Beranda, tidak di tengah soal.
- **Instalasi**: tangkap `beforeinstallprompt` dan tampilkan tombol "Pasang aplikasi" di Beranda, disertai panduan bergambar untuk browser yang tidak mendukung.
- **Browser in-app** (WhatsApp, Instagram, dan sejenisnya): deteksi lewat user-agent, lalu tampilkan petunjuk "Buka di Chrome", karena link akan sering dibagikan lewat WhatsApp.
- **Tombol back Android**: setiap langkah K-A-H-P dan setiap layar didorong ke History API. *Back* mundur satu langkah, lalu satu layar; di Beranda, konfirmasi keluar.
- **Orientasi**: bebas (portrait sebagai mode utama); tata letak menyesuaikan (lihat desain.md §6).
- **Safe area**: `viewport-fit=cover` + `env(safe-area-inset-*)`.
- **Hosting**: Vercel, statis (lihat §12.2). Tidak ada kode server.

## 10. Kinerja & Anggaran

| Item | Anggaran |
|---|---|
| JS awal (gzip) | ≤ 250 KB |
| Chunk Three.js + adegan (gzip) | ≤ 200 KB, dimuat lazy (di-*precache* di latar belakang setelah instalasi) |
| Aset per adegan 3D | ≤ 300 KB (geometri prosedural lebih diutamakan daripada model GLTF) |
| LCP pada perangkat kelas bawah | ≤ 3 s |
| Memori saat 3D aktif | ≤ 150 MB |

## 11. Keamanan & Privasi
- Tidak meminta izin browser apa pun (lokasi, kamera, notifikasi).
- Tanpa analitik/pelacak pihak ketiga; tidak ada permintaan jaringan selain mengambil aset aplikasi dari host sendiri.
- PIN Mode Peneliti disimpan sebagai hash.
- Data tidak pernah meninggalkan perangkat kecuali diekspor secara manual oleh peneliti.

## 12. Keputusan
| # | Keputusan | Status |
|---|---|---|
| D1 | Cakupan: 3 hubungan saja | ✅ 13 Nov 2026 |
| D3 | Tanpa backend; offline + ekspor CSV | ✅ 13 Nov 2026 |
| D4 | Distribusi PWA saja (tanpa Capacitor/APK) | ✅ 13 Nov 2026 |
| D11 | Hosting di Vercel (`*.vercel.app`, statis, HTTPS bawaan) | ✅ 13 Nov 2026 |
| D12 | Multi-profil per perangkat + ganti sesi | ✅ 13 Nov 2026 |

### 12.1 Multi-profil (D12)
- Setiap baris data menyimpan `profileId`; semua query repository **wajib** difilter dengan `profileId` sesi aktif (diuji di unit test repository).
- State Zustand di-*reset* total saat ganti siswa (tidak boleh ada sisa state soal dari siswa sebelumnya).
- Tabel `sessions` mencatat masuk/keluar; ekspor berisi **semua profil** di perangkat beserta `deviceId`.
- Kunci unik saat penggabungan lintas perangkat: `(deviceId, localId)`.

### 12.2 Vercel
- Proyek Vite statis; `vercel.json` berisi *rewrite* SPA ke `index.html` dan header `Cache-Control: no-cache` untuk `sw.js` serta `index.html` (aset ber-hash di-cache panjang).
- Deploy dari GitHub: branch `main` → produksi, branch lain → URL *preview*.
- **Jangan deploy ke produksi selama pertemuan uji coba berlangsung**, agar versi aplikasi tetap sama untuk semua siswa.
