import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importamos el contexto

// Importamos los componentes de página
import AppBar from './components/AppBar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ReportsPage from './components/ReportsPage';
import Login from './components/Login';
import theme from './theme/theme';
import './App.css';

// Componente para proteger rutas
// Si el usuario no está logueado, lo redirige a la página de login
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
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
                      <Route path="/productos" element={<ProductList />} />
                      <Route path="/producto/:cod_venta" element={<ProductDetail />} />
                      <Route path="/reportes" element={<ReportsPage />} />
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