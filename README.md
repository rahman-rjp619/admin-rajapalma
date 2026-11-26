# RJP HR Console
Static site (tanpa build). Upload seluruh isi folder ke GitHub Pages / Netlify / hosting statis.
- `js/config.js` → URL backend Apps Script (GAS_URL)
- `js/core.js` → API, sesi, router, komponen UI, grafik SVG
- `js/modules.js` → modul: Beranda, Absensi, Karyawan, Lembur, Rekapan, Persetujuan, Akun
- `js/nav.js` → susunan menu: Beranda, Karyawan, Absensi & Gaji, Akun & Akses (submenu berupa tab, hash `#induk/sub`)
- `js/modules2.js` → Tambah/edit karyawan, Kalender libur, Tarif, Penugasan, Hak akses, Statistik
- `css/style.css` → tema terminal (gelap/terang)
Pastikan Web App Apps Script di-deploy dengan akses "Anyone".

Palet warna: matrix, dracula, amber, nord (tombol ◧ di header; tema gelap/terang lewat ◐). Variabel warna ada di `css/style.css` (bagian bawah).
