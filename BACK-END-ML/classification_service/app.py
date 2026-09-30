"""REST service klasifikasi emosi teks MyCareAI dengan model 4 kelas."""

import json
import os
import re

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from googletrans import Translator
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import tokenizer_from_json


app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.getenv(
    "CLASSIFICATION_MODEL_PATH",
    os.path.join(BASE_DIR, "emotion_model_4class.h5"),
)
TOKENIZER_PATH = os.getenv(
    "CLASSIFICATION_TOKENIZER_PATH",
    os.path.join(BASE_DIR, "tokenizer_4class.json"),
)
CONFIG_PATH = os.getenv(
    "CLASSIFICATION_CONFIG_PATH",
    os.path.join(BASE_DIR, "emotion_model_config.json"),
)
THRESHOLD = float(os.getenv("CLASSIFICATION_THRESHOLD", "0.75"))
EXPECTED_LABELS = ["sadness", "happy", "anger", "fear"]

model = None
tokenizer = None
model_config = None
labels = []
max_sequence_length = 60


def build_compatible_model(config):
    """Bangun arsitektur model agar bobot Keras 3.13 dapat dipakai di runtime 3.10.

    File H5 dibuat dengan Keras yang lebih baru dan membawa metadata
    ``quantization_config`` yang belum dikenali TensorFlow/Keras di image Docker.
    Arsitektur berikut sama dengan arsitektur yang tersimpan di H5; bobotnya tetap
    dibaca langsung dari file model pengguna.
    """
    vocab_size = int(config.get("max_vocab_size", 20000))
    embedding_dim = int(config.get("embedding_dim", 128))
    sequence_length = int(config.get("max_sequence_length", 60))
    num_classes = int(config.get("num_classes", 4))
    layer = tf.keras.layers

    compatible_model = tf.keras.Sequential([
        layer.Input(shape=(sequence_length,), name="input_layer"),
        layer.Embedding(
            vocab_size,
            embedding_dim,
            mask_zero=True,
            name="embedding",
        ),
        layer.Bidirectional(
            layer.LSTM(128, return_sequences=True, dropout=0.2),
            name="bidirectional",
        ),
        layer.Bidirectional(
            layer.LSTM(64, return_sequences=True, dropout=0.2),
            name="bidirectional_1",
        ),
        layer.Bidirectional(
            layer.LSTM(32, dropout=0.25),
            name="bidirectional_2",
        ),
        layer.BatchNormalization(name="batch_normalization"),
        layer.Dense(128, activation="relu", name="dense"),
        layer.Dropout(0.4, name="dropout"),
        layer.Dense(64, activation="relu", name="dense_1"),
        layer.Dropout(0.3, name="dropout_1"),
        layer.Dense(32, activation="relu", name="dense_2"),
        layer.Dropout(0.2, name="dropout_2"),
        layer.Dense(num_classes, activation="softmax", name="dense_3"),
    ])
    compatible_model.load_weights(MODEL_PATH)
    return compatible_model


try:
    required_paths = [MODEL_PATH, TOKENIZER_PATH, CONFIG_PATH]
    missing_paths = [path for path in required_paths if not os.path.exists(path)]
    if missing_paths:
        raise FileNotFoundError(f"File resource tidak ditemukan: {missing_paths}")

    with open(CONFIG_PATH, "r", encoding="utf-8") as config_file:
        model_config = json.load(config_file)

    labels = model_config.get("labels", [])
    max_sequence_length = int(model_config.get("max_sequence_length", 60))
    if labels != EXPECTED_LABELS:
        raise ValueError(
            f"Urutan label config harus {EXPECTED_LABELS}, tetapi ditemukan {labels}"
        )

    model = build_compatible_model(model_config)
    output_count = int(model.output_shape[-1])
    if output_count != len(labels):
        raise ValueError(
            f"Output model berjumlah {output_count}, tetapi config memiliki {len(labels)} label"
        )
    print(f"Model 4 kelas berhasil dimuat: {labels}")

    with open(TOKENIZER_PATH, "r", encoding="utf-8") as tokenizer_file:
        tokenizer = tokenizer_from_json(tokenizer_file.read())
    print(f"Tokenizer 4 kelas berhasil dimuat (max_len={max_sequence_length}).")
except Exception as exc:
    print(f"Gagal memuat resource klasifikasi 4 kelas: {exc}")


def resources_ready():
    return (
        model is not None
        and tokenizer is not None
        and model_config is not None
        and labels == EXPECTED_LABELS
    )


def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text, flags=re.UNICODE)
    text = re.sub(r"\d+", "", text)
    return text.strip()


async def translate_to_english(text_id):
    try:
        # Translator harus dibuat pada event loop request yang sedang aktif.
        async with Translator() as request_translator:
            translated = await request_translator.translate(
                text_id,
                src="id",
                dest="en",
            )
        return translated.text
    except Exception as exc:
        print(f"Error saat menerjemahkan: {exc}")
        return text_id


@app.get("/health")
def health_check():
    if resources_ready():
        return jsonify({
            "status": "OK",
            "service": "MyCareAI Classification Service",
            "labels": labels,
            "max_sequence_length": max_sequence_length,
            "threshold": THRESHOLD,
        })
    return jsonify({
        "status": "ERROR",
        "error": "Model/Tokenizer/Config belum siap",
    }), 503


@app.post("/classify")
async def classify_emotion():
    if not resources_ready():
        return jsonify({"error": "Model/Tokenizer/Config tidak siap digunakan"}), 500

    data = request.get_json(silent=True) or {}
    text_indo = str(data.get("text", "")).strip()
    if not text_indo:
        return jsonify({
            "error": 'Request body harus berisi field "text" dalam Bahasa Indonesia'
        }), 400

    try:
        print(f"\n--- Menerima Teks (ID): '{text_indo}' ---")
        text_eng = await translate_to_english(text_indo)
        print(f"Hasil Terjemahan (EN): '{text_eng}'")

        cleaned_text = preprocess_text(text_eng)
        sequence = tokenizer.texts_to_sequences([cleaned_text])
        padded_sequence = pad_sequences(
            sequence,
            maxlen=max_sequence_length,
            padding="post",
            truncating="post",
        )

        prediction = model.predict(padded_sequence, verbose=0)[0]
        if len(prediction) != len(labels):
            raise ValueError(
                f"Output prediksi {len(prediction)} tidak cocok dengan {len(labels)} label"
            )

        predicted_index = int(np.argmax(prediction))
        probability = float(prediction[predicted_index])
        model_label = labels[predicted_index]
        detected_emotion = model_label if probability >= THRESHOLD else "neutral"

        print(
            f"Prediksi Final: {detected_emotion} "
            f"(Label Model: {model_label}, Probabilitas: {probability:.2f})"
        )

        return jsonify({
            "emotion": detected_emotion,
            "probability": probability,
            "model_label": model_label,
            "probabilities": {
                label: float(prediction[index])
                for index, label in enumerate(labels)
            },
        })
    except Exception as exc:
        print(f"Error saat proses klasifikasi: {exc}")
        return jsonify({"error": "Terjadi kesalahan internal saat klasifikasi"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
