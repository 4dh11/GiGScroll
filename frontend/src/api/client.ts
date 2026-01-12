import axios from 'axios';

// Create a configured instance of axios
const client = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Your backend URL
});

// Automatically add the JWT token to every request if we have one
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;