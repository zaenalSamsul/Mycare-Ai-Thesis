## Catatan versi terbaru

Versi ZIP ini sudah direvisi agar FER masuk ke sesi **Curhat** dan LLM diganti dari Vertex AI ke **Groq**. Untuk instruksi paling baru, lihat juga `README_MERGED.md`.

# MyCare AI: Asisten Kesehatan Mental Berbasis AI

<p align="center">
<img src="https://github.com/zaenalSamsul/MyCareAi/blob/main/MyCareAi.png" alt="MyCare AI Logo" width="900">
</p>

<p align="center">
Empati, Wawasan, dan Dukungan Personal dalam Genggaman Anda.
<br />
<a href="URL_WEBSITE_netlifyly_ANDA"><strong>Lihat Live Demo »</strong></a>
<br />
<br />
</p>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React Logo" width="50">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="JavaScript Logo" width="50">
  <img src="https://groq.com/wp-content/uploads/2024/03/PBG-mark1-color.svg" alt="Groq Logo" width="50">
  <img src="https://eranyacloud.com/wp-content/uploads/2024/02/Apa-itu-Docker-adalah.png" alt="Docker Logo" width="50">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Netlify_logo_%282%29.svg" alt="Netlify Logo" width="50">
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Python.svg" alt="Python Logo" width="50">
</p>


## Daftar Isi
- [Latar Belakang](#1-latar-belakang)
- [Alasan & Masalah yang Diselesaikan](#2-alasan--masalah-yang-diselesaikan)
- [Analisis Kompetitor & Inovasi](#3-analisis-kompetitor--inovasi)
- [Fitur Utama](#4-fitur-utama)
- [Arsitektur Sistem & Teknologi](#5-arsitektur-sistem--teknologi)
- [Menjalankan Proyek Secara Lokal](#6-menjalankan-proyek-secara-lokal)
- [Proses Deployment](#7-proses-deployment)
- [Struktur Proyek](#8-struktur-proyek)
- [Tim Pengembang](#9-tim-pengembang)

## 1. Latar Belakang
Kesehatan mental telah menjadi isu krusial di era modern, terutama bagi generasi muda di Indonesia. Stigma sosial, akses yang terbatas ke bantuan profesional, serta kesulitan dalam memahami dan mengartikulasikan emosi menjadi tantangan besar. Di sisi lain, kemajuan teknologi Kecerdasan Buatan (AI) membuka peluang untuk menyediakan dukungan psikologis awal yang terukur, dapat diakses kapan saja, dan bersifat personal.

MyCare AI lahir dari identifikasi kesenjangan ini. Kami melihat kebutuhan akan sebuah "ruang aman" digital yang tidak hanya memberikan informasi, tetapi juga mampu mendengarkan dengan empati, memberikan wawasan, dan menghubungkan pengguna dengan sumber daya yang relevan berdasarkan kondisi emosional mereka.

## 2. Alasan & Masalah yang Diselesaikan
Proyek ini dipilih karena adanya urgensi untuk menciptakan solusi kesehatan mental yang modern dan relevan bagi masyarakat Indonesia.

Masalah utama yang ingin kami selesaikan adalah:

- **Stigma untuk Bercerita**: Dengan menyediakan platform anonim, pengguna dapat dengan bebas mengekspresikan perasaan mereka tanpa takut akan penghakiman.
- **Aksesibilitas Terbatas**: MyCare AI menyediakan dukungan emosional 24/7 yang dapat diakses dari mana saja, mengatasi batasan biaya dan geografis dari layanan konvensional.
- **Kurangnya Kesadaran Emosional**: Aplikasi kami membantu pengguna untuk mengenali, melacak, dan memahami pola emosi mereka, yang merupakan langkah pertama menuju kesejahteraan mental yang lebih baik.

## 3. Analisis Kompetitor & Inovasi

| Solusi yang Ada | Kekurangan yang Teridentifikasi | Inovasi & Keunggulan MyCare AI |
|---|---|---|
| Chatbot Sederhana | Respons kaku, tidak memahami konteks emosional yang dalam. | **Arsitektur Multimodal AI**: Menggunakan LLM Groq untuk percakapan empatik, model klasifikasi teks untuk deteksi emosi, dan FER untuk konteks ekspresi wajah pada sesi curhat. |
| Aplikasi Wellness | Fokus pada konten meditasi/musik, namun interaksi personalnya terbatas. | **Hiper-Personalisasi**: Rekomendasi artikel, musik, dan meditasi didasarkan pada hasil klasifikasi emosi pengguna secara real-time. |
| Platform Telemedicine | Membutuhkan biaya dan perjanjian, tidak tersedia 24/7 untuk "curhat" mendadak. | **Ekosistem Terpadu**: Menghubungkan fitur Chatbot, Pustaka Edukasi, dan Catatan Emosi dalam satu alur pengalaman yang mulus. |

## 4. Fitur Utama
- 💬 **Chatbot AI Empatik**: Sesi percakapan real-time dengan AI yang dilatih untuk memberikan respons suportif dan tidak menghakimi.
- 🔬 **Klasifikasi Emosi Teks**: Deteksi otomatis terhadap emosi inti (sedih, marah, takut, suicidal) dari teks pengguna untuk memberikan respons yang lebih relevan.
- 🙂 **Facial Emotion Recognition pada Curhat**: Kamera opsional pada sesi curhat untuk membaca sinyal ekspresi wajah sebagai konteks persona adaptif, bukan diagnosis.
- 📚 **Pustaka Edukasi**: Kumpulan artikel terpercaya yang dapat difilter berdasarkan kategori emosi.
- 📝 **Catatan Emosi**: Fitur jurnal untuk membantu pengguna melacak suasana hati dan mengidentifikasi pemicu emosional dari waktu ke waktu.
- 🎵 **Rekomendasi Personal**: Saran artikel, musik, dan meditasi yang disesuaikan dengan emosi yang terdeteksi.
- 🔒 **Autentikasi Pengguna**: Sistem login dan registrasi untuk pengalaman yang lebih personal.
- 📱 **Desain Responsif**: Tampilan yang optimal di berbagai perangkat, baik desktop maupun mobile.

## 5. Arsitektur Sistem & Teknologi
MyCare AI dibangun di atas arsitektur microservices yang terpisah (decoupled) untuk skalabilitas dan kemudahan pengelolaan.

**Alur Sistem:**

1. Pengguna mengakses aplikasi Frontend (Vite + JavaScript) yang dapat di-hosting di Netlify Hosting.
2. Frontend membuat panggilan API ke Backend API Gateway (Node.js) yang berjalan di Google Cloud Run.
3. Gateway Node.js menangani permintaan:
   - Untuk chat, ia berkomunikasi dengan Groq Chat Completions API.
   - Untuk klasifikasi teks, ia meneruskan permintaan ke layanan ML Python/Flask.
   - Untuk FER, ia meneruskan frame wajah dari sesi curhat ke layanan FER Python/Flask.
4. Hasilnya dikembalikan melalui alur yang sama ke pengguna.

**Teknologi yang Digunakan:**

- **Frontend**: Vite, Vanilla JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Python, Flask
- **AI & ML**: Groq LLM, TensorFlow, Keras, TFLite, OpenCV
- **Cloud & Deployment**: Google Cloud Run, Netlify hosting

## 6. Menjalankan Proyek Secara Lokal

### Menjalankan semua layanan dengan Docker (direkomendasikan)

Satu perintah Docker Compose akan menjalankan frontend, API Node.js, text-classification, dan FER. Antarservice tidak dibuka ke host; browser hanya mengakses frontend dan Nginx akan meneruskan request `/api` ke backend internal.

Service FER memakai `tflite-runtime` karena modelnya berformat `.tflite`; hanya layanan klasifikasi teks yang membawa TensorFlow penuh untuk model `.h5`.

```powershell
Copy-Item .env.example .env
# Isi GROQ_API_KEY pada file .env
docker compose up --build
```

Buka `http://localhost:5173` setelah status seluruh container `healthy`. Untuk mode background gunakan `docker compose up --build -d`; periksa dengan `docker compose ps`; hentikan dengan `docker compose down`.

### Menjalankan tanpa Docker (opsional)

Untuk mereplikasi dan menjalankan proyek secara manual, ikuti langkah-langkah berikut:

**Prasyarat:**

- Node.js (v18+)
- Python (v3.9+)
- Groq API Key
- Netlify
- Docker Desktop dengan Docker Compose (untuk cara yang direkomendasikan)

### A. Setup Backend (Layanan ML Python)
1. Masuk ke direktori layanan klasifikasi: `cd BACK-END-ML/classification_service`
2. Buat dan aktifkan virtual environment: `python -m venv venv` dan `source venv/bin/activate` (atau `venv\Scripts\activate` di Windows).
3. Install dependensi: `pip install -r requirements.txt`
4. Jalankan server Flask/gunicorn di port `8080` (biarkan terminal ini berjalan).

### B. Setup Backend (API Gateway Node.js)
1. Buka terminal baru dan masuk ke direktori backend: `cd BACK-END-ML`
2. Install dependensi: `npm install`
3. Buat file `.env` di dalam folder `BACK-END-ML` berdasarkan `.env.example`, lalu isi `GROQ_API_KEY`, `CLASSIFICATION_SERVICE_URL=http://localhost:8080`, dan `FER_SERVICE_URL=http://localhost:5001`.
4. Jalankan server Node.js: `npm start` (biarkan terminal ini berjalan).

### C. Setup Frontend
1. Buka terminal ketiga dan masuk ke direktori frontend: `cd FRONT-END`
2. Install dependensi: `npm install`
3. Jika perlu, buat file `.env` frontend dan isi `VITE_MYCARE_CHAT_API_BASE_URL=http://localhost:3000`.
4. Jalankan server development Vite: `npm run start-dev`
5. Buka `http://localhost:5173` (atau port yang ditampilkan) di browser Anda.

## 7. Proses Deployment

### Deploy Layanan ML Text Classification (Python):

```bash
gcloud run deploy mycare-ai-classification --source ./BACK-END-ML/classification_service --platform managed --region asia-southeast2
```
Catat URL yang dihasilkan.

### Deploy API Gateway (Node.js):

1. Atur environment `GROQ_API_KEY`, `CLASSIFICATION_SERVICE_URL`, dan `FER_SERVICE_URL` pada deployment backend.
2. Jalankan deploy:
```bash
gcloud run deploy mycare-ai-server --source ./BACK-END-ML --platform managed --region asia-southeast2
```
Catat URL yang dihasilkan.

### Deploy Frontend:

1. Ubah URL API di kode frontend Anda dengan URL dari langkah 2.
2. Build aplikasi: `npm run build` (di dalam folder FRONT-END).
3. Deploy ke Netlify: `Netlify deploy`.

## 8. Struktur Proyek
```
/
├── FRONT-END/
│   ├── src/
│   │   ├── scripts/
│   │   │   ├── pages/ (home-page.js, chat-page.js, dll.)
│   │   │   └── utils/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── BACK-END-ML/
    ├── classification_service/
    │   ├── app.py
    │   ├── best_model_health_optimized.h5
    │   ├── tokenizer_health_optimized.json
    │   ├── requirements.txt
    │   └── Dockerfile
    ├── server.js
    ├── package.json
    ├── .env
    └── Dockerfile
```

## 9. Tim Pengembang
Aplikasi ini dikembangkan dengan penuh dedikasi oleh Tim CF025 - CC011 sebagai bagian dari program CODING CAMP POWERED BY DBS FOUNDATION 2025.
