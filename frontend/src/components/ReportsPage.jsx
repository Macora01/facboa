import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Importamos componentes de MUI y DataGrid
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Opciones para el campo de tipo de movimiento (deben coincidir con el backend)
const TIPO_MOVIMIENTO_OPCIONES = [
  { value: 'entrada_compra', label: 'Entrada por Compra' },
  { value: 'transferencia_entrada', label: 'Entrada por Transferencia' },
  { value: 'transferencia_salida', label: 'Salida por Transferencia' },
  { value: 'venta', label: 'Venta' },
  { value: 'ajuste', label: 'Ajuste Manual' },
  { value: 'merma', label: 'Merma' },
];

function ReportsPage() {
  const { user } = useAuth();
  const [reportesData, setReportesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  // Estado para los filtros del formulario
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    productoId: '',
    tipoMovimiento: '',
    ubicacionId: '',
  });

  // Cargar datos para los autocompletados al montar el componente
  useEffect(() => {
    const fetchAuxData = async () => {
      const [productosRes, ubicacionesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/productos/'),
        axios.get('http://127.0.0.1:8000/api/ubicaciones/'),
      ]);
      setProductos(productosRes.data);
      setUbicaciones(ubicacionesRes.data);
    };
    fetchAuxData();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleFilterChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  // Función para generar el reporte
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
      if (filtros.productoId) params.append('producto_id', filtros.productoId);
      if (filtros.tipoMovimiento) params.append('tipo_movimiento', filtros.tipoMovimiento);
      if (filtros.ubicacionId) params.append('ubicacion_id', filtros.ubicacionId);

      const response = await axios.get(`http://127.0.0.1:8000/api/reportes/?${params.toString()}`);
      setReportesData(response.data);
    } catch (error) {
      console.error("Error al generar el reporte", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };
  
  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ['Fecha Hora', 'Producto Código', 'Producto Descripción', 'Tipo', 'Cantidad', 'Usuario', 'Origen', 'Destino', 'Detalle'];
    const csvRows = reportesData.map(row => [
      row.fecha_hora,
      row.producto_cod,
      row.producto_desc,
      row.tipo_display,
      row.cantidad,
      row.usuario,
      row.origen,
      row.destino,
      row.detalle,
    ]);

    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_facboa.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columnas para la DataGrid
  const columns = [
      { 
    field: 'fecha_hora', 
    headerName: 'Fecha y Hora', 
    minWidth: 180, // Usamos minWidth y flex en lugar de 'width'
    flex: 1
  },
  { 
    field: 'producto_cod', 
    headerName: 'Código Producto', 
    minWidth: 130,
    flex: 1
  },
  { 
    field: 'producto_desc', 
    headerName: 'Descripción', 
    minWidth: 300,
    flex: 2
  },
  { 
    field: 'tipo_display', 
    headerName: 'Tipo Movimiento', 
    minWidth: 200,
    flex: 1
  },
  { 
    field: 'cantidad', 
    headerName: 'Cantidad', 
    minWidth: 100,
    flex: 0.5
  },
  { 
    field: 'usuario', 
    headerName: 'Usuario', 
    minWidth: 150,
    flex: 1
  },
  { 
    field: 'origen', 
    headerName: 'Origen', 
    minWidth: 150,
    flex: 1
  },
  { 
    field: 'destino', 
    headerName: 'Destino', 
    minWidth: 150,
    flex: 1
  },
  ];

  if (!user) {
    return <Typography>Por favor, inicie sesión para ver los reportes.</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Reportes Avanzados
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros del Reporte
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Movimiento</InputLabel>
              <Select
                name="tipoMovimiento"
                value={filtros.tipoMovimiento}
                label="Tipo de Movimiento"
                onChange={handleFilterChange}
              >
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {TIPO_MOVIMIENTO_OPCIONES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={loading}
              fullWidth
              sx={{ height: '56px' }} // Para que coincida con la altura de los TextField
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generar Reporte'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={reportesData}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>
      
      {reportesData.length > 0 && (
         <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleExportCSV}>
              Exportar a CSV
            </Button>
         </Box>
      )}

    </Container>
  );
}

export default ReportsPage;