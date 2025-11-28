// frontend/src/components/ProductDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';

function ProductDetail() {
  const { cod_venta } = useParams();
  
  // El estado ahora guardará el objeto completo de la respuesta, no solo el array de movimientos
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrazabilidad = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/trazabilidad/${cod_venta}/`);
        setData(response.data); // Guardamos el objeto completo
        setError(null);
      } catch (err) {
        setError(`No se encontró la trazabilidad para el producto ${cod_venta}.`);
        setData(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrazabilidad();
  }, [cod_venta]);

  // --- Estados de Renderizado ---

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
  }
  
  if (!data) {
    return <Container><Alert severity="warning" sx={{ mt: 4 }}>Producto no encontrado.</Alert></Container>;
  }

  // --- Renderizado Principal ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Migas de pan para la navegación */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/dashboard" underline="hover">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/productos" underline="hover">
          Productos
        </MuiLink>
        <Typography color="text.primary">Trazabilidad</Typography>
      </Breadcrumbs>

      {/* Tarjeta de Resumen del Producto */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trazabilidad del Producto
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {data.producto_cod_venta} - {data.producto_descripcion}
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Typography variant="body1"><strong>Stock Inicial:</strong> {data.stock_inicial} unds.</Typography>
          <Typography variant="body1"><strong>Stock Actual:</strong> {data.stock_actual} unds.</Typography>
        </Box>
      </Paper>

      {/* Tabla de Movimientos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell align="right">Stock Resultante</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.movimientos.length > 0 ? (
                data.movimientos.map((mov) => (
                  <TableRow key={mov.fecha_hora}>
                    <TableCell>{new Date(mov.fecha_hora).toLocaleString()}</TableCell>
                    <TableCell>{mov.tipo_display}</TableCell>
                    <TableCell>{mov.cantidad}</TableCell>
                    <TableCell>{mov.usuario || 'Sistema'}</TableCell>
                    <TableCell>{mov.ubicacion_origen || 'N/A'}</TableCell>
                    <TableCell>{mov.ubicacion_destino || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {mov.stock_resultante}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Este producto no tiene movimientos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default ProductDetail;