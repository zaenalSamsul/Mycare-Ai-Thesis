# Catatan Implementasi untuk Skripsi

Project ini disusun agar sesuai dengan fokus skripsi: integrasi FER VGG16 dan persona adaptif pada chatbot MyCareAI.

## Kesesuaian dengan Rumusan Masalah

### RM1
Mengembangkan dan mengevaluasi model FER berbasis CNN/VGG16.

Implementasi project:

```txt
BACK-END-ML/fer_service/
```

Isi:

- Model TFLite FER 5 kelas.
- `labels.txt` berisi label emosi.
- `app.py` sebagai REST API prediksi FER.
- `prototype_webcam.py` sebagai prototype awal berbasis webcam lokal.

### RM2
Mengintegrasikan hasil FER ke mekanisme persona adaptif chatbot MyCareAI.

Implementasi project:

```txt
BACK-END-ML/emotionAwareContextManager.js
BACK-END-ML/server.js
FRONT-END/src/scripts/pages/chatbot/chat-page.js
```

Alurnya:

```txt
User mengirim pesan curhat
  ↓
Klasifikasi emosi teks
  ↓
Analisis FER jika kamera aktif
  ↓
Text emotion + face emotion dikirim ke backend
  ↓
Emotion-Aware Context Manager menentukan adaptive persona
  ↓
Groq menghasilkan respons sesuai persona
```

## Mengapa Groq Dipakai

Groq dipakai sebagai LLM uji coba agar token/biaya tidak cepat habis selama pengembangan prototype. Dalam penulisan skripsi, Groq cukup disebut sebagai layanan LLM generatif pada tahap implementasi, sedangkan kontribusi utama penelitian tetap berada pada:

1. Model FER VGG16.
2. Integrasi multimodal teks + wajah.
3. Emotion-Aware Context Manager.
4. Persona adaptif.

## Penjelasan Akademik Singkat

Mekanisme persona adaptif pada sistem MyCareAI bekerja dengan memanfaatkan dua sumber sinyal emosi, yaitu hasil klasifikasi emosi teks dan hasil deteksi ekspresi wajah. Sinyal teks digunakan sebagai sumber utama karena berasal langsung dari narasi pengguna, sedangkan sinyal FER digunakan sebagai konteks pendukung untuk menangkap ekspresi non-verbal. Kedua sinyal tersebut kemudian diproses oleh Emotion-Aware Context Manager untuk menentukan persona respons yang sesuai, seperti deep empathic persona, calming persona, reassuring persona, reflective conflict persona, atau crisis safety persona. Dengan demikian, respons chatbot tidak bersifat statis, melainkan dapat menyesuaikan gaya komunikasi berdasarkan kondisi emosional multimodal pengguna.

## Catatan Perbedaan dengan Dokumen Skripsi

Dokumen skripsi menyebut penggunaan WebRTC dan WebSocket. Pada project prototype ini:

- WebRTC dipakai untuk akses kamera dari browser.
- Komunikasi FER saat ini memakai REST API `/api/fer/analyze` saat user mengirim pesan atau menekan tombol analisis.
- Jika ingin dibuat lebih sesuai 100% dengan narasi WebSocket, tahap berikutnya dapat menambahkan socket untuk streaming frame secara periodik.

Namun untuk kebutuhan prototype skripsi, alur REST saat pengiriman pesan sudah cukup menunjukkan integrasi FER ke sistem curhat dan persona adaptif.
