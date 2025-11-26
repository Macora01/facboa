from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Ubicacion, Producto, Stock, MovimientoInventario

# --- Paso 1: Registrar nuestro modelo de usuario personalizado ---
# Ya no necesitamos desregistrar el User por defecto.

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'perfil', 'is_staff')
    list_filter = ('perfil', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')

# --- Paso 2: Registrar los modelos de nuestro inventario ---

@admin.register(Ubicacion)
class UbicacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'activa')
    list_filter = ('tipo', 'activa')
    search_fields = ('nombre',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('cod_venta', 'descripcion', 'precio', 'costo', 'stock_critico')
    search_fields = ('cod_venta', 'descripcion', 'id_fabrica')

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('producto', 'ubicacion', 'cantidad')
    list_filter = ('ubicacion',)
    search_fields = ('producto__cod_venta', 'ubicacion__nombre')

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('fecha_hora', 'producto', 'tipo', 'cantidad', 'usuario')
    list_filter = ('tipo', 'fecha_hora')
    search_fields = ('producto__cod_venta', 'usuario__username')
    readonly_fields = ('fecha_hora',)