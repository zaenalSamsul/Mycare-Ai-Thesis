# Gunakan base image resmi Node.js versi 18
FROM node:18-slim

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies untuk production
RUN npm install --omit=dev

# Copy sisa file aplikasi (server.js, folder public, dll)
COPY . .

# Jalankan server saat container dimulai
CMD [ "node", "server.js" ]