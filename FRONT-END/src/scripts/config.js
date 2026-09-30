// config.js
const config = {
  // Base URL untuk API
  API_BASE_URL: 'https://mycare.yusufabdil.my.id',
  CHATBOT_API_BASE_URL: 'http://localhost:3000',
  TOKEN_STORAGE_KEY: 'token',

  // Default route untuk halaman login
  LOGIN_ROUTE: '/login',

  // Default route untuk halaman home
  HOME_ROUTE: '/',

  // Default route untuk halaman profil
  PROFILE_ROUTE: '/profile',

  // Default route untuk halaman artikel
  ARTICLES_ROUTE: '/articles',

  // Default route untuk halaman chat
  CHAT_ROUTE: '/chat',

  // Konfigurasi API untuk login dan registrasi
  AUTH_API: {
    LOGIN_URL: '/auth/login',
    REGISTER_URL: '/auth/register',
    LOGOUT_URL: '/auth/logout',
    GOOGLE_AUTH_URL: '/auth/google',
    SUCCESS_URL: '/auth/success',
  },

  // Konfigurasi API untuk Daily Notes
  NOTES_API: {
    GET_NOTES_URL: '/notes',
    POST_NOTES_URL: '/notes',
    PUT_NOTES_URL: '/notes/:id',
    DELETE_NOTES_URL: '/notes/:id',
  },

  // Konfigurasi API untuk Music
  MUSIC_API: {
    GET_MUSIC_URL: '/music',
    POST_MUSIC_URL: '/music',
    GET_FAVORITES_URL: '/music/favorites',
    POST_FAVORITE_URL: '/music/favorite/:id',
  },

  // Konfigurasi API untuk Articles
  ARTICLES_API: {
    GET_ALL_ARTICLES_URL: '/articles',
    GET_ARTICLE_BY_ID_URL: '/articles/:id',
    POST_ARTICLE_URL: '/articles',
    PUT_ARTICLE_URL: '/articles/:id',
    DELETE_ARTICLE_URL: '/articles/:id',
  },
};

export default config;