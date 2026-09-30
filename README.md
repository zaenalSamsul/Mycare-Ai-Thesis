# MyCareAI — Prototipe Curhat dengan Deteksi Emosi

MyCareAI adalah prototipe dukungan emosional berbahasa Indonesia. Aplikasi menggabungkan klasifikasi emosi dari teks, Facial Emotion Recognition (FER) opsional saat sesi Curhat, pengelola konteks emosi untuk memilih persona respons, dan Gemini API untuk menghasilkan balasan. Sistem ini bukan alat diagnosis atau pengganti tenaga profesional.

> **Catatan versi:** Dokumentasi ini mengikuti kode di repositori. Backend saat ini memakai **Gemini API** (`GEMINI_API_KEY`), bukan Groq. `README_MERGED.md` berisi catatan versi terdahulu dan bukan panduan konfigurasi aktif.

## Fitur

- Chat Curhat dengan respons dukungan dalam Bahasa Indonesia.
- Klasifikasi emosi teks melalui model empat kelas: sadness, happy, anger, dan fear.
- FER opsional berbasis kamera pada sesi Curhat; hasilnya hanya konteks pendukung persona, bukan diagnosis.
- Emotion-Aware Context Manager yang menggabungkan emosi teks, hasil FER, dan sinyal risiko untuk memilih persona adaptif.
- Endpoint pratinjau persona untuk demonstrasi tanpa memanggil LLM.
- Frontend responsif dengan halaman beranda, Curhat, artikel, catatan emosi, login, dan registrasi.

## Arsitektur

```text
Browser
  └─ Frontend Vite (Nginx pada Docker)
       └─ /api → Backend Express
                   ├─ Gemini API (chat)
                   ├─ Python text classification service
                   └─ Python FER service
```

Endpoint API utama:

| Method | Endpoint | Kegunaan |
|---|---|---|
| `GET` | `/api/health` | Status backend dan konfigurasi service |
| `POST` | `/api/chat` | Menghasilkan balasan dan metadata persona |
| `POST` | `/api/classify` | Proxy klasifikasi emosi teks |
| `POST` | `/api/fer/analyze` | Proxy analisis frame wajah |
| `POST` | `/api/persona/preview` | Melihat hasil pemilihan persona tanpa LLM |

Detail alur dan aturan persona tersedia di [docs/ADAPTIVE_PERSONA_FLOW.md](docs/ADAPTIVE_PERSONA_FLOW.md), [docs/CONTEXT_AWARE_MANAGER_RULES.md](docs/CONTEXT_AWARE_MANAGER_RULES.md), serta [docs/SKRIPSI_IMPLEMENTATION_NOTES.md](docs/SKRIPSI_IMPLEMENTATION_NOTES.md). Contoh pemeriksaan endpoint ada di [docs/TESTING_ENDPOINTS.md](docs/TESTING_ENDPOINTS.md).

## Menjalankan dengan Docker Compose

Prasyarat: Docker Desktop atau Docker Engine dengan Compose. Dari direktori root proyek:

```powershell
Copy-Item .env.example .env
```

Isi `GEMINI_API_KEY` di `.env`, lalu jalankan:

```powershell
docker compose up --build
```

Buka <http://localhost:5173>. Compose mengekspos frontend pada port `5173`; backend dan dua layanan Python berkomunikasi pada jaringan internal Compose. Untuk berjalan di latar belakang gunakan `docker compose up --build -d`; lihat status dengan `docker compose ps`, dan hentikan layanan dengan `docker compose down`.

Konfigurasi Gemini yang tersedia di `.env.example` mencakup `GEMINI_MODEL`, `GEMINI_TEMPERATURE`, dan `GEMINI_MAX_OUTPUT_TOKENS`. Nilai default model pada backend adalah `gemini-3.1-flash-lite`. Jangan commit file `.env` atau membagikan API key.

## Menjalankan secara manual

Prasyarat: Node.js, npm, Python, dan API key Gemini. Jalankan setiap layanan di terminal terpisah.

### 1. Layanan klasifikasi teks

```powershell
cd BACK-END-ML/classification_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Layanan berjalan pada port `8080` (lihat konfigurasi di `app.py`).

### 2. Layanan FER

```powershell
cd BACK-END-ML/fer_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Layanan berjalan pada port `5001`. Dependensi FER dan model TFLite/landmark tercantum di direktori tersebut.

### 3. Backend API

Di terminal baru:

```powershell
cd BACK-END-ML
npm install
Copy-Item .env.example .env
```

Isi `GEMINI_API_KEY` pada `BACK-END-ML/.env`. Pastikan URL layanan sesuai alamat yang aktif; default lokalnya `http://localhost:8080` untuk klasifikasi dan `http://localhost:5001` untuk FER. Kemudian:

```powershell
npm start
```

Backend berjalan pada `http://localhost:3000`.

### 4. Frontend

Di terminal baru:

```powershell
cd FRONT-END
npm install
npm run start-dev
```

Secara default frontend menggunakan backend lokal di port `3000`. Untuk alamat lain, atur `VITE_MYCARE_CHAT_API_BASE_URL` di `FRONT-END/.env` (contoh: `http://localhost:3000`). Vite menampilkan alamat frontend setelah server dimulai.

## Konfigurasi dan catatan implementasi

- Variabel root `.env.example` dipakai Docker Compose. `BACK-END-ML/.env.example` dipakai saat menjalankan backend secara manual.
- Backend memakai `GEMINI_API_KEY` (dapat pula membaca `GOOGLE_API_KEY`), bukan `GROQ_API_KEY`.
- URL klasifikasi dan FER dapat diubah melalui `CLASSIFICATION_SERVICE_URL` dan `FER_SERVICE_URL`.
- FER menerima frame gambar melalui backend; kamera hanya digunakan jika pengguna mengaktifkannya.
- Untuk detail payload dan langkah validasi endpoint lihat [docs/TESTING_ENDPOINTS.md](docs/TESTING_ENDPOINTS.md).

## Struktur proyek

```text
.
├── FRONT-END/                 # Aplikasi Vite, halaman dan aset
├── BACK-END-ML/
│   ├── server.js               # API Express, proxy service dan integrasi Gemini
│   ├── emotionAwareContextManager.js
│   ├── classification_service/ # Klasifikasi emosi teks (Flask/TensorFlow)
│   └── fer_service/            # FER (Flask/TFLite/MediaPipe)
├── docs/                       # Catatan implementasi dan endpoint
├── docker-compose.yml
└── .env.example
```

## Batasan penggunaan

MyCareAI merupakan prototipe akademik. Klasifikasi teks dan FER dapat keliru; hasil FER tidak memastikan emosi atau kondisi mental seseorang. Aplikasi tidak menyediakan diagnosis, terapi, atau layanan darurat. Jika ada bahaya langsung, hubungi orang tepercaya dan layanan darurat setempat.

## Tim

Dikembangkan oleh Tim CF025 - CC011 sebagai bagian dari program CODING CAMP POWERED BY DBS FOUNDATION 2025.
