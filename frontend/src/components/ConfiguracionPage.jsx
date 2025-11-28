// frontend/src/components/ConfiguracionPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

function ConfiguracionPage() {
  // Estado para controlar el diálogo de confirmación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // <-- NUEVO: Estado para manejar el archivo seleccionado
  const [selectedFile, setSelectedFile] = useState(null);

  const handleOpenDialog = () => {
    setConfirmDialogOpen(true);
    setMessage('');
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedFile(null); // <-- NUEVO: Limpiar el archivo al cerrar
  };

  // <-- NUEVO: Función para manejar la selección del archivo desde el input
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // <-- MODIFICADO: Lógica real para cargar el archivo
  const handleConfirmLoad = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/carga-inicial-csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setTimeout(() => {
        handleCloseDialog();
      }, 1500); // Cierra el diálogo después de un corto retraso
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      const errorMessage = error.response?.data?.error || 'Error desconocido al cargar el archivo.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración del Sistema
      </Typography>

      {/* Sección de Opciones Peligrosas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="error.main">
          ⚠️ Opciones de Administrador (Peligroso)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Sección de Carga Inicial */}
          <Box>
            <Typography variant="subtitle1">1. Carga Inicial de Inventario</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Carga todos los productos a la Bodega Principal. Formato: <code>inventario_inicial.csv</code>.
            </Typography>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="carga-inicial-csv-upload"
              type="file"
              onChange={handleFileChange}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <label htmlFor="carga-inicial-csv-upload">
                <Button variant="outlined" disabled={loading}>
                  {selectedFile ? selectedFile.name : 'Seleccionar Archivo'}
                </Button>
              </label>
              <Button
                variant="contained"
                onClick={handleConfirmLoad}
                disabled={!selectedFile || loading}
                sx={{ ml: 2 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Cargar'}
              </Button>
            </Box>
          </Box>

          {/* Los otros botones los implementaremos después */}
          <Button variant="outlined" color="error" fullWidth disabled>
            Borrado Masivo de Productos
          </Button>
          <Button variant="outlined" color="error" fullWidth disabled>
            Reiniciar Base de Datos
          </Button>
        </Box>
      </Paper>

      {/* Sección de Gestión de Usuarios */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" href="/user-management">
            Gestionar Usuarios
          </Button>
        </Box>
      </Paper>

      {/* Diálogo de Confirmación para Carga Inicial */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Carga Inicial</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres cargar el archivo <strong>{selectedFile?.name}</strong>? Esta acción puede sobreescribir datos existentes.
          </Typography>
          {message && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">{message}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmLoad} autoFocus color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar y Cargar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ConfiguracionPage;