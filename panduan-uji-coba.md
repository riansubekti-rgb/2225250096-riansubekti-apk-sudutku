# Panduan Uji Coba SudutKu di Kelas

> Untuk: peneliti dan guru pendamping. Cetak dokumen ini dan bawa saat uji coba.
> Versi aplikasi 0.1 · desain uji coba: 2 pertemuan (prd.md D9).

Hal terpenting: **data siswa hanya tersimpan di HP masing-masing.** Tidak ada server. Jika data tidak diekspor sebelum HP dibawa pulang, data itu bisa hilang. Ekspor data di **setiap HP** pada akhir **setiap pertemuan**.

---

## 1. Persiapan (H-7 sampai H-1)

- [ ] Aplikasi sudah online, mis. `https://sudutku.vercel.app` (lihat readme.md › *Memasang aplikasi online*).
- [ ] Coba sendiri dari HP Android: buka link di **Chrome**, pasang ke layar utama, lalu nyalakan mode pesawat dan pastikan aplikasi tetap terbuka.
- [ ] Instrumen (soal tes, angket) sudah divalidasi dan file DRAF sudah diganti. Selama masih draf, Mode Peneliti menampilkan peringatan ⚠️.
- [ ] **Cetak kartu kode siswa:** Halaman Masuk › *Mode Peneliti* › buat PIN › *Kartu kode siswa* › isi huruf kelas (mis. `A`) dan jumlah siswa › *Tampilkan* › *Cetak*. Gunting kartunya, satu kartu per siswa.
- [ ] Buat **daftar pasangan nama siswa ↔ kode** di kertas atau Excel milik peneliti. Daftar ini **tidak** dimasukkan ke aplikasi dan disimpan terpisah dari data penelitian.
- [ ] Siapkan surat izin sekolah dan persetujuan orang tua (lihat privasi-dan-persetujuan.md).
- [ ] Kirim link ke grup kelas sehari sebelumnya, dengan pesan: *"Buka link ini di Chrome, ketuk ⋮ › Tambahkan ke layar utama."* Pemasangan sebelum hari H menghemat kuota dan waktu.
- [ ] Siapkan 2–3 HP cadangan yang aplikasinya sudah terpasang.

**Kode dari guru** (ditulis di papan tulis, lalu diketik siswa di Beranda › 🔑 *Punya kode dari guru?*):

| Kode | Membuka |
|---|---|
| `TESAWAL` | Tes Awal (pretest) |
| `ANGKET1` | Angket beban belajar, pertemuan 1 |
| `ANGKET2` | Angket beban belajar, pertemuan 2 |
| `TESAKHIR` | Tes Akhir (posttest) |
| `PENDAPAT` | Angket kemudahan (SUS) + pendapat siswa |

> Kode bisa diganti di `content/instruments/access-codes.json`, lalu aplikasi dipasang ulang.

---

> 🎵 **Musik & 🔊 suara Busu:** layar pertama adalah "Ketuk untuk mulai!" — setelah diketuk, musik menyala dan Busu berbicara otomatis. Musik hanya di layar santai (berhenti saat belajar/tes). Tombol 🎵 dan 🔊 di kanan atas untuk mematikannya.
>
> 🔊 **Suara Busu:** Busu berbicara otomatis. Di kelas, minta siswa **memakai earphone** atau **mengecilkan volume**. Bila kelas terlalu ramai, ketuk **🔊 di kanan atas** sehingga menjadi 🔇 (tersimpan di HP itu).

## 2. Pertemuan 1 (± 80 menit)

| Menit | Kegiatan | Yang dilakukan |
|---|---|---|
| 0–10 | Pembukaan | Bagikan kartu kode. Siswa membuka SudutKu di Chrome atau dari ikon di layar utama, lalu **mengetik kode siswanya** dan nama panggilan. |
| 10–25 | **Tes Awal** | Tulis `TESAWAL` di papan. Siswa: 🔑 › ketik kode › kerjakan 10 soal › *Kirim*. Selama tes, materi terkunci. |
| 25–35 | Pemanasan | Bagian 1 |
| 35–50 | Kenali Hubungan + Lab Sudut | Bagian 2–3 |
| 50–70 | Contoh Bertahap + Latihan | Bagian 4–5. Setelah setiap 5 soal latihan muncul skala usaha mental (1–9). |
| 70–75 | **Angket beban belajar** | Tulis `ANGKET1` di papan. |
| 75–80 | Penutup | Siswa ketuk namanya (kanan atas) › *Keluar & ganti siswa*. **Peneliti mengekspor data di setiap HP** (lihat §4). |

## 3. Pertemuan 2 (± 80 menit)

| Menit | Kegiatan | Yang dilakukan |
|---|---|---|
| 0–5 | Masuk | Siswa mengetik **kode yang sama** dengan pertemuan 1. Boleh di HP yang berbeda; data digabung saat analisis. |
| 5–35 | Latihan lanjutan | Bagian 5 (soal ber-x akan muncul jika siswa sudah siap) |
| 35–55 | Misi Dunia Nyata (3D) | Bagian 6 |
| 55–60 | **Angket beban belajar** | `ANGKET2` |
| 60–75 | **Tes Akhir** | `TESAKHIR` |
| 75–80 | **Angket kemudahan & pendapat** | `PENDAPAT`. Lalu *Keluar & ganti siswa* dan **ekspor data**. |

---

## 4. Mengekspor data (WAJIB di setiap HP, setiap pertemuan)

1. Pastikan siswa sudah keluar (kanan atas › *Keluar & ganti siswa*).
2. Halaman Masuk › *Mode Peneliti* › masukkan PIN. Jika HP ini baru, buat PIN dulu.
3. Ketuk **⬇️ Ekspor data (ZIP berisi CSV)**.
4. Pilih **WhatsApp ke diri sendiri** atau **Google Drive**. Jika muncul unduhan, file ada di folder *Download*.
5. Nama file berbentuk `sudutku_semua_<idHP>_<tanggal-jam>.zip`. Kumpulkan semua ZIP dalam satu folder per pertemuan.
6. Centang di daftar: *HP siswa A01 — sudah diekspor*.

> Data **tidak terhapus** setelah ekspor. Jika ragu, ekspor ulang saja; file baru selalu berisi seluruh data di HP itu.

---

## 5. Masalah yang mungkin muncul

| Masalah | Penyelesaian |
|---|---|
| Link dibuka dari WhatsApp dan muncul peringatan "Buka di Chrome" | Ketuk ⋮ › *Buka di Chrome* (atau *Buka di browser*). |
| "Kode belum tepat" | Cek huruf terakhir kode. Kode punya huruf cek, jadi salah ketik satu angka pasti ditolak. Ini sengaja, agar data tidak tercampur. |
| Siswa masuk dengan kode teman | Ketuk nama di kanan atas › *Keluar & ganti siswa* › masuk lagi dengan kode yang benar. Catat kejadiannya untuk pembersihan data. |
| HP mati di tengah tes | Nyalakan lagi, buka SudutKu, masuk dengan kode yang sama, lalu buka Tes Awal/Akhir. **Jawaban yang sudah dipilih tetap ada.** |
| HP dibiarkan 20 menit | Sesi tertutup otomatis. Progres tetap tersimpan, siswa cukup masuk lagi. |
| Gambar 3D tidak muncul / HP lambat | Aplikasi otomatis memakai gambar 2D. Kegiatan tetap bisa dilanjutkan. |
| Siswa menghapus data Chrome | Data di HP itu hilang. Karena itu ekspor dilakukan di akhir **setiap** pertemuan. Ingatkan siswa untuk tidak membersihkan Chrome selama penelitian. |
| "Ada versi baru SudutKu" | Ketuk *Perbarui* **hanya di Beranda dan sebelum kegiatan dimulai**. Jangan memperbarui aplikasi online di tengah pertemuan. |
| Lupa PIN peneliti | PIN tersimpan per HP. Buat ulang tidak bisa tanpa menghapus data. Catat PIN dan gunakan PIN yang sama di semua HP. |

---

## 6. Daftar periksa akhir pertemuan

- [ ] Semua siswa sudah *Keluar & ganti siswa*.
- [ ] Semua HP sudah diekspor, dan jumlah ZIP sama dengan jumlah HP yang dipakai.
- [ ] ZIP sudah disalin ke laptop **dan** ke cadangan kedua (Drive/flashdisk).
- [ ] Catatan kejadian khusus ditulis (siswa absen, HP rusak, salah kode, dll.).
