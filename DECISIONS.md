# DECISIONS.md — Catatan Keputusan Desain & Arsitektur CobaSepakat

Dokumen ini mencatat keputusan-keputusan teknis dan desain yang diambil untuk mengimplementasikan Master Prompt CobaSepakat.

---

### 1. Logo & Identitas Merek
- **Aset Logo Asli & No-BG**: Berkas asli pengguna (`CobaSepakat_Embrace_Check_Logo_b88f63c7.png`) telah dipangkas rapat (*tightly cropped*) dan dihilangkan latar putihnya sehingga menjadi transparan penuh (*No-BG*). Tersedia varian resmi:
  - `cobasepakat-emblem-nobg.png`: Ikon dua sosok merangkul + centang (423x407 px, No-BG, ter-zoom rapat tanpa margin putih).
  - `cobasepakat-horizontal-nobg.png`: Kunci horizontal emblem + teks CobaSepakat (1347x170 px, No-BG).
  - `cobasepakat-logo-nobg.png`: Kunci tumpuk (1137x620 px, No-BG).
  - `cobasepakat-emblem-white-nobg.png`: Versi putih satu warna untuk latar gelap.
- **Komponen Multi-Varian**: Dibuat `<CobaSepakatLogo />` yang mendukung varian `full`, `horizontal`, `icon`, dan `white` dengan fallback vektor SVG presisi tinggi agar tampilan di mobile, header, surat resmi, dan cetak selalu tajam tanpa distorsi.
- **Warna Token**: Menggunakan token `#2272E8` (brand-blue), `#2FA882` (brand-green), `#153A73` (brand-navy), dan status warna (`#2272E8` berjalan, `#2FA882` sepakat, `#F59E0B` waspada, `#DC2626` berhenti).

---

### 2. Penebusan Multi-Peran (RBAC) pada Lingkungan Pratinjau
- **Keputusan**: Agar penguji dan evaluator dapat langsung menguji seluruh perspektif hak akses (RBAC) tanpa harus keluar-masuk akun berulang kali, disediakan pemilih peran interaktif di bilah atas:
  - *Bambang Wijaya* (Pengurus RT 04)
  - *Joko Santoso* (Pengusul Parkir Miring)
  - *Ratna Dewi* (Warga / Anggota Kontra)
  - *Hendra Setiawan, S.Sos* (Fasilitator Independen)
  - *Dr. Agus Pratama* (Pemantau Independen)
  - *Danang Kusuma* (Estate Manager Pengelola Kawasan)

---

### 3. Gerbang Kelayakan & Batasan Keselamatan (Safety Gate)
- **Penghalang Mutlak**: Butir 2 ("Dapat dibalik sepenuhnya") dan Butir 3 ("Tidak mengorbankan hak/keselamatan") jika dijawab `Tidak` otomatis mengunci pembuatan percobaan dan menampilkan pengalihan ramah ke Musyawarah Nilai / Mediasi.
- **Pemeriksa Kata Bermuatan Bias**: Formulir pembukaan isu menyertakan pemindai otomatis untuk mendeteksi kata-kata yang menyudutkan salah satu pihak.

---

### 4. Siklus 9 Tahap Terpadu
Setiap isu melalui alur terstruktur:
1. Isu Dibuka
2. Dugaan & Bukti Pengubah Pendapat (Mind-Changing Evidence)
3. Gerbang Kelayakan (7 butir wajib)
4. Desain Percobaan (Wizard metrik, garis dasar, anggaran, aturan berhenti)
5. Kesepakatan Desain (Kuorum & pernyataan komitmen bertanda waktu)
6. Pelaksanaan (Pencatatan cepat mobile, pemantauan guardrail, tombol "Hentikan Sekarang")
7. Evaluasi Hasil (Perbandingan garis dasar & pembaruan keyakinan / mind-shifting)
8. Keputusan Resmi (Adopsi, Ubah & coba lagi, Kembalikan, atau Naikkan ke musyawarah)
9. Tinjauan Lanjutan & Pustaka

---

### 5. Mode Luring & Aksesibilitas
- Font menggunakan Plus Jakarta Sans (teks) dan JetBrains Mono (data numerik).
- Memenuhi WCAG AA untuk kontras warna.
- Antarmuka mobile-first responsif dengan ukuran sentuh minimal 44px.

---

### 6. Company Profile Resmi & Navigasi Dua Arah (Company Profile ⇄ Demo)
- **Company Profile Interaktif**: Narasi komprehensif nilai dan paradigma baru, Bento Grid animasi 9 tahap, studi kasus Kluster Melati Lorong B, foto sinematik dokumenter, dan paket lembaga/kawasan.
- **Navigasi Dua Arah**: Akses bolak-balik yang mulus antara Company Profile dan Demo Interaktif melalui tombol header, banner atas demo ("← Kembali ke Company Profile Resmi"), dan footer.
- **Studio Logo & Brand Kit (No-BG)**: Modal khusus untuk mengunduh logo transparan resmi, menyalin kode HEX warna (`#2272E8`, `#2FA882`, `#153A73`), dan memahami makna filosofis logo.
