import { client } from './client';
import {
  Producto,
  Categoria,
  Proveedor,
  MovimientoInventario,
  FiltrosProductos,
  FiltrosMovimientos,
  EstadoProducto,
  TipoProducto
} from '../interfaces/Producto';

// API de Productos
export const getProductos = async (
  tiendaId: string,
  filtros?: FiltrosProductos
): Promise<Producto[]> => {
  const params = { ...filtros, tienda_id: tiendaId };
  const { data } = await client.get('/productos', { params });
  return data;
};

export const getProductoById = async (id: string): Promise<Producto> => {
  const { data } = await client.get(`/productos/${id}`);
  return data;
};

export const getProductosByCategoriaId = async (
  categoriaId: string,
  filtros?: Omit<FiltrosProductos, 'categoria_id'>
): Promise<Producto[]> => {
  const params = { ...filtros, categoria_id: categoriaId };
  const { data } = await client.get('/productos/por-categoria', { params });
  return data;
};

export const getProductosByProveedorId = async (
  proveedorId: string,
  filtros?: Omit<FiltrosProductos, 'proveedor_id'>
): Promise<Producto[]> => {
  const params = { ...filtros, proveedor_id: proveedorId };
  const { data } = await client.get('/productos/por-proveedor', { params });
  return data;
};

export const getProductosDestacados = async (
  tiendaId: string,
  limite: number = 10
): Promise<Producto[]> => {
  const params = { tienda_id: tiendaId, limite, destacado: true };
  const { data } = await client.get('/productos/destacados', { params });
  return data;
};

export const getProductosBajoStock = async (
  tiendaId: string
): Promise<Producto[]> => {
  const params = { tienda_id: tiendaId, stock_bajo: true };
  const { data } = await client.get('/productos/bajo-stock', { params });
  return data;
};

export const createProducto = async (producto: Partial<Producto>): Promise<Producto> => {
  const { data } = await client.post('/productos', producto);
  return data;
};

export const updateProducto = async (
  id: string,
  producto: Partial<Producto>
): Promise<Producto> => {
  const { data } = await client.put(`/productos/${id}`, producto);
  return data;
};

export const deleteProducto = async (id: string): Promise<void> => {
  await client.delete(`/productos/${id}`);
};

export const actualizarStock = async (
  id: string,
  cantidad: number,
  tipo: 'entrada' | 'salida' | 'ajuste',
  motivo: string
): Promise<Producto> => {
  const { data } = await client.post(`/productos/${id}/stock`, {
    cantidad,
    tipo,
    motivo
  });
  return data;
};

export const actualizarEstadoProducto = async (
  id: string,
  estado: EstadoProducto
): Promise<Producto> => {
  const { data } = await client.patch(`/productos/${id}/estado`, { estado });
  return data;
};

export const destacarProducto = async (
  id: string,
  destacado: boolean
): Promise<Producto> => {
  const { data } = await client.patch(`/productos/${id}/destacar`, { destacado });
  return data;
};

// API de Categorías
export const getCategorias = async (tiendaId: string): Promise<Categoria[]> => {
  const params = { tienda_id: tiendaId };
  const { data } = await client.get('/categorias', { params });
  return data;
};

export const getCategoriaById = async (id: string): Promise<Categoria> => {
  const { data } = await client.get(`/categorias/${id}`);
  return data;
};

export const createCategoria = async (categoria: Partial<Categoria>): Promise<Categoria> => {
  const { data } = await client.post('/categorias', categoria);
  return data;
};

export const updateCategoria = async (
  id: string,
  categoria: Partial<Categoria>
): Promise<Categoria> => {
  const { data } = await client.put(`/categorias/${id}`, categoria);
  return data;
};

export const deleteCategoria = async (id: string): Promise<void> => {
  await client.delete(`/categorias/${id}`);
};

// API de Proveedores
export const getProveedores = async (tiendaId: string): Promise<Proveedor[]> => {
  const params = { tienda_id: tiendaId };
  const { data } = await client.get('/proveedores', { params });
  return data;
};

export const getProveedorById = async (id: string): Promise<Proveedor> => {
  const { data } = await client.get(`/proveedores/${id}`);
  return data;
};

export const createProveedor = async (proveedor: Partial<Proveedor>): Promise<Proveedor> => {
  const { data } = await client.post('/proveedores', proveedor);
  return data;
};

export const updateProveedor = async (
  id: string,
  proveedor: Partial<Proveedor>
): Promise<Proveedor> => {
  const { data } = await client.put(`/proveedores/${id}`, proveedor);
  return data;
};

export const deleteProveedor = async (id: string): Promise<void> => {
  await client.delete(`/proveedores/${id}`);
};

// API de Movimientos de Inventario
export const getMovimientosInventario = async (
  tiendaId: string,
  filtros?: FiltrosMovimientos
): Promise<MovimientoInventario[]> => {
  const params = { ...filtros, tienda_id: tiendaId };
  const { data } = await client.get('/inventario/movimientos', { params });
  return data;
};

export const getMovimientoById = async (id: string): Promise<MovimientoInventario> => {
  const { data } = await client.get(`/inventario/movimientos/${id}`);
  return data;
};

export const getMovimientosByProductoId = async (
  productoId: string,
  filtros?: Omit<FiltrosMovimientos, 'producto_id'>
): Promise<MovimientoInventario[]> => {
  const params = { ...filtros, producto_id: productoId };
  const { data } = await client.get('/inventario/movimientos/por-producto', { params });
  return data;
};

export const registrarMovimiento = async (
  movimiento: Partial<MovimientoInventario>
): Promise<MovimientoInventario> => {
  const { data } = await client.post('/inventario/movimientos', movimiento);
  return data;
};

// API de Estadísticas de Inventario
export const getEstadisticasInventario = async (tiendaId: string): Promise<{
  total_productos: number;
  valor_inventario: number;
  productos_agotados: number;
  productos_bajo_stock: number;
  movimientos_recientes: number;
}> => {
  const params = { tienda_id: tiendaId };
  const { data } = await client.get('/inventario/estadisticas', { params });
  return data;
};

export const getValorInventario = async (
  tiendaId: string,
  filtros?: { categoria_id?: string; proveedor_id?: string }
): Promise<{
  valor_costo: number;
  valor_venta: number;
  margen_promedio: number;
}> => {
  const params = { tienda_id: tiendaId, ...filtros };
  const { data } = await client.get('/inventario/valor', { params });
  return data;
};

export const getProductosMasVendidos = async (
  tiendaId: string,
  limite: number = 10,
  periodo?: { fecha_inicio: string; fecha_fin: string }
): Promise<Array<Producto & { ventas: number; ingresos: number }>> => {
  const params = { tienda_id: tiendaId, limite, ...periodo };
  const { data } = await client.get('/inventario/mas-vendidos', { params });
  return data;
};

export const getProductosMenosVendidos = async (
  tiendaId: string,
  limite: number = 10,
  periodo?: { fecha_inicio: string; fecha_fin: string }
): Promise<Array<Producto & { ventas: number }>> => {
  const params = { tienda_id: tiendaId, limite, ...periodo };
  const { data } = await client.get('/inventario/menos-vendidos', { params });
  return data;
};
