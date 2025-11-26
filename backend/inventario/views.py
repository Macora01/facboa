from rest_framework import generics
from .models import Producto, Ubicacion, Stock, MovimientoInventario
from .serializers import ProductoSerializer, UbicacionSerializer

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

   

