import cv2
import numpy as np
from tflite_runtime.interpreter import Interpreter
from collections import deque, Counter


MODEL_PATH = "fer_rafdb_vgg16se_5cls_128x128.tflite"
LABELS_PATH = "labels.txt"

IMG_SIZE = (128, 128)
CONFIDENCE_THRESHOLD = 0.65
MARGIN_THRESHOLD = 0.15
SMOOTHING_WINDOW = 20


def load_labels(labels_path):
    with open(labels_path, "r", encoding="utf-8") as f:
        labels = [line.strip() for line in f.readlines() if line.strip()]
    return labels


def vgg16_preprocess_input_rgb(image_rgb):
    """
    Meniru tensorflow.keras.applications.vgg16.preprocess_input.
    RGB -> BGR, lalu zero-center dengan mean ImageNet.
    """
    image = image_rgb.astype(np.float32)
    image = image[..., ::-1]  # RGB to BGR

    image[..., 0] -= 103.939
    image[..., 1] -= 116.779
    image[..., 2] -= 123.68

    return image


def preprocess_face_tflite(face_bgr, input_details):
    face = cv2.resize(face_bgr, IMG_SIZE)
    face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)

    input_dtype = input_details[0]["dtype"]

    if input_dtype == np.float32:
        face_processed = vgg16_preprocess_input_rgb(face_rgb)
        face_processed = np.expand_dims(face_processed, axis=0).astype(np.float32)

    elif input_dtype == np.uint8:
        face_processed = np.expand_dims(face_rgb, axis=0).astype(np.uint8)

    else:
        raise ValueError(f"Unsupported input dtype: {input_dtype}")

    return face_processed


def run_tflite_inference(interpreter, input_details, output_details, input_data):
    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]["index"])[0]

    return output_data


def interpret_prediction(probabilities, labels):
    probabilities = np.array(probabilities)

    top_indices = np.argsort(probabilities)[::-1]
    top1_idx = top_indices[0]
    top2_idx = top_indices[1]

    top1_prob = float(probabilities[top1_idx])
    top2_prob = float(probabilities[top2_idx])

    pred_label = labels[top1_idx]

    if top1_prob < CONFIDENCE_THRESHOLD:
        return "uncertain", top1_prob

    if (top1_prob - top2_prob) < MARGIN_THRESHOLD:
        return "uncertain", top1_prob

    return pred_label, top1_prob


def smooth_prediction(pred_history):
    valid_preds = [pred for pred in pred_history if pred != "uncertain"]

    if len(valid_preds) == 0:
        return "uncertain"

    return Counter(valid_preds).most_common(1)[0][0]


def map_to_persona_state(emotion):
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


def main():
    labels = load_labels(LABELS_PATH)

    interpreter = Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("Model loaded:", MODEL_PATH)
    print("Labels:", labels)
    print("Input details:", input_details)
    print("Output details:", output_details)

    face_cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(face_cascade_path)

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Tidak bisa membuka webcam.")
        return

    pred_history = deque(maxlen=SMOOTHING_WINDOW)

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Gagal membaca frame.")
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(60, 60)
        )

        if len(faces) == 0:
            pred_history.clear()
            cv2.putText(
                frame,
                "No face detected",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2
            )
            cv2.imshow("MyCareAI FER TFLite Prototype", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

            continue

        # Ambil wajah terbesar
        faces = sorted(faces, key=lambda box: box[2] * box[3], reverse=True)
        x, y, w, h = faces[0]

        margin = int(0.15 * w)

        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(frame.shape[1], x + w + margin)
        y2 = min(frame.shape[0], y + h + margin)

        face_roi = frame[y1:y2, x1:x2]

        if face_roi.size != 0:
            input_data = preprocess_face_tflite(face_roi, input_details)
            probs = run_tflite_inference(
                interpreter,
                input_details,
                output_details,
                input_data
            )

            emotion, confidence = interpret_prediction(probs, labels)
            pred_history.append(emotion)

            smoothed_emotion = smooth_prediction(pred_history)
            persona_state = map_to_persona_state(smoothed_emotion)

            if smoothed_emotion in ["angry", "fear", "sad"]:
                color = (0, 165, 255)
            elif smoothed_emotion == "happy":
                color = (0, 255, 0)
            elif smoothed_emotion == "neutral":
                color = (255, 255, 0)
            else:
                color = (180, 180, 180)

            label_text = f"{smoothed_emotion} ({confidence:.2f})"
            persona_text = f"Persona: {persona_state}"

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            cv2.putText(
                frame,
                label_text,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2
            )

            cv2.putText(
                frame,
                persona_text,
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

        cv2.imshow("MyCareAI FER TFLite Prototype", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
