// frontend/src/components/UserManagementSection.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Usamos el endpoint que ya funciona
        const response = await axios.get('http://127.0.0.1:8000/api/usuarios/');
        setUsers(response.data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { field: 'username', headerName: 'Usuario', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'perfil', headerName: 'Perfil', width: 150 },
    { field: 'is_active', headerName: 'Activo', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Acciones',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editar" />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Borrar" />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[25, 50, 100]}
        getRowId={(row) => row.id}
        loading={loading}
      />
    </Box>
  );
}

export default UserManagementSection;