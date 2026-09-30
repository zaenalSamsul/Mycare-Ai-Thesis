FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite embeds this value into the static files at build time.
ARG VITE_MYCARE_CHAT_API_BASE_URL=http://localhost:3000
ENV VITE_MYCARE_CHAT_API_BASE_URL=$VITE_MYCARE_CHAT_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
