# Gunakan base image resmi Python
FROM python:3.9-slim

# Set working directory di dalam container
WORKDIR /app

# Copy file requirements terlebih dahulu untuk efisiensi caching
COPY requirements.txt .

# Install semua library yang dibutuhkan
# BARIS BARU YANG SUDAH DIPERBAIKI
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy semua file dari folder ini (app.py, model .h5, tokenizer .json) ke dalam container
COPY . .

# Perintah untuk menjalankan aplikasi menggunakan Gunicorn saat container dimulai
# Cloud Run akan menyediakan variabel $PORT secara otomatis
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "8", "app:app"]