import { createTheme } from '@mui/material/styles';

// Paleta de colores tierra/marrón refinada y elegante
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6D4C41', // Marrón tierra, más suave y moderno
      light: '#A1887F', // Un tono claro y cálido
      dark: '#4E342E', // Un marrón más oscuro para contrastes
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#BCAAA4', // Un color arena claro, muy elegante
    },
    background: {
      default: '#FAFAFA', // Un gris muy, muy claro, casi blanco, para un look limpio
      paper: '#FFFFFF', // Tarjetas blancas para resaltar contenido
    },
    text: {
      primary: '#3E2723', // Texto principal en un marrón oscuro y legible
      secondary: '#5D4037', // Texto secundario
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      color: '#3E2723', // Títulos en marrón oscuro
      fontWeight: 500, // Un poco más delgado para un look minimalista
    },
    h2: {
      color: '#4E342E', // Subtítulos con un tono ligeramente diferente
      fontWeight: 500,
    },
  },
  components: {
    // Personalizamos los botones para que se vean modernos
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Evita que el texto sea todo mayúsculas
          borderRadius: 8, // Bordes más redondeados
        },
      },
    },
  },
});

export default theme;
