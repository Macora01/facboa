import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Container } from '@mui/material';

// Importamos las partes de Chart.js que necesitamos para todos los gráficos
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Registramos los componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard-data/');
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  // 1. Datos para el Gráfico de Líneas (Evolución de Ventas)
  const ventasData = {
    labels: dashboardData.ventas_mensuales.map(v => v.mes),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: dashboardData.ventas_mensuales.map(v => v.total),
        borderColor: 'rgb(109, 76, 65)',
        backgroundColor: 'rgba(109, 76, 65, 0.5)',
      },
    ],
  };

  // 2. Datos para el Gráfico de Torta (Distribución de Stock)
  const stockData = {
    labels: dashboardData.stock_por_ubicacion.map(s => s.ubicacion__nombre),
    datasets: [
      {
        label: 'Total Stock',
        data: dashboardData.stock_por_ubicacion.map(s => s.total_stock),
        backgroundColor: [
          'rgba(109, 76, 65, 0.8)',
          'rgba(161, 136, 127, 0.8)',
        ],
        borderColor: '#FAFAFA',
        borderWidth: 1,
      },
    ],
  };
  
  // 3. Datos para el Gráfico de Barras (Top 5 Vendidos)
  const topVendidosData = {
    labels: dashboardData.top_vendidos.map(p => p.producto__descripcion),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: dashboardData.top_vendidos.map(p => p.total_vendido),
        backgroundColor: 'rgba(93, 64, 55, 0.7)',
        borderColor: 'rgba(93, 64, 55, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Ejecutivo
      </Typography>
      <Grid container spacing={3}>
        {/* Gráfico de Líneas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Evolución de Ventas
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Line data={ventasData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        {/* Gráfico de Torta */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Distribución de Stock
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Pie data={stockData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        {/* Gráfico de Barras */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Top 5 Productos Más Vendidos
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Bar data={topVendidosData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;