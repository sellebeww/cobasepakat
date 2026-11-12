# Rencana Perbaikan CobaSepakat (branch `improve/collaborative`)

Dokumen ini ditulis sebelum pengerjaan. Isinya audit kondisi awal, model data dan peran, keputusan stack beserta alasan, dan urutan kerja. Perubahan yang ternyata berbeda dari rencana dicatat di bagian "Keputusan yang perlu dicek" pada PR.

## 1. Audit kondisi awal

Basis kode: React 19, TypeScript, Vite, Tailwind 4, sekitar 8.500 baris. Seluruh state ada di satu `AppContext` (784 baris) dan disimpan di `localStorage`. Belum ada test, lint hanya `tsc --noEmit`.

### 1.1 Logika keputusan tersebar di komponen UI

| Lokasi | Masalah |
| --- | --- |
| `EvaluationView.tsx` | Verdict "Kriteria Adopsi Terpenuhi Secara Signifikan" memakai `metCount >= 3` yang di-hardcode (bukan dari aturan keputusan percobaan). Kata "signifikan" tidak didukung uji statistik apa pun. |
| `EvaluationView.tsx`, `ExperimentDashboard.tsx` | "Nilai saat ini" hanya entri terakhir (`currentValue`), bukan ringkasan seluruh data. Tidak ada ukuran sampel, tidak ada interval ketidakpastian. Satu angka acak bisa membalik verdict. |
| `ExperimentDashboard.tsx` | Progres hari ke-8 di-hardcode. |
| `AppContext.submitApproval` | Kuorum memakai angka tetap `>= 4`, abai `quorumPercentage` ruang. Variabel `quorumTarget` dihitung tetapi tidak dipakai. Suara "keberatan" tidak berpengaruh. |
| `AppContext.addDataEntry` | `dayNumber` dihitung dari `jumlah entri % durasi`, bukan dari tanggal. |
| `AppContext.triggerEmergencyStop` | Aturan berhenti hanya bisa dipicu manual, dan memicu semua aturan sekaligus. Aturan yang punya `metricTriggerId` dan `thresholdLimit` tidak pernah dievaluasi otomatis. |
| `AppContext.recordDecision` | Menulis `acceptanceAverageScore: 4.5` dan `acceptancePercentage: 90` sebagai konstanta. Itu data karangan yang tampil seolah hasil survei. |
| `DecisionModal.tsx` | Alasan keputusan default berisi angka karangan ("membaik 21.9%", "keluhan turun 58%"). |
| `AnalyticsDashboard.tsx` | Kartu "16 Hari / -64%", "94.2%", "84.0%", "68.5%", "4 Isu (44%)", "6 Kasus (86%)" semuanya literal. Tidak ada dasar data. |
| `LandingMarketing.tsx`, `CompanyProfile.tsx` | Klaim "Penerimaan warga mencapai 84%" dan angka serupa tanpa sumber. |
| `AppContext.submitAcceptanceRating` | Hanya menulis log audit. Jawaban survei tidak disimpan. |

Aturan keputusan (`decisionRule`) hanya teks bebas, sehingga tidak bisa dievaluasi mesin. Garis dasar hanya satu angka tanpa ukuran sampel.

### 1.2 Integritas dan multi-pengguna

- Satu perangkat, satu peramban: "peran" adalah pemilih persona di bilah atas, bukan autentikasi.
- Log audit dan keputusan ada di `localStorage`, bisa disunting diam-diam lewat DevTools. Tidak ada jejak yang membuktikan bahwa riwayat tidak diubah.
- Tidak ada undangan, tidak ada sinkronisasi antar pengguna.
- Tidak ada test, tidak ada CI, tidak ada `.env.example`.

### 1.3 Aksesibilitas, tampilan, i18n

- Teks banyak berukuran `text-xs` (12px) dan sebagian penanda status hanya warna.
- Dua modal di `ExperimentDashboard` belum memakai `useDialogA11y`.
- Seluruh string UI ditulis langsung dalam bahasa Indonesia di JSX.
- Belum ada manifest atau service worker.

## 2. Keputusan stack dan alasan

| Topik | Keputusan | Alasan |
| --- | --- | --- |
| Framework | Tetap Vite SPA, tidak pindah ke Next.js | Tidak ada kebutuhan SSR yang nyata. Tautan undangan dan halaman keputusan memakai hash route dan baru bermakna setelah login (RLS membatasi data). Halaman publik berbagi yang butuh SEO belum ada di cakupan. Next.js menambah runtime server dan menyulitkan mode demo tanpa akun. Bila nanti ada halaman publik read-only per keputusan, bisa ditambah fungsi edge terpisah tanpa migrasi seluruh aplikasi. |
| Struktur paket | `src/core` (bukan workspace `packages/core`) | Satu aplikasi, satu `package.json`. Modul core tidak mengimpor React, DOM, atau Supabase (ditegakkan oleh aturan ESLint `no-restricted-imports`), sehingga mudah dipindah ke paket sendiri nanti. |
| Test | Vitest + fast-check, `@playwright/test` untuk E2E | Vitest berbagi konfigurasi dengan Vite. Chromium sudah terpasang di lingkungan. |
| Test RLS | PGlite (Postgres WASM, in-process) menjalankan migrasi SQL yang sama, lalu menguji kebijakan dengan `SET ROLE` | Tanpa Docker, tanpa layanan berbayar, tanpa kredensial. Fungsi `auth.uid()` dan peran `authenticated` disimulasikan di setup test. Batas: ini bukan Supabase sungguhan (tanpa GoTrue, Realtime, PostgREST). |
| Backend | Supabase (Postgres, Auth, Realtime, RLS) lewat lapisan repositori | Sesuai arahan. Mode demo tetap default dan penuh tanpa akun. Mode Supabase aktif hanya bila `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` terisi. |
| Visualisasi | Recharts | Sudah dikenal, mendukung React 19, cukup untuk interval ketidakpastian. Setiap grafik disertai tabel data setara untuk pembaca layar. |
| PDF | jsPDF dimuat dinamis (lazy) | Berjalan sepenuhnya di klien, tanpa layanan eksternal. |
| i18n | Kamus bertipe buatan sendiri (id default, en) | Tanpa dependensi besar. Cakupan awal: navigasi, fitur baru, dan layar hasil. String lama yang belum dipindah tetap berbahasa Indonesia dan dicatat sebagai batas. |
| PWA | Manifest + service worker tulis tangan | Kendali penuh atas strategi cache dan tanpa plugin yang mungkin belum kompatibel dengan Vite 8. |

## 3. Model data dan peran

### 3.1 Peran

Peran pada tingkat **ruang** (`memberships.role`):

| Peran | Hak |
| --- | --- |
| `creator` (pembuat) | Membuat dan mengubah ruang, isu, desain percobaan (selama belum disepakati), membuat undangan, menghentikan percobaan, mencatat keputusan. |
| `participant` (peserta) | Menulis dugaan dan komentar, memberi suara pada desain, mencatat data uji coba, menghentikan percobaan (hak "Hentikan Sekarang"), mengisi survei penerimaan. |
| `observer` (pengamat) | Hanya membaca. Tidak bisa menulis apa pun. |

Peran persona di demo (pengurus, fasilitator, pemantau, dll.) tetap ada sebagai label peran lapangan. Pemetaan ke peran akses: pengurus dan pengelola kawasan menjadi `creator`; anggota, pengusul, dan fasilitator menjadi `participant`; pemantau independen menjadi `observer` (hanya baca). Verifikasi data dilakukan peserta atau pembuat yang bukan pencatatnya (fungsi `verify_entry`), sehingga pengamat benar-benar tidak punya hak tulis.

### 3.2 Tabel utama (Supabase)

`profiles`, `spaces`, `memberships (space_id, user_id, role)`, `invites (token_hash, space_id, role, expires_at, max_uses, used_count)`, `issues`, `claims`, `comments`, `experiments (design jsonb, status)`, `approvals`, `data_entries`, `acceptance_responses`, `ledger_entries` (rantai hash, hanya tambah).

Aturan integritas yang ditegakkan di database:
- `ledger_entries` tidak bisa di-UPDATE atau DELETE (trigger), dan hash dihitung server dari hash sebelumnya, sehingga penyuntingan diam-diam terdeteksi saat verifikasi rantai.
- Desain percobaan terkunci begitu status `disepakati`/`berjalan`.
- Pengamat tidak bisa INSERT/UPDATE/DELETE di tabel mana pun.
- Pengguna hanya melihat ruang tempat ia menjadi anggota.

### 3.3 Model domain di `src/core`

- `DecisionRule` terstruktur: daftar kriteria (metrik, pembanding, ambang absolut atau perubahan relatif, jumlah sampel minimum) dengan mode `all` / `any` / `k_of_n`.
- `StopRule` terstruktur: pemicu otomatis (metrik, batas, jumlah pengamatan beruntun) atau manual. Sifatnya *latching*: sekali terpicu tetap terpicu.
- Hasil evaluasi selalu berbentuk `terpenuhi | tidak_terpenuhi | belum_dapat_disimpulkan`, bersama ukuran sampel, interval, dan daftar batasan metode.

## 4. Batas metode statistik (akan dijelaskan di README dan UI)

1. Satuan analisis adalah rata-rata harian. Pengamatan dalam satu hari saling terkait, jadi mereka tidak diperlakukan sebagai sampel independen.
2. Interval kepercayaan rata-rata memakai distribusi t. Asumsi: rata-rata harian kira-kira berdistribusi normal dan independen antar hari. Data berseri (tren, hari kerja vs akhir pekan) melanggar asumsi itu.
3. Garis dasar adalah satu angka tanpa ukuran sampel, jadi diperlakukan sebagai konstanta. Ketidakpastian garis dasar tidak masuk interval, sehingga interval perubahan relatif cenderung terlalu sempit.
4. Tidak ada kelompok kontrol paralel. Perubahan sebelum-sesudah tidak bisa dipisahkan dari faktor lain (cuaca, musim, hari libur).
5. Metrik proporsi (ya/tidak) memakai interval Wilson. Metrik skala survei diperlakukan sebagai interval numerik, yang kasar untuk skala ordinal 1 sampai 5.
6. Banyak metrik diuji sekaligus tanpa koreksi perbandingan ganda.
7. Tidak ada klaim "signifikan" atau "pasti". Verdict "belum dapat disimpulkan" dipakai bila data kurang atau interval melintasi ambang.

## 5. Urutan kerja (satu commit per perubahan logis)

1. Dokumen rencana ini.
2. Perkakas: Vitest, fast-check, ESLint, skrip `lint` / `typecheck` / `test`.
3. `src/core`: statistik, desain, aturan berhenti, hasil, kuorum, penerimaan, ledger hash, undangan. Masing-masing dengan test unit dan property-based.
4. Integrasi core ke UI, hapus semua angka karangan (analitik, keputusan, landing), tandai data demo sebagai fiktif.
5. Riwayat keputusan dan audit berantai hash, dengan tombol verifikasi.
6. Migrasi Supabase, `.env.example`, test RLS (PGlite), lapisan repositori (lokal + Supabase).
7. Data uji coba real-time (sinkron antar tab di mode demo, Realtime di mode Supabase), tautan undangan.
8. Visualisasi Recharts dengan interval dan ukuran sampel, ekspor PDF.
9. i18n id/en, aksesibilitas, tampilan 360px, PWA.
10. E2E Playwright, `ci.yml`, `vercel.json`, README lengkap, PR draft.

## 6. Yang tidak akan dilakukan

- Memakai atau meminta kredensial asli. Mode Supabase tidak diuji terhadap proyek sungguhan; hanya skema (PGlite) dan adapter (klien tiruan).
- Menambah layanan berbayar.
- Menghapus fitur yang ada.
