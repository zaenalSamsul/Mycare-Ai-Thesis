# Emotion-Aware Context Manager Rules

Dokumen ini menjelaskan implementasi persona adaptif MyCareAI sesuai rancangan skripsi.

## Input

Emotion-Aware Context Manager menerima input berikut:

- `emotion_label`: label emosi dari FER, misalnya `neutral`, `happy`, `sad`, `fear`, atau `angry`.
- `confidence_score`: tingkat keyakinan model FER.
- `user_message`: pesan teks terakhir dari pengguna.
- `conversation_context`: riwayat percakapan singkat.
- `active_emotion`: hasil classifier teks 4 kelas, yaitu `sadness`, `happy`, `anger`, atau `fear`; prediksi di bawah threshold dikirim sebagai `neutral`.
- Risiko bunuh diri/menyakiti diri bukan label model. Context Manager memeriksa pesan terbaru dan riwayat percakapan, mengaktifkan `safety_support`, lalu menyertakan aturan keselamatan dalam prompt LLM.

## Aturan Dasar

1. Jika `user_message`, `conversation_context`, atau `active_emotion` menunjukkan risiko menyakiti diri atau orang lain, sistem mengaktifkan `safety_support`.
2. Jika klasifikasi teks non-netral tersedia, teks diprioritaskan karena berasal langsung dari narasi pengguna; FER tetap menjadi konteks pendukung.
3. Jika teks netral dan FER sudah stabil, persona dipilih dari label FER dominan.
4. Jika teks dan FER berbeda, sistem mencatat `signals_conflicting_text_prioritized` dan tetap memprioritaskan teks.
5. Jika kedua sinyal belum tersedia atau netral, sistem memakai persona netral-suportif.
6. Confidence FER dicatat untuk transparansi, tetapi tidak dipakai sebagai diagnosis atau ambang pemilihan persona.

## Mapping Persona

| Kondisi | Persona Konseptual | Persona Operasional | Varian/state aplikasi |
|---|---|---|---|
| Neutral | Neutral Supportive Persona | `neutral_supportive` | `neutral_supportive` |
| Happy | Positive Reinforcement Persona | `positive_supportive` | `positive_reinforcement` |
| Sad | Sadness Support Persona | `distressed_supportive` | `sadness_support` |
| Fear | Fear Grounding Persona | `distressed_supportive` | `fear_grounding` |
| Angry | Anger De-escalation Persona | `distressed_supportive` | `anger_deescalation` |
| Risiko tinggi dari teks/konteks | Safety Support Persona | `safety_support` | `safety_support` |

Setiap profil juga membawa `objective`, `responseCharacteristics`, `responsePlan`, `avoid`, `fusionStatus`, `riskType`, dan alasan keputusan. Metadata ini dimasukkan ke context block agar LLM tidak hanya menerima label emosi, tetapi juga strategi respons yang konkret.

## File Implementasi

```txt
BACK-END-ML/emotionAwareContextManager.js
```

Fungsi penting:

```js
selectPersona({ emotionLabel, confidenceScore, userMessage, conversationContext, activeEmotion })
determineAdaptivePersona(...)
buildEmotionAwareContext(...)
detectCrisisRisk(...)
detectSafetyRisk(...)
```

## Endpoint Preview

Endpoint ini digunakan untuk menguji persona tanpa memanggil provider LLM, sehingga tidak memakai token Gemini.

```bash
curl -X POST http://localhost:3000/api/persona/preview \
  -H "Content-Type: application/json" \
  -d '{
    "active_emotion": "neutral",
    "user_message": "aku baik-baik saja",
    "face_emotion": {
      "emotion": "sad",
      "confidence": 0.82
    }
  }'
```

Output menampilkan persona konseptual dan operasional, varian respons, tujuan, karakter, rencana respons, larangan, status fusion, alasan keputusan, serta `context_block` yang akan masuk ke prompt LLM.
