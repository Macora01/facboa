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

]