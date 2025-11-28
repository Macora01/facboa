// frontend/src/components/AppBar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

function AppBar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FacBoa (Cargando...)
          </Typography>
          <CircularProgress color="inherit" size={24} />
        </Toolbar>
      </MuiAppBar>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FacBoa
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              
              {/* Nuevo enlace a Productos */}
              <Button color="inherit" onClick={() => navigate('/productos')}>
                Productos
              </Button>

              <Button color="inherit" onClick={() => navigate('/reportes')}>
                Reportes
              </Button>

              {user.perfil === 'admin' && (
                <Button color="inherit" onClick={() => navigate('/user-management')}>
                  Usuarios
                </Button>
              )}

              <Typography variant="body1">
                Hola, {user.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Box>
          )}
        </Toolbar>
      </MuiAppBar>
    </Box>
  );
}

export default AppBar;