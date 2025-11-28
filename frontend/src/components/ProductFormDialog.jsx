// frontend/src/components/ProductFormDialog.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

function ProductFormDialog({ open, onClose, productToEdit, onSave }) {
  const [formData, setFormData] = useState({
    cod_venta: '',
    id_fabrica: '',
    descripcion: '',
    precio: '',
    costo: '',
  });

  // Si se pasa un producto para editar, rellenamos el formulario con sus datos
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      // Si no, limpiamos el formulario para crear uno nuevo
      setFormData({
        cod_venta: '',
        id_fabrica: '',
        descripcion: '',
        precio: '',
        costo: '',
      });
    }
  }, [productToEdit, open]); // Se ejecuta cuando cambia el producto o se abre/cierra el diálogo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Aquí podrías añadir validación antes de guardar
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{productToEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            name="cod_venta"
            label="Código de Venta"
            fullWidth
            variant="outlined"
            value={formData.cod_venta}
            onChange={handleChange}
            disabled={!!productToEdit} // El código de venta no se debe editar
          />
          <TextField
            margin="dense"
            name="id_fabrica"
            label="Código de Fábrica"
            fullWidth
            variant="outlined"
            value={formData.id_fabrica}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.descripcion}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="precio"
            label="Precio"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.precio}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="costo"
            label="Costo"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.costo}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductFormDialog;