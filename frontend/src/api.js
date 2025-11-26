import axios from 'axios';

// Creamos una instancia pre-configurada de Axios para que no tengamos que configurar cada petición.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
},
  // ¡LA LÍNEA CLAVE ES LA CLAVE!**
  withCredentials: true, // <-- ¡ESTA ES LA CLAVE!
  // El resto de la configuración (baseURL, headers) se hereda.
});

export default api;