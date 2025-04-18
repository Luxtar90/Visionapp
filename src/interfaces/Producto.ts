// src/interfaces/Producto.ts

export type EstadoProducto = 'activo' | 'inactivo' | 'agotado';
export type TipoProducto = 'producto' | 'servicio';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  tienda_id: string;
  activa: boolean;
  productos_count?: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion?: string;
  tienda_id: string;
  activo: boolean;
  productos_count?: number;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_compra?: number;
  stock: number;
  stock_minimo: number;
  tipo: TipoProducto;
  estado: EstadoProducto;
  categoria_id: string;
  categoria?: Categoria;
  proveedor_id?: string;
  proveedor?: Proveedor;
  tienda_id: string;
  imagen_url?: string;
  imagenes?: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
  unidad_medida?: string;
  ubicacion?: string;
  codigo_barras?: string;
  impuesto?: number;
  destacado: boolean;
  ventas_count?: number;
}

export interface MovimientoInventario {
  id: string;
  producto_id: string;
  producto?: Producto;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  fecha: string;
  motivo: string;
  usuario_id: string;
  usuario_nombre?: string;
  documento_referencia?: string;
  tienda_id: string;
  costo_unitario?: number;
  costo_total?: number;
}

export interface FiltrosProductos {
  busqueda?: string;
  categoria_id?: string;
  proveedor_id?: string;
  estado?: EstadoProducto;
  tipo?: TipoProducto;
  stock_bajo?: boolean;
  destacado?: boolean;
  ordenar_por?: 'nombre' | 'precio' | 'stock' | 'ventas' | 'fecha_creacion';
  orden?: 'asc' | 'desc';
}

export interface FiltrosMovimientos {
  producto_id?: string;
  tipo?: 'entrada' | 'salida' | 'ajuste';
  fecha_inicio?: string;
  fecha_fin?: string;
  usuario_id?: string;
  busqueda?: string;
}
