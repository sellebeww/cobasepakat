<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/cobasepakat-horizontal-white-nobg.png">
  <img src="public/brand/cobasepakat-horizontal-nobg.png" alt="CobaSepakat" width="300">
</picture>

<h1>CobaSepakat</h1>

</div>

<p align="center">
  Platform musyawarah berbasis <b>percobaan terukur</b> dan <b>keputusan berbasis data</b> untuk komunitas, RT/RW, dan organisasi<br>
  (perbedaan pendapat faktual, uji coba lapangan, aturan berhenti darurat).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=555" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white&labelColor=555" alt="TypeScript 7">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&labelColor=555" alt="Vite 8">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&labelColor=555" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/Vercel-siap_deploy-000000?logo=vercel&logoColor=white&labelColor=555" alt="Vercel">
</p>

**Resolusi perselisihan berbasis percobaan.** Alih-alih berdebat tanpa ujung soal fakta yang bisa diuji, warga menyepakati sebuah percobaan terukur, menjalankannya dalam waktu singkat, lalu memutuskan berdasarkan data.

![Landing page CobaSepakat](docs/screenshots/01-landing.png)

## Cara kerjanya

Setiap isu berjalan melalui sembilan tahap:

1. Isu dibuka
2. Dugaan dan bukti dikumpulkan
3. Gerbang kelayakan (apakah aman dan layak diuji?)
4. Desain percobaan
5. Kesepakatan desain sebelum percobaan dimulai
6. Pelaksanaan (contoh: 14 hari)
7. Evaluasi hasil terhadap kriteria yang sudah disepakati
8. Keputusan resmi
9. Tinjauan lanjutan

Kriteria keberhasilan dikunci di muka, sehingga hasil tidak bisa ditafsirkan ulang sesudah data masuk.

## Fitur utama

### Dasbor Ruang
Ringkasan isu, percobaan yang sedang berjalan, dan keputusan terbaru untuk satu ruang komunitas.

![Dasbor Ruang](docs/screenshots/02-dashboard.png)

### Isu & Percobaan
Alur lengkap satu isu: dugaan berbeda beserta bukti pengubah pendapat, hasil gerbang kelayakan, desain percobaan, pelaksanaan, hingga evaluasi.

![Isu dan Percobaan](docs/screenshots/03-isu.png)

### Dasbor Percobaan
Pusat kendali percobaan yang sedang berjalan: progres hari ke-N, aturan keputusan yang disepakati di muka, metrik lapangan terhadap garis dasar, dan status aturan berhenti darurat (guardrails).

![Dasbor Percobaan](docs/screenshots/10-percobaan.png)

### Buka Isu Baru
Warga dapat mengajukan pertanyaan keputusan baru langsung dari dasbor.

![Buka isu baru](docs/screenshots/09-isu-baru.png)

### Pustaka Keputusan
Arsip keputusan resmi beserta dasar datanya, supaya perdebatan yang sama tidak diulang dari nol.

![Pustaka Keputusan](docs/screenshots/04-pustaka.png)

### Templat Uji Coba
Rancangan percobaan siap pakai untuk kasus yang sering muncul.

![Templat Uji Coba](docs/screenshots/05-templat.png)

### Analitik Dampak
Waktu capai keputusan, kepatuhan terhadap kriteria, penerimaan pihak yang berseberangan, pergeseran pendapat, serta ekspor laporan CSV.

![Analitik Dampak](docs/screenshots/06-analitik.png)

### Layanan Fasilitasi
Direktori fasilitator untuk isu yang butuh pendamping netral.

![Layanan Fasilitasi](docs/screenshots/07-fasilitator.png)

### Log Audit
Jejak setiap perubahan penting agar proses tetap transparan dan bisa dipertanggungjawabkan.

![Log Audit](docs/screenshots/08-audit.png)

### Responsif
Landing page dan demo tampil nyaman di layar ponsel.

<img src="docs/screenshots/11-mobile.png" alt="Tampilan mobile" width="280">

## Teknologi

React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · Lucide

Aplikasi ini sepenuhnya sisi klien (SPA statis). Tidak ada backend, database, atau API key; data demo disimpan di `localStorage` peramban.

## Menjalankan secara lokal

Prasyarat: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # hasil build ke dist/
npm run lint     # pengecekan tipe
```

## Deploy ke Vercel

Vercel mendeteksi Vite secara otomatis. Impor repositori ini, lalu biarkan pengaturan bawaan:

| Pengaturan | Nilai |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | tidak ada |

## Author & License

Created by Vassel Goleyu. Copyright (c) 2026 Vassel Goleyu. All rights reserved.
