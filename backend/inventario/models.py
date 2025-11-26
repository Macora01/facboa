from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class Usuario(AbstractUser):
    """
    Modelo de usuario personalizado.
    Hereda de AbstractUser de Django para añadir campos adicionales.
    """
    PERFIL_VISITA = 'visita'
    PERFIL_OPERA = 'opera'
    PERFIL_ADMIN = 'admin'
    PERFIL_CHOICES = [
        (PERFIL_VISITA, 'Visita'),
        (PERFIL_OPERA, 'Operador'),
        (PERFIL_ADMIN, 'Administrador'),
    ]
    perfil = models.CharField(
        max_length=10, 
        choices=PERFIL_CHOICES, 
        default=PERFIL_VISITA
    )

    # Añade estas líneas para solucionar el problema de grupos/permisos
    groups = models.ManyToManyField(
        'auth.Group', 
        verbose_name='groups', 
        blank=True, 
        help_text='The groups this user belongs to.', 
        related_name="usuario_set", 
        related_query_name="usuario",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', 
        verbose_name='user permissions', 
        blank=True, 
        help_text='Specific permissions for this user.', 
        related_name="usuario_permissions_set", 
        related_query_name="usuario_permission",
    )

    def __str__(self):
        return self.username
    
class Ubicacion(models.Model):
    """
    Representa una ubicación física o lógica en el sistema.
    """
    TIPO_BODEGA_PRINCIPAL = 'bodega_principal'
    TIPO_PUNTO_FIJO = 'punto_fijo'
    TIPO_PUNTO_TEMPORAL = 'punto_temporal'
    TIPO_PUNTO_INDIRECTO = 'punto_indirecto'
    TIPO_CANAL_WEB = 'canal_web'
    
    TIPO_CHOICES = [
        (TIPO_BODEGA_PRINCIPAL, 'Bodega Principal'),
        (TIPO_PUNTO_FIJO, 'Punto Fijo'),
        (TIPO_PUNTO_TEMPORAL, 'Punto Temporal'),
        (TIPO_PUNTO_INDIRECTO, 'Punto Indirecto'),
        (TIPO_CANAL_WEB, 'Canal Web'),
    ]
    
    nombre = models.CharField(max_length=100, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

class Producto(models.Model):
    """
    Representa un producto único en el inventario.
    El 'cod_venta' es la clave primaria global.
    """
    cod_venta = models.CharField(max_length=8, primary_key=True, verbose_name="Código de Venta")
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    id_fabrica = models.CharField(max_length=50, verbose_name="ID Fábrica")
    stock_minimo = models.PositiveIntegerField(default=0)
    stock_critico = models.PositiveIntegerField(default=0)
    stock_maximo = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.cod_venta} - {self.descripcion}"

class Stock(models.Model):
    """
    Representa la cantidad de un producto en una ubicación específica.
    """
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=0)

    class Meta:
        # Asegura que no haya registros duplicados del mismo producto en la misma ubicación
        unique_together = ('producto', 'ubicacion')

    def __str__(self):
        return f"{self.cantidad} de {self.producto.cod_venta} en {self.ubicacion.nombre}"

class MovimientoInventario(models.Model):
    """
    Registra cualquier movimiento de entrada o salida de stock.
    """
    TIPO_ENTRADA_COMPRA = 'entrada_compra'
    TIPO_TRANSFERENCIA_ENTRADA = 'transferencia_entrada'
    TIPO_TRANSFERENCIA_SALIDA = 'transferencia_salida'
    TIPO_VENTA = 'venta'
    TIPO_AJUSTE = 'ajuste'
    TIPO_MERMA = 'merma'
    
    TIPO_CHOICES = [
        (TIPO_ENTRADA_COMPRA, 'Entrada por Compra'),
        (TIPO_TRANSFERENCIA_ENTRADA, 'Entrada por Transferencia'),
        (TIPO_TRANSFERENCIA_SALIDA, 'Salida por Transferencia'),
        (TIPO_VENTA, 'Venta'),
        (TIPO_AJUSTE, 'Ajuste Manual'),
        (TIPO_MERMA, 'Merma'),
    ]
    
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=25, choices=TIPO_CHOICES)
    cantidad = models.IntegerField(help_text="Usar números positivos. El sistema lo interpretará según el tipo de movimiento.")
    fecha_hora = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    ubicacion_origen = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_salida')
    ubicacion_destino = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_entrada')
    detalle = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.cantidad} de {self.producto.cod_venta} el {self.fecha_hora.strftime('%Y-%m-%d %H:%M')}"