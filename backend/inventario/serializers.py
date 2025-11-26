from rest_framework import serializers
from .models import Producto, Ubicacion

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__' # Expone todos los campos del modelo

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'
        
# ... (código anterior) ...

from rest_framework import serializers
from .models import Producto, Ubicacion, MovimientoInventario, Usuario # Asegúrate de importar todos los modelos

# ... (serializers anteriores) ...

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    """
    Serializador detallado para mostrar el historial de movimientos.
    """
    # Muestra la representación en texto (__str__) de los objetos relacionados
    producto = serializers.StringRelatedField(read_only=True)
    usuario = serializers.StringRelatedField(read_only=True)
    ubicacion_origen = serializers.StringRelatedField(read_only=True)
    ubicacion_destino = serializers.StringRelatedField(read_only=True)
    
    # Muestra la etiqueta legible del choice field (ej: "Venta" en vez de "venta")
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = ('fecha_hora', 'producto', 'tipo_display', 'cantidad', 'usuario', 'ubicacion_origen', 'ubicacion_destino', 'detalle')
        # Ordena los resultados por fecha, del más reciente al más antiguo
        read_only_fields = ('fecha_hora',)