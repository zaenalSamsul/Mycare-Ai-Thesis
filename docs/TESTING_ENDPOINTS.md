# Testing Endpoints

## 1. Health Check Backend

```bash
curl http://localhost:3000/api/health
```

## 2. Test Persona Preview tanpa LLM

Endpoint ini hemat token karena tidak memanggil Gemini.

```bash
curl -X POST http://localhost:3000/api/persona/preview \
  -H "Content-Type: application/json" \
  -d '{
    "active_emotion": "sadness",
    "user_message": "Aku merasa capek banget akhir-akhir ini",
    "conversation_context": [],
    "face_emotion": {
      "emotion": "sad",
      "confidence": 0.86
    }
  }'
```

Output utama yang diharapkan:

```json
{
  "adaptive_persona": {
    "state": "sadness_support",
    "source": "fer_label",
    "textEmotion": "sadness",
    "emotionLabel": "sad",
    "confidenceScore": 0.86,
    "confidenceLevel": "not_used_for_decision"
  }
}
```

## 3. Test Skor Confidence Rendah

```bash
curl -X POST http://localhost:3000/api/persona/preview \
  -H "Content-Type: application/json" \
  -d '{
    "active_emotion": "fear",
    "user_message": "Aku agak takut",
    "face_emotion": {
      "emotion": "fear",
      "confidence": 0.42
    }
  }'
```

Output utama:

```txt
fear_grounding
```

Alasan: confidence tidak menjadi ambang keputusan; label `fear` tetap dipakai selama wajah terdeteksi.

## 4. Test Safety Support

```bash
curl -X POST http://localhost:3000/api/persona/preview \
  -H "Content-Type: application/json" \
  -d '{
    "active_emotion": "neutral",
    "user_message": "Aku mau bunuh diri",
    "face_emotion": {
      "emotion": "neutral",
      "confidence": 0.91
    }
  }'
```

Output utama:

```txt
safety_support
```

Alasan: risiko tinggi dari teks selalu mengalahkan hasil FER.

## 5. Test Chat dengan Adaptive Persona

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Aku merasa capek banget akhir-akhir ini",
    "active_emotion": "sadness",
    "face_emotion": {
      "emotion": "sad",
      "confidence": 0.83
    },
    "conversation_history": []
  }'
```

Respons akan berisi:

```json
{
  "reply": "...",
  "adaptive_persona": {
    "state": "sadness_support"
  },
  "emotion_fusion": {
    "text_emotion": "sadness",
    "face_emotion": "sad",
    "confidence_score": 0.83,
    "persona_state": "sadness_support",
    "decision_source": "fer_label",
    "crisis_detected": false
  }
}
```

## 6. Test FER Service

Gunakan frontend untuk pengujian kamera, atau kirim base64 image ke:

```txt
POST http://localhost:3000/api/fer/analyze
```

Body:

```json
{
  "image": "data:image/jpeg;base64,...",
  "model": "fer2013"
}
```

