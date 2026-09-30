"""FER API Service for MyCareAI.

Service ini mengubah prototype webcam TFLite menjadi REST API agar bisa
terintegrasi dengan frontend MyCareAI dan backend Node.js.

Endpoint utama:
- GET  /health
- POST /predict

POST /predict body:
{
  "image": "data:image/jpeg;base64,..." atau base64 murni,
  "model": "fer2013" | "rafdb"   // opsional
}
"""

import base64
import os
from typing import Dict, List, Tuple

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from tflite_runtime.interpreter import Interpreter

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_MAP = {
    "fer2013": "fer_rafdb_vgg16se_5cls_128x128.tflite",
    "rafdb": "fer_rafdb_vgg16se_5cls_128x128.tflite",
}

DEFAULT_MODEL_KEY = os.getenv("FER_MODEL_KEY", "fer2013")
LABELS_PATH = os.getenv("FER_LABELS_PATH", os.path.join(BASE_DIR, "labels.txt"))
LANDMARKER_MODEL_PATH = os.getenv("FER_LANDMARKER_MODEL_PATH", os.path.join(BASE_DIR, "face_landmarker.task"))
LANDMARK_MEAN_PATH = os.getenv("FER_LANDMARK_MEAN_PATH", os.path.join(BASE_DIR, "landmark_mean.npy"))
LANDMARK_STD_PATH = os.getenv("FER_LANDMARK_STD_PATH", os.path.join(BASE_DIR, "landmark_std.npy"))
IMG_SIZE = (128, 128)

_interpreters: Dict[str, Interpreter] = {}
_io_details: Dict[str, Tuple[list, list]] = {}
_labels: List[str] = []
_face_landmarker = None
_landmark_mean = None
_landmark_std = None

# Indeks dan fitur ini harus identik dengan notebook training.
_LM_IDX = {
    "l_eye_outer": 33, "l_eye_inner": 133, "r_eye_inner": 362, "r_eye_outer": 263,
    "l_eye_top": 159, "l_eye_bot": 145, "r_eye_top": 386, "r_eye_bot": 374,
    "l_brow_out": 70, "l_brow_mid": 105, "l_brow_in": 107,
    "r_brow_out": 300, "r_brow_mid": 334, "r_brow_in": 336,
    "mouth_l": 61, "mouth_r": 291, "lip_top": 13, "lip_bot": 14,
    "nose_tip": 1, "chin": 152,
}


def load_labels(labels_path: str) -> List[str]:
    with open(labels_path, "r", encoding="utf-8") as file:
        return [line.strip() for line in file.readlines() if line.strip()]


def get_model_path(model_key: str) -> str:
    filename = MODEL_MAP.get(model_key, MODEL_MAP[DEFAULT_MODEL_KEY])
    return os.path.join(BASE_DIR, filename)


def get_interpreter(model_key: str):
    if model_key not in MODEL_MAP:
        model_key = DEFAULT_MODEL_KEY

    if model_key not in _interpreters:
        model_path = get_model_path(model_key)
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model tidak ditemukan: {model_path}")

        interpreter = Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        _interpreters[model_key] = interpreter
        _io_details[model_key] = (
            interpreter.get_input_details(),
            interpreter.get_output_details(),
        )

    return _interpreters[model_key], _io_details[model_key]


def get_landmark_resources():
    """Muat FaceLandmarker dan statistik standardisasi dari training."""
    global _face_landmarker, _landmark_mean, _landmark_std

    if _face_landmarker is None:
        if not os.path.exists(LANDMARKER_MODEL_PATH):
            raise FileNotFoundError(f"FaceLandmarker model tidak ditemukan: {LANDMARKER_MODEL_PATH}")

        options = mp_vision.FaceLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=LANDMARKER_MODEL_PATH),
            running_mode=mp_vision.RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.3,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        _face_landmarker = mp_vision.FaceLandmarker.create_from_options(options)

    if _landmark_mean is None or _landmark_std is None:
        _landmark_mean = np.load(LANDMARK_MEAN_PATH).astype(np.float32).reshape(-1)
        _landmark_std = np.load(LANDMARK_STD_PATH).astype(np.float32).reshape(-1)
        if _landmark_mean.shape != (16,) or _landmark_std.shape != (16,):
            raise ValueError("landmark_mean.npy dan landmark_std.npy harus memiliki 16 nilai")

    return _face_landmarker, _landmark_mean, _landmark_std


def landmark_distance(points: Dict[str, Tuple[float, float]], first: str, second: str) -> float:
    return float(np.linalg.norm(np.array(points[first]) - np.array(points[second])))


def extract_landmark_features(landmarks, frame_shape: Tuple[int, int, int]) -> np.ndarray:
    """Buat 16 fitur geometri MediaPipe yang sama seperti model dari app.zip."""
    height, width = frame_shape[:2]
    points = {
        name: (landmarks[index].x * width, landmarks[index].y * height)
        for name, index in _LM_IDX.items()
    }
    eye_dist = landmark_distance(points, "l_eye_outer", "r_eye_outer") + 1e-6
    nose_chin = landmark_distance(points, "nose_tip", "chin") + 1e-6

    features = [
        landmark_distance(points, "l_eye_top", "l_eye_bot") / eye_dist,
        landmark_distance(points, "r_eye_top", "r_eye_bot") / eye_dist,
        landmark_distance(points, "l_brow_mid", "l_eye_top") / eye_dist,
        landmark_distance(points, "r_brow_mid", "r_eye_top") / eye_dist,
        landmark_distance(points, "l_brow_in", "r_brow_in") / eye_dist,
        landmark_distance(points, "mouth_l", "mouth_r") / eye_dist,
        landmark_distance(points, "lip_top", "lip_bot") / eye_dist,
        landmark_distance(points, "mouth_l", "nose_tip") / eye_dist,
        landmark_distance(points, "mouth_r", "nose_tip") / eye_dist,
        (points["l_brow_mid"][1] - points["l_brow_out"][1]) / eye_dist,
        (points["r_brow_mid"][1] - points["r_brow_out"][1]) / eye_dist,
        nose_chin / eye_dist,
        landmark_distance(points, "lip_bot", "chin") / eye_dist,
        abs(landmark_distance(points, "l_brow_mid", "l_eye_top") - landmark_distance(points, "r_brow_mid", "r_eye_top")) / eye_dist,
        landmark_distance(points, "l_eye_inner", "r_eye_inner") / eye_dist,
        landmark_distance(points, "mouth_l", "mouth_r") / nose_chin,
    ]
    return np.array(features, dtype=np.float32)


def preprocess_landmark_features(landmarks, frame_shape: Tuple[int, int, int]) -> np.ndarray:
    """Ekstrak dan standardisasi landmark sesuai statistik data training."""
    _, landmark_mean, landmark_std = get_landmark_resources()
    raw_features = extract_landmark_features(landmarks, frame_shape)
    standardized = (raw_features - landmark_mean) / landmark_std
    return np.expand_dims(standardized.astype(np.float32), axis=0)


def vgg16_preprocess_input_rgb(image_rgb: np.ndarray) -> np.ndarray:
    """Meniru tensorflow.keras.applications.vgg16.preprocess_input.

    VGG16 preprocess: RGB -> BGR, lalu zero-center dengan mean ImageNet.
    """
    image = image_rgb.astype(np.float32)
    image = image[..., ::-1]
    image[..., 0] -= 103.939
    image[..., 1] -= 116.779
    image[..., 2] -= 123.68
    return image


def decode_base64_image(image_payload: str) -> np.ndarray:
    if not image_payload:
        raise ValueError("Field image tidak boleh kosong")

    if "," in image_payload:
        image_payload = image_payload.split(",", 1)[1]

    image_bytes = base64.b64decode(image_payload)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image_bgr is None:
        raise ValueError("Gagal membaca image. Pastikan format base64 valid.")

    return image_bgr


def detect_face_and_landmarks(image_bgr: np.ndarray):
    """Gunakan Face Landmarker dari app.zip untuk deteksi, crop, dan landmark.

    Satu hasil deteksi dipakai untuk kedua input model supaya ROI gambar dan
    fitur landmark selalu berasal dari wajah yang sama.
    """
    face_landmarker, _, _ = get_landmark_resources()
    height, width = image_bgr.shape[:2]
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    result = face_landmarker.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb))

    if not result.face_landmarks:
        return None, None, None

    landmarks = result.face_landmarks[0]
    xs = np.array([landmark.x for landmark in landmarks], dtype=np.float32)
    ys = np.array([landmark.y for landmark in landmarks], dtype=np.float32)
    face_margin = 0.15
    x1 = max(0, int((xs.min() - face_margin) * width))
    y1 = max(0, int((ys.min() - face_margin) * height))
    x2 = min(width, int((xs.max() + face_margin) * width))
    y2 = min(height, int((ys.max() + face_margin) * height))
    face_roi = image_bgr[y1:y2, x1:x2]

    if face_roi.size == 0:
        return None, None, None

    return landmarks, face_roi, {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}


def preprocess_face_tflite(face_bgr: np.ndarray, input_details: list) -> np.ndarray:
    face = cv2.resize(face_bgr, IMG_SIZE)
    face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    input_dtype = input_details[0]["dtype"]

    if input_dtype == np.float32:
        face_processed = vgg16_preprocess_input_rgb(face_rgb)
        return np.expand_dims(face_processed, axis=0).astype(np.float32)

    if input_dtype == np.uint8:
        return np.expand_dims(face_rgb, axis=0).astype(np.uint8)

    raise ValueError(f"Unsupported input dtype: {input_dtype}")


def normalize_probabilities(output_data: np.ndarray) -> np.ndarray:
    output_data = np.asarray(output_data, dtype=np.float32)
    if np.any(output_data < 0) or not np.isclose(float(output_data.sum()), 1.0, atol=1e-2):
        exp = np.exp(output_data - np.max(output_data))
        return exp / exp.sum()
    return output_data


def run_tflite_inference(interpreter, input_details, output_details, input_data, landmark_input) -> np.ndarray:
    """Jalankan model TFLite dengan seluruh tensor input yang dibutuhkan.

    Model FER mempunyai input gambar dan input landmark berukuran 16.
    """
    for detail in input_details:
        expected_shape = tuple(detail["shape"])

        if len(expected_shape) == 4:
            tensor = input_data
        elif len(expected_shape) == 2 and expected_shape[-1] == 16:
            tensor = landmark_input.astype(detail["dtype"])
        else:
            raise ValueError(
                f"Input model tidak didukung: {detail['name']} dengan shape {expected_shape}"
            )

        interpreter.set_tensor(detail["index"], tensor)

    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]["index"])[0]
    return normalize_probabilities(output_data)


def interpret_prediction(probabilities: np.ndarray, labels: List[str]):
    top1_idx = int(np.argmax(probabilities))
    top1_prob = float(probabilities[top1_idx])
    # Tidak ada confidence atau margin threshold: selama wajah terdeteksi,
    # label dengan skor tertinggi selalu dikembalikan agar alur FER berjalan.
    return labels[top1_idx], top1_prob


def map_to_persona_state(emotion: str) -> str:
    """
    Mapping awal dari FER service.
    Keputusan persona final tetap dilakukan di Emotion-Aware Context Manager
    pada backend Node.js karena perlu mempertimbangkan user_message,
    conversation_context, dan active_emotion dari klasifikasi chatbot.
    """
    if emotion == "happy":
        return "positive_reinforcement"
    if emotion == "sad":
        return "sadness_support"
    if emotion == "fear":
        return "fear_grounding"
    if emotion == "angry":
        return "anger_deescalation"
    if emotion == "neutral":
        return "neutral_supportive"
    return "neutral_supportive"


@app.before_request
def ensure_resources_loaded():
    global _labels
    if not _labels:
        _labels = load_labels(LABELS_PATH)


@app.get("/health")
def health_check():
    model_key = request.args.get("model", DEFAULT_MODEL_KEY)
    return jsonify({
        "status": "OK",
        "service": "MyCareAI FER Service",
        "default_model": DEFAULT_MODEL_KEY,
        "selected_model": model_key if model_key in MODEL_MAP else DEFAULT_MODEL_KEY,
        "labels": _labels or load_labels(LABELS_PATH),
    })


@app.post("/predict")
def predict_face_emotion():
    try:
        data = request.get_json(silent=True) or {}
        image_payload = data.get("image")
        model_key = data.get("model", DEFAULT_MODEL_KEY)

        if not image_payload:
            return jsonify({"error": "Request body harus berisi field image"}), 400

        image_bgr = decode_base64_image(image_payload)
        landmarks, face_roi, face_box = detect_face_and_landmarks(image_bgr)

        if face_roi is None or face_roi.size == 0:
            app.logger.info("Tidak ada wajah terdeteksi pada frame FER (%sx%s)", image_bgr.shape[1], image_bgr.shape[0])
            return jsonify({
                "face_detected": False,
                "emotion": "uncertain",
                "confidence": 0.0,
                "persona_state": "uncertain_supportive",
                "message": "Tidak ada wajah yang terdeteksi pada frame.",
            })

        interpreter, (input_details, output_details) = get_interpreter(model_key)
        input_data = preprocess_face_tflite(face_roi, input_details)
        landmark_input = preprocess_landmark_features(landmarks, image_bgr.shape)
        probabilities = run_tflite_inference(interpreter, input_details, output_details, input_data, landmark_input)
        emotion, confidence = interpret_prediction(probabilities, _labels)
        app.logger.info("FER wajah terdeteksi: emotion=%s confidence=%.3f", emotion, confidence)

        return jsonify({
            "face_detected": True,
            "emotion": emotion,
            "confidence": confidence,
            "persona_state": map_to_persona_state(emotion),
            "face_box": face_box,
            "probabilities": {
                label: float(probabilities[idx])
                for idx, label in enumerate(_labels)
            },
            "model": model_key if model_key in MODEL_MAP else DEFAULT_MODEL_KEY,
        })

    except Exception as exc:
        app.logger.exception("FER prediction error")
        return jsonify({"error": "Gagal melakukan prediksi FER", "details": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
