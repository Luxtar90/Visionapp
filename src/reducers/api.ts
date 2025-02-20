import axios from "axios";
import API_URL from "../../config/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 10000, // 10 segundos de timeout
  withCredentials: false,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Acepta cualquier respuesta entre 200-499
  }
});

// Agregar interceptor para logs
api.interceptors.request.use(request => {
  console.log('Starting Request', {
    url: request.url,
    method: request.method,
    headers: request.headers
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      config: error.config,
      response: error.response
    });
    return Promise.reject(error);
  }
);

export default api;
