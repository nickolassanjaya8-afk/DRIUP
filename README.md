# DRIUP — Static demo

Ini adalah situs statis demo untuk DRIUP (Top up untuk Free Fire & Mobile Legends). File yang dibuat:

- index.html — halaman utama
- styles.css — styling
- assets/banner.svg — banner sederhana
- assets/ff-logo.svg — logo FF buatan sederhana (SVG)
- assets/ml-logo.svg — logo ML buatan sederhana (SVG)

Catatan:
- Ini adalah contoh situs statis. Untuk menerima pembayaran nyata, hubungkan ke payment gateway dan backend yang memvalidasi ID pemain, mengeksekusi top up melalui API resmi, dan menyimpan riwayat pesanan.
- Ganti SVG placeholder dengan logo resmi jika Anda memiliki hak untuk memakai logo tersebut.

Cara menjalankan secara lokal:
1. Clone repo
2. Buka index.html di browser atau pakai server sederhana: `npx http-server` atau `python -m http.server`
