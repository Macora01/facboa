from django.urls import path
from . import views

urlpatterns = [
    # Asegúrate de que 'ProductoListAPIView' esté escrito igual que en views.py
    path('productos/', views.ProductoListAPIView.as_view(), name='producto-list'), 
    
    # Asegúrate de que 'UbicacionListAPIView' esté escrito igual que en views.py
    path('ubicaciones/', views.UbicacionListAPIView.as_view(), name='ubicacion-list'),
    
    # Nueva URL para la carga de CSV
    path('carga-inicial-csv/', views.carga_inicial_csv, name='carga-inicial-csv'),
    
    # Nueva URL para las transferencias
    path('transferencia-csv/', views.transferencia_csv, name='transferencia-csv'),
    
    # Nueva URL para las ventas diarias
    path('ventas-diarias-csv/', views.ventas_diarias_csv, name='ventas-diarias-csv'),
    
    # Nueva URL para la trazabilidad, captura el código del producto
    path('trazabilidad/<str:cod_venta>/', views.TrazabilidadProductoAPIView.as_view(), name='trazabilidad-producto'),

    # Nueva URL para los datos del dashboard
    path('dashboard-data/', views.dashboard_data, name='dashboard-data'),
    
    # Nuevas URLs para autenticación
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    
    # Nueva URL para los reportes avanzados
    path('reportes/', views.reportes_avanzados, name='reportes-avanzados'),
]