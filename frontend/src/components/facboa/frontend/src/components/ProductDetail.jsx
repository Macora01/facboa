import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Importamos componentes de Material-UI
import { 
  Container, 
  Typography, 
  Breadcrumbs, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { Link as MuiLink } from '@mui/material';

function ProductDetail() {
  const { cod_venta } = useParams();
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrazabilidad = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/trazabilidad/${cod_venta}/`);
        setTrazabilidad(response.data);
      } catch (err) {
        setError(`No se encontró la trazabilidad para el producto ${cod_venta}.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrazabilidad();
  }, [cod_venta]);

  return (
    <Container maxWidth="lg">
      {/* Migas de pan para la navegación */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2 }}>
        <MuiLink component={Link} to="/" underline="hover">
          FacBoa
        </MuiLink>
        <Typography color="text.primary">Trazabilidad</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Trazabilidad del Producto: {cod_venta}
      </Typography>

      {loading && <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>}
      
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Tipo de Movimiento</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell>Origen / Destino</TableCell>
                <TableCell>Usuario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trazabilidad.map((movimiento, index) => (
                <TableRow
                  key={movimiento.fecha_hora}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {new Date(movimiento.fecha_hora).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={movimiento.tipo_display} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{movimiento.cantidad}</TableCell>
                  <TableCell>
                    {movimiento.ubicacion_origen || movimiento.ubicacion_destino || 'N/A'}
                  </TableCell>
                  <TableCell>{movimiento.usuario || 'Sistema'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default ProductDetail;