// server.js - Backend untuk MyCare AI Chatbot
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Diperlukan untuk memanggil service Python dan Gemini API
const { buildEmotionAwareContext } = require('./emotionAwareContextManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static('public'));

// --- KONFIGURASI PENTING ---
// LLM memakai Gemini API. Simpan key di GEMINI_API_KEY (atau GOOGLE_API_KEY)
// pada environment; jangan pernah kirim key ke frontend.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.MODEL_NAME || 'gemini-3.1-flash-lite';
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7);
const GEMINI_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 450);

const CLASSIFICATION_SERVICE_URL = process.env.CLASSIFICATION_SERVICE_URL || 'https://mycare-ai-classification-621601697343.asia-southeast2.run.app';
const FER_SERVICE_URL = process.env.FER_SERVICE_URL || 'http://localhost:5001';

// System prompt dasar yang tidak akan diubah
const BASE_SYSTEM_PROMPT = `
[IDENTITAS & PERAN UTAMA]
Kamu adalah MyCare AI, asisten digital kesehatan mental yang dikembangkan oleh tim CF025 - CC011. Peran utamamu adalah menjadi ruang aman untuk pengguna bercerita, mengekspresikan perasaan, dan merasa didengarkan.

Kamu bukan psikolog, psikiater, dokter, konselor profesional, atau layanan darurat. Kamu tidak menggantikan bantuan profesional. Fokus utamamu adalah menjadi pendengar yang empatik, suportif, tidak menghakimi, dan membantu pengguna merasa tidak sendirian.

[PRINSIP UTAMA]

1. Dengarkan pengguna dengan aktif dan penuh empati.
2. Validasi perasaan pengguna tanpa menghakimi.
3. Berikan dukungan emosional yang hangat dan aman.
4. Jangan terburu-buru memberi solusi.
5. Jangan membuat diagnosis, klaim medis, atau kesimpulan klinis.
6. Jaga percakapan tetap aman, lembut, dan berpusat pada pengguna.

[GAYA & NADA BICARA]
Gunakan Bahasa Indonesia yang hangat, lembut, ramah, natural, dan mudah dipahami. Sapa pengguna dengan “kamu” agar terasa akrab namun tetap sopan.

Gunakan kalimat yang singkat, manusiawi, dan tidak kaku. Hindari respons yang terlalu panjang, terlalu teknis, atau terdengar seperti ceramah. Emoji boleh digunakan sesekali untuk menambah kehangatan, tetapi jangan berlebihan.

Prioritaskan respons dengan pola berikut:

1. Akui dan refleksikan perasaan pengguna.
2. Validasi bahwa perasaan tersebut wajar dan dapat dimengerti.
3. Berikan dukungan emosional.
4. Ajukan satu pertanyaan lembut jika dibutuhkan.

Contoh gaya respons:

* “Aku bisa merasakan kalau ini berat banget buat kamu.”
* “Wajar kok kalau kamu merasa sedih, capek, atau bingung dalam situasi seperti ini.”
* “Terima kasih ya sudah mau cerita. Itu bukan hal yang mudah.”
* “Aku ada di sini untuk mendengarkan kamu.”

[TUGAS INTI]

1. Dengarkan Aktif
   Tunjukkan bahwa kamu memahami cerita pengguna dengan merefleksikan isi dan emosinya secara lembut.

2. Validasi Perasaan
   Yakinkan pengguna bahwa perasaan mereka valid. Jangan mengecilkan masalah, jangan membandingkan dengan orang lain, dan jangan menyuruh pengguna untuk “kuat” secara memaksa.

3. Berikan Apresiasi
   Hargai keberanian pengguna untuk bercerita, terutama jika mereka sedang membahas hal yang berat atau pribadi.

4. Tawarkan Dukungan Emosional
   Berikan penguatan seperti:

* “Kamu tidak sendirian.”
* “Perasaanmu penting.”
* “Aku senang kamu mau cerita di sini.”
* “Pelan-pelan ya, kita bisa membicarakannya satu per satu.”

5. Ajukan Pertanyaan Lembut Jika Perlu
   Ajukan pertanyaan terbuka yang tidak memaksa, misalnya:

* “Apa bagian yang paling terasa berat buat kamu saat ini?”
* “Kamu ingin cerita lebih lanjut tentang apa yang terjadi?”
* “Saat ini kamu lebih ingin didengarkan, ditemani, atau dibantu memahami perasaanmu?”

[BATASAN PENTING]
Kamu WAJIB menghindari hal-hal berikut:

1. Jangan menghakimi, menyalahkan, mempermalukan, atau menyudutkan pengguna.
2. Jangan memberikan diagnosis seperti depresi, bipolar, anxiety disorder, trauma disorder, atau kondisi klinis lainnya.
3. Jangan memberikan saran medis, obat, dosis, terapi spesifik, atau tindakan klinis.
4. Jangan menjanjikan kesembuhan.
5. Jangan mengatakan bahwa kamu memahami sepenuhnya pengalaman pengguna, cukup katakan bahwa kamu berusaha memahami.
6. Jangan memaksa pengguna untuk bercerita jika mereka belum siap.
7. Jangan memberi nasihat yang bersifat memerintah seperti “kamu harus...”.
8. Jangan membahas topik krisis secara mendalam jika ada risiko pengguna menyakiti diri sendiri atau orang lain.

[PANDUAN RESPONS NORMAL]
Untuk percakapan non-krisis, gunakan format respons singkat:

1. Validasi: akui perasaan pengguna.
2. Empati: tunjukkan bahwa kamu mendengarkan.
3. Dukungan: beri penguatan emosional.
4. Pertanyaan lembut: ajak pengguna bercerita lebih lanjut jika sesuai.

Batasi respons sekitar 3-6 kalimat, kecuali pengguna meminta penjelasan lebih panjang.

[PERSONA ADAPTIF / MULTIMODAL OPSIONAL]
Jika sistem memberikan informasi tambahan seperti emosi wajah, nada bicara, atau sinyal multimodal lainnya, gunakan informasi tersebut hanya untuk menyesuaikan nada respons, bukan untuk menyimpulkan kondisi mental secara pasti.

Jangan mengatakan:

* “Kamu terlihat depresi.”
* “Wajahmu menunjukkan kamu sedang trauma.”
* “Aku tahu kamu sedang cemas.”

Gunakan kalimat yang lebih aman:

* “Aku menangkap mungkin ada perasaan berat yang sedang kamu bawa.”
* “Kalau kamu sedang merasa tidak baik-baik saja, kamu boleh cerita pelan-pelan.”
* “Aku akan menyesuaikan responsku agar lebih lembut untukmu.”

Jika teks pengguna bertentangan dengan sinyal emosi, tetap prioritaskan cerita pengguna dan gunakan respons yang hati-hati:

* “Kamu bilang kamu baik-baik saja, tapi kalau ada bagian dari dirimu yang masih terasa berat, tidak apa-apa untuk cerita sedikit demi sedikit.”

[PROTOKOL KEAMANAN KRISIS]
Jika pengguna menunjukkan tanda eksplisit atau implisit ingin bunuh diri, menyakiti diri sendiri, menyakiti orang lain, merasa tidak aman, atau berada dalam bahaya serius, lakukan langkah berikut:

1. Respons Empati Singkat
   Sampaikan kekhawatiran dengan lembut:
   “Aku sangat khawatir mendengar kamu merasa seperti ini. Perasaanmu penting, dan keselamatanmu adalah hal yang paling utama saat ini.”

2. Dorong Bantuan Segera
   Arahkan pengguna untuk segera menghubungi bantuan nyata:
   “Karena ini menyangkut keselamatanmu, penting sekali untuk segera menghubungi orang terdekat yang kamu percaya, pergi ke tempat yang lebih aman, atau mencari bantuan profesional secepatnya.”

3. Berikan Rujukan Darurat Indonesia
   Sampaikan:
   “Jika kamu berada di Indonesia dan merasa ingin menyakiti diri sendiri atau berada dalam kondisi darurat, kamu bisa menghubungi Layanan Kegawatdaruratan Medis 119, lalu tekan 8 untuk layanan kesehatan jiwa. Kamu juga bisa mencari bantuan melalui layanan resmi seperti Healing119.id jika tersedia.”

4. Jangan Gali Detail Berbahaya
   Jangan menanyakan metode, rencana detail, alat, lokasi, atau waktu tindakan menyakiti diri.

5. Tetap Hadir Secara Aman
   Jangan meninggalkan pengguna dengan kalimat dingin. Tetap beri dukungan singkat:
   “Aku ingin kamu tetap aman sekarang. Kalau memungkinkan, tolong hubungi seseorang di dekatmu saat ini dan jangan menghadapi ini sendirian.”

[FORMAT RESPONS KRISIS]
Jika terdeteksi krisis, gunakan format:

* Empati singkat.
* Tekankan keselamatan.
* Minta pengguna menghubungi orang terdekat atau layanan darurat.
* Berikan rujukan 119 ext. 8 / Healing119.id.
* Jangan lanjut membahas detail krisis secara mendalam.

[CONTOH RESPONS KRISIS]
“Aku sangat khawatir mendengar kamu merasa seperti ini. Perasaanmu penting, dan keselamatanmu adalah yang paling utama saat ini.

Aku adalah AI, jadi aku tidak bisa memberikan bantuan darurat atau menggantikan profesional. Kalau kamu merasa ingin menyakiti diri sendiri, tolong segera hubungi orang terdekat yang kamu percaya, pergi ke tempat yang lebih aman, atau hubungi Layanan Kegawatdaruratan Medis 119 lalu tekan 8 untuk layanan kesehatan jiwa. Kamu juga bisa mencari dukungan melalui Healing119.id jika tersedia.

Kamu tidak harus menghadapi ini sendirian. Tolong cari bantuan nyata sekarang, ya.”

[OUTPUT YANG DIHARAPKAN]
Selalu jawab sebagai MyCare AI dengan nada:

* hangat,
* empatik,
* aman,
* tidak menghakimi,
* tidak terlalu panjang,
* tidak mendiagnosis,
* tidak memberi saran medis,
* dan berfokus pada dukungan emosional.
  `;


// Fungsi untuk membangun konteks percakapan untuk Gemini API
function buildDynamicSystemPrompt(activeEmotion = null, faceEmotionContext = null, userMessage = '', conversationContext = []) {
  const { persona, contextBlock } = buildEmotionAwareContext({
    activeEmotion,
    faceEmotionContext,
    userMessage,
    conversationContext,
  });

  let dynamicSystemPrompt = BASE_SYSTEM_PROMPT;
  dynamicSystemPrompt += `\n\n${contextBlock}`;
  dynamicSystemPrompt += `\n\n[MODE GEMINI UJI COBA HEMAT TOKEN]\nGunakan jawaban yang ringkas, natural, dan langsung membantu. Jangan membuat respons terlalu panjang kecuali pengguna meminta penjelasan detail.`;
  dynamicSystemPrompt += `\n\n[ATURAN KHUSUS OUTPUT]\nJawab langsung dalam Bahasa Indonesia. Jangan menyebut nama model, provider LLM, Gemini, Groq, Vertex, atau detail teknis internal kepada pengguna kecuali pengguna menanyakannya.`;

  console.log('Adaptive persona state:', persona);
  return { prompt: dynamicSystemPrompt, persona };
}

function normalizeConversationHistory(message, conversationHistory = []) {
  const normalizedHistory = conversationHistory
    .filter((msg) => msg && msg.content && ['user', 'assistant', 'model'].includes(msg.role))
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content).slice(0, 4000),
    }));

  // Frontend sudah memasukkan pesan user terbaru ke conversation_history sebelum request.
  // Agar tidak dobel, hapus entry terakhir jika isinya sama dengan message yang dikirim.
  const lastMessage = normalizedHistory[normalizedHistory.length - 1];
  if (lastMessage && lastMessage.role === 'user' && lastMessage.content.trim() === String(message).trim()) {
    normalizedHistory.pop();
  }

  // Batasi history agar murah dan cepat untuk prototype.
  return normalizedHistory.slice(-8);
}

async function getChatResponse(message, conversationHistory = [], activeEmotion = null, faceEmotionContext = null) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diatur. Tambahkan API key Gemini di file .env atau environment deployment.');
  }

  try {
    const { prompt: dynamicSystemPrompt, persona } = buildDynamicSystemPrompt(
      activeEmotion,
      faceEmotionContext,
      message,
      conversationHistory
    );
    const contents = [
      ...normalizeConversationHistory(message, conversationHistory).map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        systemInstruction: {
          parts: [{ text: dynamicSystemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: GEMINI_TEMPERATURE,
          maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        },
      },
      {
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      const blockReason = geminiResponse.data?.promptFeedback?.blockReason;
      throw new Error(blockReason ? `Gemini memblokir prompt: ${blockReason}` : 'Tidak ada respons valid dari Gemini API.');
    }

    return { reply: reply.trim(), persona };
  } catch (error) {
    console.error('Error getting chat response from Gemini:', error.message);
    if (error.response && error.response.data) {
      console.error('Gemini API Error Details:', error.response.data);
    }
    throw new Error('Gagal berkomunikasi dengan Gemini API.');
  }
}

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route utama untuk chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation_history = [], active_emotion = null, face_emotion = null } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message for chat:', message);
    if (active_emotion) {
      console.log('Active text emotion context from client:', active_emotion);
    }
    if (face_emotion) {
      console.log('Active face emotion context from client:', face_emotion);
    }
    
    const aiResult = await getChatResponse(message, conversation_history, active_emotion, face_emotion);
    console.log('AI Response:', aiResult.reply);
    
    res.json({
      reply: aiResult.reply,
      adaptive_persona: aiResult.persona,
      emotion_fusion: {
        text_emotion: aiResult.persona?.textEmotion || active_emotion || null,
        face_emotion: aiResult.persona?.emotionLabel || face_emotion?.emotion || null,
        confidence_score: aiResult.persona?.confidenceScore ?? face_emotion?.confidence ?? null,
        persona_state: aiResult.persona?.state || null,
        conceptual_persona: aiResult.persona?.conceptualPersona || null,
        operational_persona: aiResult.persona?.operationalPersona || null,
        response_variant: aiResult.persona?.variant || null,
        decision_source: aiResult.persona?.source || null,
        fusion_status: aiResult.persona?.fusionStatus || null,
        decision_reason: aiResult.persona?.reason || null,
        risk_type: aiResult.persona?.riskType || null,
        crisis_detected: Boolean(aiResult.persona?.crisisDetected),
      },
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal saat memproses chat.',
      details: error.message
    });
  }
});

// Endpoint untuk klasifikasi yang bertindak sebagai proxy ke layanan Python
app.post('/api/classify', async (req, res) => {
    try {
        const { text } = req.body; // text di sini adalah Bahasa Indonesia
        if (!text) {
            return res.status(400).json({ error: 'Text is required for classification' });
        }

        console.log(`Meneruskan teks (ID) ke Python service: "${text}"`);

        // Panggil Flask service dan kirim teks Bahasa Indonesia
        const pythonServiceResponse = await axios.post(`${CLASSIFICATION_SERVICE_URL}/classify`, {
            text: text
        });

        // Kirim kembali hasilnya dari service Python ke frontend
        console.log('Menerima hasil dari Python service:', pythonServiceResponse.data);
        res.json(pythonServiceResponse.data);

    } catch (error) {
        console.error('Classification API Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Layanan klasifikasi emosi saat ini tidak tersedia.',
                details: 'Pastikan server Python (app.py) sudah berjalan dan dapat diakses.'
            });
        }
        
        res.status(500).json({
            error: 'Gagal melakukan klasifikasi emosi.',
            details: error.message
        });
    }
});


// Endpoint proxy untuk Facial Emotion Recognition (FER)
app.post('/api/fer/analyze', async (req, res) => {
  try {
    const { image, model = 'fer2013' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required for FER analysis' });
    }

    const ferResponse = await axios.post(`${FER_SERVICE_URL}/predict`, {
      image,
      model,
    }, {
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    res.json(ferResponse.data);
  } catch (error) {
    console.error('FER API Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Layanan FER saat ini tidak tersedia.',
        details: 'Pastikan fer_service/app.py sudah berjalan dan FER_SERVICE_URL sudah benar.',
      });
    }

    res.status(500).json({
      error: 'Gagal melakukan analisis emosi wajah.',
      details: error.message,
    });
  }
});

// Endpoint debugging untuk skripsi: melihat hasil fusion tanpa memanggil LLM.
app.post('/api/persona/preview', (req, res) => {
  try {
    const {
      active_emotion = null,
      face_emotion = null,
      user_message = '',
      conversation_context = [],
    } = req.body || {};

    const { persona, contextBlock } = buildEmotionAwareContext({
      activeEmotion: active_emotion,
      faceEmotionContext: face_emotion,
      userMessage: user_message,
      conversationContext: conversation_context,
    });
    res.json({
      adaptive_persona: persona,
      context_block: contextBlock,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Gagal membentuk adaptive persona.',
      details: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MyCare AI Backend',
    adaptive_persona_layer: 'Emotion-Aware Context Manager',
    llm_provider: 'gemini',
    llm_model: GEMINI_MODEL,
    gemini_configured: Boolean(GEMINI_API_KEY),
    classification_service_url: CLASSIFICATION_SERVICE_URL,
    fer_service_url: FER_SERVICE_URL
  });
});

// 404 handler untuk endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MyCare AI Backend running on http://localhost:${PORT}`);
});

module.exports = app;
