from rest_framework import generics
from .models import Producto, Ubicacion, Stock, MovimientoInventario
from .serializers import ProductoSerializer, UbicacionSerializer, MovimientoInventarioSerializer
from django.utils import timezone
from datetime import datetime
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework import viewsets, permissions

# Vista para listar todos los productos
class ProductoListAPIView(generics.ListAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

# Vista para listar todas las ubicaciones
class UbicacionListAPIView(generics.ListAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    
# ... (código de las vistas anteriores) ...

import pandas as pd
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction

@api_view(['POST'])
def carga_inicial_csv(request):
    """
    Endpoint para cargar el inventario inicial desde un archivo CSV.
    El archivo debe tener las columnas: id_venta, price, cost, id_fabrica, qty, description
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No se encontró ningún archivo en la petición.'}, status=status.HTTP_400_BAD_REQUEST)

    csv_file = request.FILES['file']

    if not csv_file.name.endswith('.csv'):
        return Response({'error': 'El archivo no es un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_csv(csv_file)
    except Exception as e:
        return Response({'error': f'Error al leer el archivo CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # Validar que las columnas obligatorias existan
    columnas_requeridas = {'id_venta', 'price', 'cost', 'id_fabrica', 'qty', 'description'}
    if not columnas_requeridas.issubset(df.columns):
        return Response({'error': f'Faltan columnas obligatorias. Se necesitan: {columnas_requeridas}'}, status=status.HTTP_400_BAD_REQUEST)

    # Obtener la ubicación de la Bodega Principal
    try:
        bodega_principal = Ubicacion.objects.get(tipo='bodega_principal')
    except Ubicacion.DoesNotExist:
        return Response({'error': 'No se ha definido una "Bodega Principal" en el sistema. Crea una primero.'}, status=status.HTTP_400_BAD_REQUEST)

    productos_creados = 0
    errores = []

    # Usamos una transacción para asegurar que si algo falla, no se guarde nada a medias
    with transaction.atomic():
        for index, row in df.iterrows():
            try:
                # Validar formato del id_venta (BI NNNN CC)
                if not isinstance(row['id_venta'], str) or len(row['id_venta']) != 8:
                    raise ValueError("El código de venta 'id_venta' debe tener 8 caracteres.")

                # Crear o actualizar el producto
                producto, created = Producto.objects.update_or_create(
                    cod_venta=row['id_venta'],
                    defaults={
                        'descripcion': row['description'],
                        'precio': row['price'],
                        'costo': row['cost'],
                        'id_fabrica': row['id_fabrica'],
                    }
                )

                # Crear o actualizar el stock en la bodega principal
                stock, created = Stock.objects.update_or_create(
                    producto=producto,
                    ubicacion=bodega_principal,
                    defaults={'cantidad': int(row['qty'])}
                )
                productos_creados += 1

            except Exception as e:
                errores.append(f'Error en fila {index + 2}: {str(e)}')

    return Response({
        'message': f'Carga completada. {productos_creados} productos procesados.',
        'errores': errores
    }, status=status.HTTP_200_OK)
    
 # ... (código anterior) ...

import os
from django.core.files.storage import default_storage

@api_view(['POST'])
def transferencia_csv(request):
    """
    Endpoint para procesar transferencias desde un archivo CSV.
    El nombre del archivo debe tener el formato: tras_bod_LUGAR_AAAAMMDD.csv
    El archivo debe tener las columnas: cod_venta, description, price, qty
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No se encontró ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    csv_file = request.FILES['file']
    filename = csv_file.name

    # Validar formato del nombre del archivo
    if not filename.startswith('tras_bod_') or not filename.endswith('.csv'):
        return Response({'error': 'El nombre del archivo debe tener el formato: tras_bod_LUGAR_AAAAMMDD.csv'}, status=status.HTTP_400_BAD_REQUEST)

    # Extraer el nombre del lugar del nombre del archivo
    try:
        # Buscar el último guion bajo para separar el nombre del lugar de la fecha
        last_underscore_index = filename.rfind('_')
        if last_underscore_index == -1:
            raise ValueError("Formato de nombre de archivo inválido.")

        # Extraer el nombre del lugar entre 'tras_bod_' y el último '_'
        lugar_nombre = filename[9:last_underscore_index]
        
        # --- LÍNEA DE DEPURACIÓN ---
        # Esto imprimirá en la consola del servidor el nombre que estamos buscando
        print(f"DEBUG: Buscando la ubicación con el nombre: '{lugar_nombre}'")
        
        # No necesitamos reemplazar nada, el nombre ya está listo
        ubicacion_destino = Ubicacion.objects.get(nombre=lugar_nombre, activa=True)
        
    except Ubicacion.DoesNotExist:
        # --- LÍNEA CORREGIDA ---
        # Usamos la variable correcta en el mensaje de error
        return Response({'error': f'La ubicación destino "{lugar_nombre}" no existe o no está activa.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Error al procesar el nombre del archivo: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_csv(csv_file)
    except Exception as e:
        return Response({'error': f'Error al leer el archivo CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    columnas_requeridas = {'cod_venta', 'price', 'qty', 'description'}
    if not columnas_requeridas.issubset(df.columns):
        return Response({'error': f'Faltan columnas obligatorias. Se necesitan: {columnas_requeridas}'}, status=status.HTTP_400_BAD_REQUEST)

    bodega_principal = Ubicacion.objects.get(tipo='bodega_principal')
    transferencias_ok = 0
    errores = []

    with transaction.atomic():
        for index, row in df.iterrows():
            try:
                producto = Producto.objects.get(cod_venta=row['cod_venta'])
                cantidad_transferir = int(row['qty'])

                # Obtener stock actual en bodega principal
                try:
                    stock_bodega = Stock.objects.get(producto=producto, ubicacion=bodega_principal)
                except Stock.DoesNotExist:
                    raise ValueError(f"El producto {producto.cod_venta} no tiene stock en la bodega principal.")

                if stock_bodega.cantidad < cantidad_transferir:
                    raise ValueError(f"Stock insuficiente en bodega. Se tiene {stock_bodega.cantidad}, se intenta transferir {cantidad_transferir}.")

                # Restar stock de la bodega principal
                stock_bodega.cantidad -= cantidad_transferir
                stock_bodega.save()

                # Sumar stock en el destino (o crearlo si no existe)
                stock_destino, created = Stock.objects.get_or_create(
                    producto=producto,
                    ubicacion=ubicacion_destino,
                    defaults={'cantidad': cantidad_transferir}
                )
                if not created:
                    stock_destino.cantidad += cantidad_transferir
                    stock_destino.save()

                # Registrar el movimiento
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo=MovimientoInventario.TIPO_TRANSFERENCIA_SALIDA,
                    cantidad=cantidad_transferir,
                    usuario=request.user if request.user.is_authenticated else None,
                    ubicacion_origen=bodega_principal,
                    ubicacion_destino=ubicacion_destino,
                    detalle=f"Transferencia masiva desde {bodega_principal.nombre}"
                )

                transferencias_ok += 1

            except Exception as e:
                errores.append(f'Error en fila {index + 2}: {str(e)}')

    return Response({
        'message': f'Transferencia completada. {transferencias_ok} productos movidos a "{ubicacion_destino.nombre}".',
        'errores': errores
    }, status=status.HTTP_200_OK)
    
    # ... (código anterior) ...

@api_view(['POST'])
def ventas_diarias_csv(request):
    """
    Endpoint para procesar ventas diarias desde un archivo CSV.
    El nombre del archivo debe tener el formato: LUGAR_AAAAMMDD.csv
    Cada línea del CSV representa una unidad vendida.
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No se encontró ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    csv_file = request.FILES['file']
    filename = csv_file.name

    # Validar formato del nombre del archivo (no tiene prefijo 'tras_bod_')
    if not filename.endswith('.csv'):
        return Response({'error': 'El nombre del archivo debe terminar en .csv'}, status=status.HTTP_400_BAD_REQUEST)

    # Extraer el nombre del lugar y la fecha del nombre del archivo
    try:
        last_underscore_index = filename.rfind('_')
        if last_underscore_index == -1:
            raise ValueError("Formato de nombre de archivo inválido.")

        lugar_nombre = filename[:last_underscore_index]
        # Reemplaza guiones bajos por espacios para buscar la ubicación
        lugar_nombre_formateado = lugar_nombre.replace('_', ' ')
        ubicacion_venta = Ubicacion.objects.get(nombre=lugar_nombre_formateado, activa=True)
    except Ubicacion.DoesNotExist:
        return Response({'error': f'La ubicación de venta "{lugar_nombre_formateado}" no existe o no está activa.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({'error': 'Error al procesar el nombre del archivo. Asegúrate de que tenga el formato LUGAR_AAAAMMDD.csv'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_csv(csv_file)
    except Exception as e:
        return Response({'error': f'Error al leer el archivo CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    columnas_requeridas = {'timestamp', 'lugar', 'id_fabrica', 'id_venta', 'description', 'price'}
    if not columnas_requeridas.issubset(df.columns):
        return Response({'error': f'Faltan columnas obligatorias. Se necesitan: {columnas_requeridas}'}, status=status.HTTP_400_BAD_REQUEST)

    ventas_ok = 0
    errores = []

    with transaction.atomic():
        for index, row in df.iterrows():
            try:
                producto = Producto.objects.get(cod_venta=row['id_venta'])

                # Obtener stock actual en el punto de venta
                try:
                    stock_pv = Stock.objects.get(producto=producto, ubicacion=ubicacion_venta)
                except Stock.DoesNotExist:
                    raise ValueError(f"El producto {producto.cod_venta} no tiene stock en el punto de venta '{ubicacion_venta.nombre}'.")

                if stock_pv.cantidad < 1:
                    raise ValueError(f"Stock insuficiente en '{ubicacion_venta.nombre}'. Stock actual: {stock_pv.cantidad}.")

                # Restar 1 del stock (cada línea es una unidad vendida)
                stock_pv.cantidad -= 1
                stock_pv.save()

                # Registrar el movimiento de venta
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo=MovimientoInventario.TIPO_VENTA,
                    cantidad=1, # Siempre es 1 por línea
                    usuario=request.user if request.user.is_authenticated else None,
                    ubicacion_origen=ubicacion_venta, # La venta es una "salida" del PV
                    detalle=f"Venta diaria registrada desde CSV."
                )

                ventas_ok += 1

            except Exception as e:
                errores.append(f'Error en fila {index + 2}: {str(e)}')

    return Response({
        'message': f'Ventas diarias procesadas. {ventas_ok} unidades vendidas en "{ubicacion_venta.nombre}".',
        'errores': errores
    }, status=status.HTTP_200_OK)


# ... (código anterior) ...

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q, F
from .models import MovimientoInventario, Producto, Stock
from .serializers import MovimientoInventarioSerializer

# ... (vistas anteriores) ...
# backend/inventario/views.py

# Asegúrate de tener estas importaciones en la parte superior del archivo
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q, F
from .models import MovimientoInventario, Producto, Stock
from .serializers import MovimientoInventarioSerializer # Tu serializador actual

class TrazabilidadProductoAPIView(generics.ListAPIView):
    """
    API View para obtener la trazabilidad completa (Kardex) de un producto.
    Calcula el stock inicial, el stock resultante por cada movimiento y el stock final.
    """
    serializer_class = MovimientoInventarioSerializer

    def get(self, request, *args, **kwargs):
        cod_venta = self.kwargs['cod_venta']

        try:
            producto = Producto.objects.get(cod_venta=cod_venta)
        except Producto.DoesNotExist:
            return Response({'error': f'Producto con código {cod_venta} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Obtener todos los movimientos del producto en orden CRONOLÓGICO
        movimientos = MovimientoInventario.objects.filter(producto=producto).order_by('fecha_hora')

        if not movimientos.exists():
            # Si no hay movimientos, solo devolvemos el stock actual
            stock_actual_total = Stock.objects.filter(producto=producto).aggregate(total=Sum('cantidad'))['total'] or 0
            return Response({
                'producto_cod_venta': producto.cod_venta,
                'producto_descripcion': producto.descripcion,
                'stock_inicial': stock_actual_total, # Si no hay movimientos, el stock inicial es el actual
                'stock_actual': stock_actual_total,
                'movimientos': [],
            }, status=status.HTTP_200_OK)

        # 2. Calcular el stock inicial ANTES del primer movimiento
        # Obtenemos el stock ACTUAL total
        stock_actual_total = Stock.objects.filter(producto=producto).aggregate(total=Sum('cantidad'))['total'] or 0
        
        # Calculamos el cambio neto de TODOS los movimientos
        cambio_neto_total = 0
        for mov in movimientos:
            if mov.tipo in ['venta', 'transferencia_salida', 'merma']:
                cambio_neto_total -= mov.cantidad
            elif mov.tipo in ['entrada_compra', 'transferencia_entrada', 'ajuste_positivo']:
                cambio_neto_total += mov.cantidad
        
        # El stock inicial es el stock actual menos todo el cambio que ha ocurrido
        stock_inicial = stock_actual_total - cambio_neto_total

        # 3. Construir la lista de trazabilidad (Kardex) con el stock corrido
        trazabilidad_data = []
        stock_corrido = stock_inicial

        for mov in movimientos:
            # Determinar el efecto del movimiento en el stock
            if mov.tipo in ['venta', 'transferencia_salida', 'merma']:
                efecto = -mov.cantidad
            elif mov.tipo in ['entrada_compra', 'transferencia_entrada', 'ajuste_positivo']:
                efecto = mov.cantidad
            else: # Ajustes negativos, devoluciones de venta, etc.
                efecto = -mov.cantidad
            
            stock_corrido += efecto

            # Serializar los datos del movimiento
            serializer = self.get_serializer(mov)
            movimiento_data = serializer.data
            
            # Añadir el stock calculado a los datos del movimiento
            movimiento_data['stock_resultante'] = stock_corrido
            
            trazabilidad_data.append(movimiento_data)
        
        # 4. Estructurar la respuesta final
        response_data = {
            'producto_cod_venta': producto.cod_venta,
            'producto_descripcion': producto.descripcion,
            'stock_inicial': stock_inicial, # <-- CAMBIO CLAVE
            'stock_actual': stock_actual_total,
            'movimientos': trazabilidad_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_data(request):
    """
    Endpoint para obtener los datos resumidos para el Dashboard Ejecutivo.
    """
    # 1. Evolución de Ventas Mensuales
    ventas_mensuales = MovimientoInventario.objects.filter(
        tipo=MovimientoInventario.TIPO_VENTA
    ).annotate(
        mes=TruncMonth('fecha_hora')
    ).values('mes').annotate(
        total_ventas=Sum('cantidad')
    ).order_by('mes')

    # 2. Top 5 Productos Más Vendidos
    top_vendidos = MovimientoInventario.objects.filter(
        tipo=MovimientoInventario.TIPO_VENTA
    ).values('producto__descripcion', 'producto__cod_venta').annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido')[:5]

    # 3. Distribución de Stock por Ubicación
    stock_por_ubicacion = Stock.objects.select_related('ubicacion').values(
        'ubicacion__nombre'
    ).annotate(
        total_stock=Sum('cantidad')
    ).order_by('-total_stock')

    data = {
        'ventas_mensuales': [
            {'mes': item['mes'].strftime('%Y-%m'), 'total': item['total_ventas']} for item in ventas_mensuales
        ],
        'top_vendidos': list(top_vendidos),
        'stock_por_ubicacion': list(stock_por_ubicacion),
    }

    return Response(data)

# ... (código anterior) ...

from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def api_login(request):
    """
    Endpoint para el inicio de sesión de usuarios.
    Espera 'username' y 'password' en el cuerpo de la petición.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Se requieren nombre de usuario y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        # Devolvemos información básica del usuario
        return Response({
            'message': 'Inicio de sesión exitoso.',
            'user': {
                'username': user.username,
                'email': user.email,
                'perfil': user.perfil,
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def api_logout(request):
    """
    Endpoint para cerrar la sesión del usuario.
    """
    logout(request)
    return Response({'message': 'Sesión cerrada exitosamente.'}, status=status.HTTP_200_OK)


# ... (código anterior) ...
from django.db.models import Q
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MovimientoInventario, Producto, Ubicacion

@api_view(['GET'])
def reportes_avanzados(request):
    """
    Endpoint para generar reportes avanzados con filtros dinámicos.
    Acepta parámetros de consulta (query params) para filtrar.
    """
    queryset = MovimientoInventario.objects.select_related('producto', 'usuario', 'ubicacion_origen', 'ubicacion_destino').all()

    # --- Filtros Dinámicos ---
    # Filtro por rango de fechas
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    if fecha_inicio:
        queryset = queryset.filter(fecha_hora__gte=fecha_inicio)
    if fecha_fin:
        queryset = queryset.filter(fecha_hora__lte=fecha_fin)

    # Filtro por producto (búsqueda parcial)
    producto_id = request.GET.get('producto_id')
    if producto_id:
        queryset = queryset.filter(producto__cod_venta__icontains=producto_id)

    # Filtro por tipo de movimiento
    tipo_movimiento = request.GET.get('tipo_movimiento')
    if tipo_movimiento:
        queryset = queryset.filter(tipo=tipo_movimiento)

    # Filtro por ubicación (origen o destino)
    ubicacion_id = request.GET.get('ubicacion_id')
    if ubicacion_id:
         queryset = queryset.filter(
            Q(ubicacion_origen__id=ubicacion_id) | Q(ubicacion_destino__id=ubicacion_id)
        )

    # Ordenar por fecha descendente
    queryset = queryset.order_by('-fecha_hora')

    # Serializar los resultados
    # Usamos un serializador simple para este reporte
    data = [
        {
            "fecha_hora": mov.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
            "producto_cod": mov.producto.cod_venta,
            "producto_desc": mov.producto.descripcion,
            "tipo_display": mov.get_tipo_display(),
            "cantidad": mov.cantidad,
            "usuario": mov.usuario.username if mov.usuario else 'Sistema',
            "origen": mov.ubicacion_origen.nombre if mov.ubicacion_origen else 'N/A',
            "destino": mov.ubicacion_destino.nombre if mov.ubicacion_destino else 'N/A',
            "detalle": mov.detalle,
        }
        for mov in queryset
    ]

    return Response(data)

@api_view(['GET'])
def reportes_avanzados(request):
    """
    Endpoint para generar reportes avanzados con filtros dinámicos.
    """
    print("--- INICIO DE REPORTE ---")
    print("Parámetros recibidos:", request.GET)

    """
    Endpoint para generar reportes avanzados con filtros dinámicos.
    """
    queryset = MovimientoInventario.objects.select_related('producto', 'usuario', 'ubicacion_origen', 'ubicacion_destino').all()

    # --- Filtros Dinámicos ---
    # Filtro por rango de fechas (CORREGIDO)
    fecha_inicio_str = request.GET.get('fecha_inicio')
    fecha_fin_str = request.GET.get('fecha_fin')

    if fecha_inicio_str:
        # Convertimos el string a un objeto de fecha aware (consciente de la zona horaria)
        fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
        queryset = queryset.filter(fecha_hora__date__gte=fecha_inicio)

    if fecha_fin_str:
        fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
        queryset = queryset.filter(fecha_hora__date__lte=fecha_fin)


    # Filtro por producto (búsqueda parcial)
    producto_id = request.GET.get('producto_id')
    if producto_id:
        queryset = queryset.filter(producto__cod_venta__icontains=producto_id)

    # Filtro por tipo de movimiento
    tipo_movimiento = request.GET.get('tipo_movimiento')
    print(f"Filtro de tipo recibido: {tipo_movimiento}")
    if tipo_movimiento:
        queryset = queryset.filter(tipo=tipo_movimiento)

    # Filtro por ubicación (origen o destino)
    ubicacion_id = request.GET.get('ubicacion_id')
    if ubicacion_id:
         queryset = queryset.filter(
            Q(ubicacion_origen__id=ubicacion_id) | Q(ubicacion_destino__id=ubicacion_id)
        )

    # Ordenar por fecha descendente
    queryset = queryset.order_by('-fecha_hora')
    
    print(f"Cantidad de resultados encontrados: {queryset.count()}")
    print("--- FIN DE REPORTE ---")

    # Serializar los resultados
    # Usamos un serializador simple para este reporte
    data = [
        {
            "id": mov.id,
            "fecha_hora": mov.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
            "producto_cod": mov.producto.cod_venta,
            "producto_desc": mov.producto.descripcion,
            "tipo_display": mov.get_tipo_display(),
            "cantidad": mov.cantidad,
            "usuario": mov.usuario.username if mov.usuario else 'Sistema',
            "origen": mov.ubicacion_origen.nombre if mov.ubicacion_origen else 'N/A',
            "destino": mov.ubicacion_destino.nombre if mov.ubicacion_destino else 'N/A',
            "detalle": mov.detalle,
        }
        for mov in queryset
    ]

    return Response(data)

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo de Usuario.
    Proporciona las operaciones CRUD (Create, Read, Update, Delete).
    """
    queryset = Usuario.objects.all().order_by('-date_joined') 
    serializer_class = UsuarioSerializer
    # Solo los usuarios administradores pueden acceder a este ViewSet.
    # permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

# backend/inventario/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Producto
from .serializers import ProductoSerializer # Asegúrate de tener este serializador

class ProductoBuscarView(APIView):
    """
    Endpoint para buscar productos por código de venta o código de fábrica.
    Acepta un query parameter 'q'.
    Ejemplo: /api/productos/buscar/?q=BI0001
    """
    def get(self, request, *args, **kwargs):
        query = request.GET.get('q', '')

        if len(query) < 2: # No buscar si la consulta es muy corta
            return Response({'results': []})

        # Buscar en cod_venta o id_fabrica, sin distinguir mayúsculas/minúsculas
        productos = Producto.objects.filter(
            Q(cod_venta__icontains=query) | Q(id_fabrica__icontains=query)
        )

        serializer = ProductoSerializer(productos, many=True)
        return Response({'results': serializer.data})
    
# backend/inventario/views.py
from rest_framework import viewsets, permissions
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo de Producto que proporciona acciones CRUD.
    """
    queryset = Producto.objects.all().order_by('cod_venta')
    serializer_class = ProductoSerializer
    # Puedes añadir permisos más tarde si es necesario
    permission_classes = [permissions.IsAuthenticated
    
 # backend/inventario/views.py


# backend/inventario/views.py

