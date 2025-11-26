import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para verificar si hay una sesión activa al cargar

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error de conexión' };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/logout/');
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    // Aquí podríamos añadir una lógica para verificar si el usuario ya tiene una sesión activa
    // Por ahora, simplemente dejamos de cargar.
    setLoading(false);
  }, []);

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);