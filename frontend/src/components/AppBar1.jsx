// frontend/src/components/AppBar.jsx

import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Importamos el hook para usar el contexto

function AppBar() {
  // Usamos el hook para obtener el estado del usuario y la función de logout
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // La redirección al login se manejará automáticamente por PrivateRoute
    window.location.href = '/login'; 
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FacBoa
          </Typography>
          {user ? (
            // Si el usuario está logueado, mostramos su nombre y el botón de logout
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Hola, {user.username} 
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            // Si no está logueado, podríamos mostrar un enlace a login (opcional)
            <Button color="inherit" href="/login">
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </MuiAppBar>
    </Box>
  );
}

export default AppBar;