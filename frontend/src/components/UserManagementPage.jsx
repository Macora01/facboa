import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Importamos componentes de MUI y DataGrid
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    IconButton,
    GridActionsCellItem,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

// Opciones para el campo de perfil
const PERFIL_OPCIONES = [
  { value: 'visita', label: 'Visita' },
    { value: 'opera', label: 'Operador' },
    { value: 'admin', label: 'Administrador' },
];

function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Estado para el formulario de creación/edición
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        perfil: 'visita',
        is_active: true,
    });

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/usuarios/');
            // El ViewSet de DRF a veces devuelve los datos en `results`.
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error("Error al cargar usuarios", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                perfil: user.perfil,
                is_active: user.is_active,
                password: '', // No mostramos la contraseña actual
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                perfil: 'visita',
                is_active: true,
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingUser(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- ESTA ES LA FUNCIÓN CLAVE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingUser) {
                response = await axios.put(`http://127.0.0.1:8000/api/usuarios/${editingUser.id}/`, formData);
            } else {
                response = await axios.post('http://127.0.0.1:8000/api/usuarios/', formData);
            }
            fetchUsers(); // Recargar la lista de usuarios
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            // Aquí podrías mostrar un mensaje de error al usuario.
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/usuarios/${id}/`);
                fetchUsers(); // Recargar la lista
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
            }
        }
    };

    // Columnas para la DataGrid
    const columns = [
        { field: 'username', headerName: 'Usuario', minWidth: 150, flex: 1 },
        { field: 'email', headerName: 'Email', minWidth: 200, flex: 1.5 },
        {
            field: 'perfil',
            headerName: 'Perfil',
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                params.value.charAt(0).toUpperCase() + params.value.slice(1)
            ),
        },
        { field: 'is_active', headerName: 'Activo', minWidth: 100, flex: 0.5, type: 'boolean' },
        {
            field: 'actions',
            headerName: 'Acciones',
            minWidth: 150,
            type: 'actions',
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Eliminar"
                    onClick={() => handleDelete(params.row.id)}
                />,
            ],
        },
    ];

    if (!user || user.perfil !== 'admin') {
        return <Typography>No tienes permisos para ver esta página.</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Gestión de Usuarios
            </Typography>
            <Paper sx={{ height: 600, width: '100%' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ m: 2 }}
                >
                    Crear Nuevo Usuario
                </Button>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={25}
                    rowsPerPageOptions={[25, 50, 100]}
                    components={{ Toolbar: GridToolbar }}
                    loading={loading}
                />
                {users.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={() => handleExportCSV()}>
                            Exportar a CSV
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Diálogo para Crear/Editar Usuario */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="username"
                            name="username"
                            label="Nombre de Usuario"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={formData.username}
                            onChange={handleFormChange}
                            required
                            disabled={!!editingUser} // No se puede editar el username
                        />
                        <TextField
                            margin="dense"
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            variant="standard"
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                        <TextField
                            margin="dense"
                            id="password"
                            name="password"
                            label="Contraseña"
                            type="password"
                            fullWidth
                            variant="standard"
                            value={formData.password}
                            onChange={handleFormChange}
                            helperText={editingUser ? "Deja en blanco para mantener la contraseña actual." : ""}
                        />
                        <FormControl fullWidth variant="standard" sx={{ mt: 2 }}>
                            <InputLabel id="perfil-label">Perfil</InputLabel>
                            <Select
                                labelId="perfil-label"
                                id="perfil"
                                name="perfil"
                                value={formData.perfil}
                                onChange={handleFormChange}
                                label="Perfil"
                            >
                                {PERFIL_OPCIONES.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button type="submit">{editingUser ? 'Actualizar' : 'Crear'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default UserManagementPage;