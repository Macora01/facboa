import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

function AppBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FacBoa
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               {user.perfil === 'admin' && (
                <Button color="inherit" onClick={() => navigate('/user-management')}>
                  Usuarios
                </Button>)}
              <Button color="inherit" onClick={() => navigate('/reportes')}>
                Reportes
              </Button>
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