// frontend/src/components/ProductSearchPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Box,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// <-- NUEVO: Importar el componente del diálogo
import ProductFormDialog from './ProductFormDialog';

function ProductSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // <-- NUEVO: Estados para manejar el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // ... (el useEffect de búsqueda se mantiene igual)
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.length > 1) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/productos/buscar/?q=${searchTerm}`);
      setResults(response.data.results);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // <-- NUEVO: Funciones actualizadas para manejar el diálogo
  const handleCreate = () => {
    setEditingProduct(null); // No hay producto que editar
    setDialogOpen(true);     // Abrimos el diálogo en modo "crear"
  };

  const handleEdit = (product) => {
    setEditingProduct(product); // Pasamos el producto a editar
    setDialogOpen(true);       // Abrimos el diálogo en modo "editar"
  };
  
  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        // Lógica para actualizar (PUT)
        await axios.put(`http://127.0.0.1:8000/api/productos-crud/${editingProduct.cod_venta}/`, productData);
      } else {
        // Lógica para crear (POST)
        await axios.post(`http://127.0.0.1:8000/api/productos-crud/`, productData);
      }
      setDialogOpen(false);
      // Opcional: volver a buscar para actualizar la lista
      handleSearch(); 
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/productos-crud/${productToDelete.cod_venta}/`);
        setDeleteDialogOpen(false);
        // Opcional: volver a buscar para actualizar la lista
        handleSearch();
      } catch (error) {
        console.error("Error al borrar el producto:", error);
      }
    }
  };

  const columns = [
    // ... (las columnas se mantienen igual)
    { field: 'cod_venta', headerName: 'Código Venta', width: 150 },
    { field: 'id_fabrica', headerName: 'Código Fábrica', width: 150 },
    { field: 'descripcion', headerName: 'Descripción', width: 400 },
    { field: 'precio', headerName: 'Precio', width: 120, type: 'number' },
    { field: 'costo', headerName: 'Costo', width: 120, type: 'number' },
    {
      field: 'actions',
      headerName: 'Acciones',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Borrar"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Productos
      </Typography>
      <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          sx={{ flexGrow: 1, mr: 2 }}
          label="Buscar por Código de Venta o Fábrica"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          helperText="Escribe al menos 2 caracteres para iniciar la búsqueda"
        />
        <Button variant="contained" onClick={handleCreate}>
          Crear Producto
        </Button>
      </Paper>

      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={results}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          getRowId={(row) => row.cod_venta}
          onRowClick={(params) => navigate(`/producto/${params.row.cod_venta}`)}
          sx={{ cursor: 'pointer' }}
        />
      </Paper>

      {/* <-- NUEVO: Diálogo para Crear/Editar */}
      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productToEdit={editingProduct}
        onSave={handleSave}
      />

      {/* <-- NUEVO: Diálogo de Confirmación para Borrar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Borrado</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres borrar el producto <strong>{productToDelete?.descripcion}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Borrar</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default ProductSearchPage;