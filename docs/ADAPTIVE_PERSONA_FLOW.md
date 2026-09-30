# Adaptive Persona Flow

Dokumen ini menjelaskan mekanisme persona adaptif pada project MyCareAI versi skripsi.

## Input

Adaptive persona menerima empat input utama:

1. `active_emotion` dari klasifikasi emosi teks.
   - Label model: `sadness`, `happy`, `anger`, atau `fear`; hasil di bawah threshold menjadi `neutral`.
   - Risiko bunuh diri/menyakiti diri tidak menjadi kelas model. Risiko diperiksa dari pesan dan konteks percakapan oleh Emotion-Aware Context Manager, lalu diteruskan ke aturan keselamatan LLM.
2. `face_emotion` dari Facial Emotion Recognition.
   - Contoh: `sad`, `angry`, `fear`, `happy`, `neutral`, `uncertain`.
3. `user_message`, yaitu pesan terbaru pengguna.
4. `conversation_context`, yaitu riwayat percakapan singkat.

Format `face_emotion`:

```json
{
  "emotion": "sad",
  "confidence": 0.82,
  "persona_state": "sadness_support"
}
```

## Processing Layer

File utama:

```txt
BACK-END-ML/emotionAwareContextManager.js
```

Fungsi utama:

```js
selectPersona({ emotionLabel, confidenceScore, userMessage, conversationContext, activeEmotion })
determineAdaptivePersona(...)
buildEmotionAwareContext(...)
detectCrisisRisk(...)
```

## Decision Rule

Prioritas keputusan:

1. Jika `user_message`, `conversation_context`, atau `active_emotion` menunjukkan risiko krisis, sistem memakai `safety_support`.
2. Jika wajah terdeteksi, sistem memilih persona berdasarkan `emotion_label` dengan skor tertinggi tanpa ambang confidence atau margin.
3. Jika `emotion_label` termasuk `sad`, `fear`, atau `angry`, sistem meningkatkan sensitivitas respons.
4. Jika `emotion_label = happy`, sistem memakai penguatan positif.
5. Jika `emotion_label = neutral`, sistem memberi respons eksploratif dan suportif.

## Mapping Persona

| Kondisi | Persona Aktif |
|---|---|
| `emotion_label = neutral` | `neutral_supportive` |
| `emotion_label = happy` | `positive_reinforcement` |
| `emotion_label = sad` | `sadness_support` |
| `emotion_label = fear` | `fear_grounding` |
| `emotion_label = angry` | `anger_deescalation` |
| Risiko tinggi dari teks | `safety_support` |

## Output

Output adaptive persona:

```json
{
  "state": "sadness_support",
  "priority": "medium",
  "source": "fer_label",
  "textEmotion": "sadness",
  "emotionLabel": "sad",
  "confidenceScore": 0.82,
  "confidenceLevel": "medium_or_high",
  "crisisDetected": false,
  "sensitivityIncreased": true
}
```

## Alur Integrasi

```txt
Frontend Curhat
  ├─ /api/classify → active_emotion
  ├─ /api/fer/analyze → face_emotion
  └─ /api/chat → message + active_emotion + face_emotion
          ↓
Emotion-Aware Context Manager
          ↓
Persona Prompt Aktif
          ↓
Dynamic System Prompt
          ↓
Groq LLM
          ↓
Respons empatik adaptif
```

## Catatan Keamanan

- FER tidak boleh dijadikan diagnosis.
- FER hanya sinyal pendukung untuk menyesuaikan gaya respons.
- Teks pengguna tetap dipakai untuk mendeteksi risiko krisis.
- Jika terdeteksi risiko menyakiti diri, `safety_support` selalu diprioritaskan.
