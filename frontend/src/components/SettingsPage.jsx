// frontend/src/components/SettingsPage.jsx

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importamos los componentes que ya tenemos o crearemos
import CsvUploadSection from './CsvUploadSection'; // El que ya hicimos
import UserManagementSection from './UserManagementSection'; // Lo crearemos a continuación

function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/limpiar-base-de-datos/');
      alert('Base de datos limpiada exitosamente.');
      handleCloseDeleteDialog();
      // Opcional: Redirigir al dashboard o recargar datos
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al limpiar la base de datos:', error);
      alert('Ocurrió un error al limpiar la base de datos.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Configuración
      </Typography>

      <Paper sx={{ width: '100%', typography: 'body1' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Configuración Tabs"
          centered
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Usuarios" />
          <Tab label="Cargas (CSV)" />
          <Tab label="Mantenimiento" />
        </Tabs>

        {/* Panel de Usuarios */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography>
              Aquí podrás crear, editar y eliminar los usuarios del sistema.
            </Typography>
            {/* El componente de gestión de usuarios irá aquí */}
            <UserManagementSection />
          </Box>
        </TabPanel>

        {/* Panel de Cargas CSV */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <CsvUploadSection />
          </Box>
        </TabPanel>

        {/* Panel de Mantenimiento */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mantenimiento de Base de Datos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Las siguientes acciones son permanentes e irreversibles. Por favor, proceda con extremo cuidado.
            </Typography>
            
            <Button variant="outlined" color="error" onClick={handleOpenDeleteDialog}>
              Limpiar Toda la Base de Datos
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Esto eliminará todos los movimientos y reiniciará el stock a cero.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Diálogo de Confirmación para Borrar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Limpieza Total
        </DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            ¿Estás absolutamente seguro? Esta acción eliminará permanentemente todos los movimientos de inventario y restablecerá el stock de todos los productos a cero. Esta operación no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Confirmar y Limpiar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Componente auxiliar para los paneles de las pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default SettingsPage;