import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetail() {
  const { cod_venta } = useParams(); // Obtiene el código de la URL
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrazabilidad = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/trazabilidad/${cod_venta}/`);
        setTrazabilidad(response.data);
      } catch (err) {
        setError(`No se encontró la trazabilidad para el producto ${cod_venta}.`);
        console.error(err);
      }
    };

    fetchTrazabilidad();
  }, [cod_venta]);

  return (
    <div>
      <h2>Trazabilidad del Producto: {cod_venta}</h2>
      <Link to="/">Volver a la lista</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {trazabilidad.map(movimiento => (
          <li key={movimiento.fecha_hora}>
            <strong>{movimiento.fecha_hora}</strong> - {movimiento.tipo_display} ({movimiento.cantidad} unds)
            <br />
            <em>Detalle: {movimiento.detalle || 'N/A'}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductDetail;