# MyCareAI Skripsi Prototype: Curhat + Text Emotion + FER + Adaptive Persona + Groq

Project ini adalah versi gabungan dan revisi dari `MyCareAi.zip` dan `app.zip` yang sudah disesuaikan dengan konteks skripsi:

> Integrasi Facial Emotion Recognition VGG16 dan Persona Adaptif dalam Pengembangan Chatbot MyCareAI untuk Monitoring Kesehatan Mental.

Groq pada versi ini dipakai sebagai **LLM uji coba/prototype** agar token dan biaya tidak cepat habis. Secara akademik, Groq dapat dijelaskan sebagai **layanan LLM generatif** pengganti Vertex AI pada tahap eksperimen sistem, sementara fokus penelitian tetap berada pada integrasi FER, klasifikasi emosi teks, dan persona adaptif.

## Perubahan utama versi final skripsi

1. **FER berada di bagian Curhat**
   - Panel FER muncul setelah user klik **Mulai Curhat Sekarang**.
   - Kamera bersifat opsional dan hanya aktif jika user menekan tombol kamera.
   - Saat user mengirim pesan, frontend mengambil frame kamera jika aktif, mengirimnya ke endpoint FER, lalu meneruskan hasilnya sebagai `face_emotion` ke `/api/chat`.
   - FER dipakai sebagai sinyal pendukung persona adaptif, bukan diagnosis.

2. **Ada Emotion-Aware Context Manager eksplisit**
   - File utama: `BACK-END-ML/emotionAwareContextManager.js`.
   - Fungsinya menggabungkan:
     - `active_emotion` dari klasifikasi teks,
     - `face_emotion` dari FER,
     - `confidence` FER,
     - aturan konflik modalitas,
     - lalu menghasilkan `adaptive_persona`.

3. **Ada fusion rule untuk persona adaptif**

   ```txt
   Text Emotion + Face Emotion + Confidence
           ↓
   Emotion-Aware Context Manager
           ↓
   Fusion Rule
           ↓
   Adaptive Persona State
           ↓
   Dynamic Prompt
           ↓
   Groq LLM Response
   ```

4. **LLM diganti dari Vertex AI ke Groq**
   - Backend `server.js` tidak memakai `@google-cloud/vertexai`.
   - Chat dikirim ke endpoint OpenAI-compatible Groq.
   - Default model untuk uji coba hemat token:
     `llama-3.1-8b-instant`.
   - `GROQ_MAX_COMPLETION_TOKENS` default diturunkan menjadi `450`.
   - Conversation history dibatasi ke 8 pesan terakhir.

5. **Endpoint debugging untuk skripsi**
   - `POST /api/persona/preview`
   - Endpoint ini melihat hasil fusion persona tanpa memanggil LLM, sehingga cocok untuk demonstrasi Bab 4.1.7 System Integration.

## Struktur penting

```txt
MyCareAI_Merged/
├── FRONT-END/
│   └── src/scripts/pages/chatbot/chat-page.js
├── BACK-END-ML/
│   ├── server.js
│   ├── emotionAwareContextManager.js
│   ├── .env.example
│   ├── classification_service/
│   │   ├── app.py
│   │   ├── best_model_health_optimized.h5
│   │   └── tokenizer_health_optimized.json
│   └── fer_service/
│       ├── app.py
│       ├── prototype_webcam.py
│       ├── labels.txt
│       ├── fer2013_vgg16_emotion_5class_96x96_balanced_max6000.tflite
│       └── fer_rafdb_vgg16se_5cls_96x96.tflite
├── docs/
│   ├── ADAPTIVE_PERSONA_FLOW.md
│   ├── SKRIPSI_IMPLEMENTATION_NOTES.md
│   └── TESTING_ENDPOINTS.md
└── docker-compose.yml
```

## Alur Curhat + FER + Adaptive Persona

```txt
User klik Mulai Curhat
        ↓
Frontend menampilkan panel FER opsional
        ↓
User mengaktifkan kamera jika nyaman
        ↓
User mengirim pesan curhat
        ↓
Frontend klasifikasi emosi teks via /api/classify
        ↓
Frontend ambil frame wajah via /api/fer/analyze jika kamera aktif
        ↓
Backend /api/chat menerima message + active_emotion + face_emotion
        ↓
Emotion-Aware Context Manager menentukan adaptive_persona
        ↓
Backend membangun dynamic system prompt
        ↓
Backend memanggil Groq Chat Completions
        ↓
Respons empatik dikirim ke user
```

## Persona state yang tersedia

| Persona State | Kondisi Utama | Fungsi Respons |
|---|---|---|
| `safety_support` | risiko tinggi dari teks atau `active_emotion = suicidal` | protokol krisis dan rujukan bantuan nyata |
| `neutral_supportive` | `emotion_label = neutral` | respons netral, terbuka, dan tidak menyimpulkan berlebihan |
| `positive_reinforcement` | `emotion_label = happy` dengan confidence memadai | penguatan positif yang tetap natural dan tidak memaksa |
| `sadness_support` | `emotion_label = sad` dengan confidence memadai | bahasa lembut, validatif, dan memberi ruang cerita |
| `fear_grounding` | `emotion_label = fear` dengan confidence memadai | respons menenangkan, terstruktur, dan memberi rasa aman |
| `anger_deescalation` | `emotion_label = angry` dengan confidence memadai | de-eskalasi, validasi frustrasi, dan nada tidak defensif |

## Cara menjalankan manual

### 1. Backend Node.js

```bash
cd BACK-END-ML
npm install
cp .env.example .env
```

Isi `.env`:

```env
PORT=3000
GROQ_API_KEY=isi_api_key_groq_kamu
GROQ_MODEL=llama-3.1-8b-instant
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_TEMPERATURE=0.7
GROQ_MAX_COMPLETION_TOKENS=450
CLASSIFICATION_SERVICE_URL=http://localhost:8080
FER_SERVICE_URL=http://localhost:5001
FER_PERSONA_MIN_CONFIDENCE=0.65
```

Jalankan:

```bash
npm start
```

Backend berjalan di:

```txt
http://localhost:3000
```

### 2. Text classification service

```bash
cd BACK-END-ML/classification_service
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:8080 app:app
```

Service berjalan di:

```txt
http://localhost:8080
```

### 3. FER service

```bash
cd BACK-END-ML/fer_service
pip install -r requirements.txt
python app.py
```

Service berjalan di:

```txt
http://localhost:5001
```

### 4. Frontend

```bash
cd FRONT-END
npm install
npm run start-dev
```

Jika backend chat berada di URL lain, buat file `.env` di folder `FRONT-END`:

```env
VITE_MYCARE_CHAT_API_BASE_URL=http://localhost:3000
```

## Cara menjalankan dengan Docker Compose

Docker Compose menjalankan frontend, API backend, text classification, dan FER sekaligus. Semua komunikasi antarservice berada di jaringan Docker internal; hanya frontend yang dibuka ke komputer host.

PowerShell (Windows), dari folder root project:

```powershell
Copy-Item .env.example .env
# Edit .env lalu isi GROQ_API_KEY
docker compose up --build
```

Setelah semua container berstatus sehat, buka:

```txt
http://localhost:5173
```

Backend Node.js, text classification, dan FER tidak mengekspos port ke host. Frontend meneruskan request `/api/*` ke backend melalui Nginx. Gunakan `docker compose up --build -d` untuk mode background, `docker compose ps` untuk melihat status health check, dan `docker compose down` untuk menghentikan semua container.

## Catatan akademik untuk skripsi

Di laporan, Groq sebaiknya dijelaskan sebagai **LLM service untuk tahap uji coba prototype**, bukan kontribusi utama penelitian. Kontribusi utama tetap:

1. Model Facial Emotion Recognition berbasis VGG16.
2. Integrasi FER ke sesi curhat MyCareAI.
3. Emotion-Aware Context Manager.
4. Persona adaptif berdasarkan fusion teks + ekspresi wajah.

## Catatan keamanan mental health

Sinyal FER hanya digunakan sebagai konteks pendukung persona adaptif. Sistem tidak boleh menyimpulkan diagnosis dari ekspresi wajah. System prompt di backend diarahkan agar tetap empatik, aman, tidak menghakimi, tidak menggantikan bantuan profesional, dan memprioritaskan protokol krisis jika ada indikasi self-harm/suicidal.

## Catatan ZIP

Folder `.git`, `node_modules`, `__pycache__`, dan `.env` tidak disertakan dalam hasil gabungan agar lebih aman dan bersih.

## Update: Emotion-Aware Context Manager sesuai rancangan skripsi

Project ini sekarang memakai persona adaptif eksplisit dengan mapping berikut:

| Kondisi | Persona Aktif |
|---|---|
| `emotion_label = neutral` | `neutral_supportive` |
| `emotion_label = happy` | `positive_reinforcement` |
| `emotion_label = sad` | `sadness_support` |
| `emotion_label = fear` | `fear_grounding` |
| `emotion_label = angry` | `anger_deescalation` |
| Risiko tinggi dari teks | `safety_support` |

File utama:

```txt
BACK-END-ML/emotionAwareContextManager.js
```

Endpoint hemat token untuk testing persona tanpa Groq:

```txt
POST /api/persona/preview
```

Dokumentasi detail ada di:

```txt
docs/CONTEXT_AWARE_MANAGER_RULES.md
```
