import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL base da API
  timeout: 10000, // Tempo limite de requisição em milissegundos
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

export default api;