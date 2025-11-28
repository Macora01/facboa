// frontend/src/components/MovementsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Add';

// Opciones para el campo de tipo de movimiento, deben coincidir con el backend
const TIPO_MOVIMIENTO_OPCIONES = [
  { value: 'entrada_compra', label: 'Entrada por Compra' },
  { value: 'transferencia_entrada', label: 'Entrada por Transferencia' },
  { value: 'transferencia_salida', label: 'Salida por Transferencia' },
  { value: 'venta', label: 'Venta' },
  { value: 'ajuste', label: 'Ajuste Manual' },
  { value: 'merma', label: 'Merma' },
];

function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para el formulario de crear movimiento
  const [newMovement, setNewMovement] = useState({
    tipo: '',
    producto: '',
    cantidad: '',
    ubicacion_origen: '',
    ubicacion_destino: '',
    detalle: '',
  });

  const navigate = useNavigate();

  // Cargar datos para los selectores y la lista de movimientos
  useEffect(() => {
    const fetchData = async () => {
      const [movimientosRes, productosRes, ubicacionesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/movimientos/'),
        axios.get('http://127.0.0.1:8000/api/productos/'),
        axios.get('http://127.0.0.1:8000/api/ubicaciones/'),
      ]);
      setMovements(movimientosRes.data);
      setProductos(productosRes.data);
      setUbicaciones(ubicacionesRes.data);
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateMovement = async () => {
    if (!newMovement.tipo || !newMovement.producto || !newMovement.cantidad) {
      alert('Por favor, completa los campos obligatorios: Tipo, Producto y Cantidad.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/movimientos/', newMovement);
      // Limpiar el formulario y recargar la lista
      setNewMovement({
        tipo: '',
        producto: '',
        cantidad: '',
        ubicacion_origen: '',
        ubicacion_destino: '',
        detalle: '',
      });
      // Recargar la lista de movimientos
      const response = await axios.get('http://127.0.0.1:8000/api/movimientos/');
      setMovements(response.data);
    } catch (error) {
      console.error("Error al crear el movimiento:", error);
      alert('Hubo un error al crear el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'fecha_hora', headerName: 'Fecha y Hora', minWidth: 180, flex: 1 },
    { field: 'producto_nombre', headerName: 'Producto', minWidth: 250, flex: 2 },
    { field: 'tipo_display', headerName: 'Tipo', minWidth: 200, flex: 1 },
    { field: 'cantidad', headerName: 'Cantidad', minWidth: 100, flex: 0.5 },
    { field: 'usuario_nombre', headerName: 'Usuario', minWidth: 150, flex: 1 },
    { field: 'ubicacion_origen_nombre', headerName: 'Origen', minWidth: 150, flex: 1 },
    { field: 'ubicacion_destino_nombre', headerName: 'Destino', minWidth: 150, flex: 1 },
    { field: 'detalle', headerName: 'Detalle', minWidth: 200, flex: 2 },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Movimientos de Inventario
      </Typography>

      {/* Formulario para crear un nuevo movimiento */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Crear Nuevo Movimiento
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Movimiento</InputLabel>
            <Select
              name="tipo"
              value={newMovement.tipo}
              label="Tipo de Movimiento"
              onChange={handleInputChange}
            >
              {TIPO_MOVIMIENTO_OPCIONES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Aquí irían los selectores de producto y ubicaciones usando Autocomplete de MUI */}
          {/* Por simplicidad, usaremos TextField por ahora */}
          <TextField
            fullWidth
            label="Código de Producto"
            name="producto"
            value={newMovement.producto}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            name="cantidad"
            value={newMovement.cantidad}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            label="Detalle"
            name="detalle"
            multiline
            rows={3}
            value={newMovement.detalle}
            onChange={handleInputChange}
          />
          
          <Button
            variant="contained"
            onClick={handleCreateMovement}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear Movimiento'}
          </Button>
        </Box>
      </Paper>

      {/* Tabla de movimientos */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={movements}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          getRowId={(row) => row.id}
        />
      </Paper>
    </Container>
  );
}

export default MovementsPage;