from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


# Creamos un router y registramos nuestro ViewSet de usuarios
router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

# Las URLs de la API ahora incluyen las rutas generadas por el router
urlpatterns = [
    # Rutas para los productos, ubicaciones, etc.
    path('productos/', views.ProductoListAPIView.as_view(), name='producto-list'),
    path('ubicaciones/', views.UbicacionListAPIView.as_view(), name='ubicacion-list'),
    path('carga-inicial-csv/', views.carga_inicial_csv, name='carga-inicial-csv'),
    path('transferencia-csv/', views.transferencia_csv, name='transferencia-csv'),
    path('ventas-diarias-csv/', views.ventas_diarias_csv, name='ventas-diarias-csv'),
    path('trazabilidad/<str:cod_venta>/', views.TrazabilidadProductoAPIView.as_view(), name='trazabilidad-producto'),
    path('dashboard-data/', views.dashboard_data, name='dashboard-data'),
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    path('reportes/', views.reportes_avanzados, name='reportes-avanzados'),

    # Incluimos las rutas del router (para los usuarios)
    path('', include(router.urls)),
]