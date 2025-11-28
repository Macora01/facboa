// frontend/src/components/CsvUploadSection.jsx

import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';

function CsvUploadSection() {
  const [cargaInicialFile, setCargaInicialFile] = useState(null);
  const [transferenciaFile, setTransferenciaFile] = useState(null);
  const [ventasFile, setVentasFile] = useState(null);
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (event, setter) => {
    setter(event.target.files[0]);
  };

  const handleUpload = async (endpoint, file, filename) => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(endpoint);
    setMessage('');
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      // Limpiar el campo de archivo después de una carga exitosa
      if (endpoint === 'carga-inicial-csv') setCargaInicialFile(null);
      if (endpoint === 'transferencia-csv') setTransferenciaFile(null);
      if (endpoint === 'ventas-diarias-csv') setVentasFile(null);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Error desconocido'}`);
    } finally {
      setLoading('');
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Carga Masiva de Datos (CSV)
      </Typography>

      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Carga Inicial */}
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
            onChange={(e) => handleFileChange(e, setCargaInicialFile)}
          />
          <label htmlFor="carga-inicial-csv-upload">
            <Button variant="outlined" component="span" disabled={loading === 'carga-inicial-csv'}>
              {loading === 'carga-inicial-csv' ? <CircularProgress size={20} /> : 'Seleccionar Archivo'}
            </Button>
          </label>
          <Button
            variant="contained"
            onClick={() => handleUpload('carga-inicial-csv', cargaInicialFile, 'inventario_inicial.csv')}
            disabled={!cargaInicialFile || loading === 'carga-inicial-csv'}
            sx={{ ml: 2 }}
          >
            Cargar
          </Button>
        </Box>

        {/* Transferencias */}
        <Box>
          <Typography variant="subtitle1">2. Transferencias entre Bodegas</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Mueve stock desde la Bodega Principal a otro punto. Formato: <code>tras_bod_LUGAR_AAAAMMDD.csv</code>.
          </Typography>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="transferencia-csv-upload"
            type="file"
            onChange={(e) => handleFileChange(e, setTransferenciaFile)}
          />
          <label htmlFor="transferencia-csv-upload">
            <Button variant="outlined" component="span" disabled={loading === 'transferencia-csv'}>
              {loading === 'transferencia-csv' ? <CircularProgress size={20} /> : 'Seleccionar Archivo'}
            </Button>
          </label>
          <Button
            variant="contained"
            onClick={() => handleUpload('transferencia-csv', transferenciaFile, 'transferencia.csv')}
            disabled={!transferenciaFile || loading === 'transferencia-csv'}
            sx={{ ml: 2 }}
          >
            Transferir
          </Button>
        </Box>

        {/* Ventas Diarias */}
        <Box>
          <Typography variant="subtitle1">3. Ventas Diarias</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Registra las ventas de un punto de venta. Formato: <code>LUGAR_AAAAMMDD.csv</code>.
          </Typography>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="ventas-diarias-csv-upload"
            type="file"
            onChange={(e) => handleFileChange(e, setVentasFile)}
          />
          <label htmlFor="ventas-diarias-csv-upload">
            <Button variant="outlined" component="span" disabled={loading === 'ventas-diarias-csv'}>
              {loading === 'ventas-diarias-csv' ? <CircularProgress size={20} /> : 'Seleccionar Archivo'}
            </Button>
          </label>
          <Button
            variant="contained"
            onClick={() => handleUpload('ventas-diarias-csv', ventasFile, 'ventas.csv')}
            disabled={!ventasFile || loading === 'ventas-diarias-csv'}
            sx={{ ml: 2 }}
          >
            Cargar Ventas
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default CsvUploadSection;