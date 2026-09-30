# MyCareAI Frontend

Frontend berbasis Vite dan JavaScript. Panduan instalasi lengkap serta cara menjalankan backend dan layanan ML ada di [README utama](../README.md).

```powershell
npm install
npm run start-dev
```

Frontend menggunakan backend lokal `http://localhost:3000` secara default. Untuk menggantinya, buat `.env` di direktori ini dan atur `VITE_MYCARE_CHAT_API_BASE_URL`, lalu mulai ulang Vite. Build produksi: `npm run build`.
