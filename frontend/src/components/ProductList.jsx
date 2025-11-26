import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Importamos los componentes de Material-UI
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Box } from '@mui/material';
import { Link as MuiLink } from '@mui/material';

function ProductList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/productos/');
        setProductos(response.data);
      } catch (err) {
        setError('Error al conectar con el servidor de la API.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Lista de Productos
      </Typography>

      {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
      
      {error && <Typography color="error">{error}</Typography>}
      
      {!loading && !error && (
        <List>
          {productos.map(producto => (
            <ListItem key={producto.cod_venta} divider>
              <MuiLink
                component={Link}
                to={`/producto/${producto.cod_venta}`}
                underline="hover"
                sx={{ fontWeight: 'medium' }}
              >
                {producto.cod_venta} - {producto.descripcion}
              </MuiLink>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}

export default ProductList;