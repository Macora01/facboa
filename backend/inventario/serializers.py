from rest_framework import serializers
from .models import Producto, Ubicacion

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['cod_venta', 'id_fabrica', 'descripcion', 'precio', 'costo']

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
        fields = ('id','fecha_hora', 'producto', 'tipo_display', 'cantidad', 'usuario', 'ubicacion_origen', 'ubicacion_destino', 'detalle')
        # Ordena los resultados por fecha, del más reciente al más antiguo
        read_only_fields = ('fecha_hora',)
        
# ... (código anterior) ...
from django.contrib.auth.hashers import make_password # Importamos para encriptar contraseñas

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo de Usuario personalizado.
    Maneja la creación y actualización de usuarios de forma segura.
    """
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'email', 'perfil', 'password', 'is_active')
        extra_kwargs = {
            'password': {'write_only': True} # La contraseña solo se escribe, no se lee
        }

    def create(self, validated_data):
        # Encriptamos la contraseña antes de crear el usuario
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        # Encriptamos la contraseña si se está actualizando
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance