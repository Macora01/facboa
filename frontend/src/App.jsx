import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importamos el contexto
import axios from 'axios';

// Importamos los componentes de página
import AppBar from './components/AppBar';
import Dashboard from './components/Dashboard';
import ProductSearchPage from './components/ProductSearchPage';
// import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ReportsPage from './components/ReportsPage';
import UserManagementPage from './components/UserManagementPage'; 
import Login from './components/Login';
import theme from './theme/theme';
import './App.css';
import { CircularProgress, Box } from '@mui/material';

// --- INICIO DE LA CONFIGURACIÓN DE AXIOS ---
// --- NUEVO BLOQUE DE CONFIGURACIÓN DE AXIOS ---
axios.defaults.withCredentials = true;

// Función para obtener el token CSRF de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Usamos un interceptor para obtener el token CSRF justo antes de cada petición
axios.interceptors.request.use(config => {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
    }
    return config;
}, error => {
    return Promise.reject(error);
});
// --- FIN DE LA CONFIGURACIÓN DE AXIOS ---


// Componente para proteger rutas (Versión Corregida)


// Si el usuario no está logueado, lo redirige a la página de login
// Componente para proteger rutas (Versión Corregida)
function PrivateRoute({ children }) {
  const { user, loading } = useAuth(); // <-- Ahora usamos 'loading' también

  // 1. Mientras se verifica la autenticación, muestra un spinner.
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh" // Ocupa toda la pantalla
      >
        <CircularProgress />
      </Box>
    );
  }

  // 2. Una vez que la verificación termina, si no hay usuario, redirige al login.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 3. Si hay usuario, muestra el contenido protegido.
  return children;
}
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            {/* Añadimos la AppBar aquí, fuera de las rutas para que siempre sea visible */}
            <AppBar />
            <Routes>
              {/* Ruta pública para el login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas, envueltas en PrivateRoute */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/productos" element={<ProductSearchPage />} />
                      <Route path="/producto/:cod_venta" element={<ProductDetail />} />
                      <Route path="/reportes" element={<ReportsPage />} />
                      <Route path="/user-management" element={<UserManagementPage />} />
                    </Routes>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;