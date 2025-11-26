from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Ubicacion, Producto, Stock, MovimientoInventario

# --- Paso 1: Registrar nuestro modelo de usuario personalizado ---
# Ya no necesitamos desregistrar el User por defecto.

# Desregistrar el User por defecto y registrar nuestro Usuario
from django.contrib.auth.models import User
# ... (importaciones) ...

# Desregistrar el User por defecto de forma segura
try:
    from django.contrib.auth.models import User
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    # Si el modelo User no estaba registrado, no hacemos nada.
    pass

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    # Campos que se muestran en la lista de usuarios
    list_display = ('username', 'email', 'perfil', 'is_staff', 'is_active')
    # Filtros que aparecen en la barra lateral
    list_filter = ('perfil', 'is_staff', 'is_superuser')
    # Campos por los que se puede buscar
    search_fields = ('username', 'email')

    # --- ESTA ES LA PARTE CLAVE ---
    # Agrupación de campos para el formulario de edición y creación
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Información Personal', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Permisos y Perfil', {
            'fields': ('perfil', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )
    # El campo 'password' se manejará automáticamente para la creación
    add_fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Información Personal', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Permisos y Perfil', {
            'fields': ('perfil', 'is_active', 'is_staff', 'is_superuser')
        }),
    )

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