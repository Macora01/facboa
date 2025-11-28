# backend/inventario/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# 1. Creamos un ÚNICO router
router = DefaultRouter()

# 2. Registramos TODOS los ViewSets en este único router
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')
router.register(r'productos-crud', views.ProductoViewSet)

# 3. Definimos las URLs de la aplicación
urlpatterns = [
    # Rutas para las APIs basadas en funciones (las que ya tenías)
    path('productos/', views.ProductoListAPIView.as_view(), name='producto-list'),
    path('productos/buscar/', views.ProductoBuscarView.as_view(), name='producto-buscar'),
    path('ubicaciones/', views.UbicacionListAPIView.as_view(), name='ubicacion-list'),
    path('carga-inicial-csv/', views.carga_inicial_csv, name='carga-inicial-csv'),
    path('transferencia-csv/', views.transferencia_csv, name='transferencia-csv'),
    path('ventas-diarias-csv/', views.ventas_diarias_csv, name='ventas-diarias-csv'),
    path('trazabilidad/<str:cod_venta>/', views.TrazabilidadProductoAPIView.as_view(), name='trazabilidad-producto'),
    path('dashboard-data/', views.dashboard_data, name='dashboard-data'),
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    path('reportes/', views.reportes_avanzados, name='reportes-avanzados'),

    # 4. Incluimos las URLs del router UNA SOLA VEZ
    path('', include(router.urls)),
]