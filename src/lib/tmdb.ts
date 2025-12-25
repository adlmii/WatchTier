import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Membuat instance axios dengan konfigurasi dasar
export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

// URL helper untuk mengambil gambar poster
// Ukuran w500 cukup bagus dan ringan
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';