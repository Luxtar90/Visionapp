// src/types/puntos.types.ts

// Tipos de puntos (corresponde a TipoPunto en el backend)
export enum TipoPunto {
  PRODUCTO = 'PRODUCTO',
  SERVICIO = 'SERVICIO',
  CANJE = 'CANJE',
  OTRO = 'OTRO',
}

// Interfaz para un punto individual (historial)
export interface Punto {
  id: number;
  clienteId: number;
  tiendaId: number;
  cantidad: number;
  motivo: string;
  fecha: string;
  referencia?: string;
  tipo: TipoPunto;
  cliente?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  tienda?: {
    id: number;
    nombre: string;
  };
}

// Interfaz para los puntos por tienda
export interface PuntosPorTienda {
  clienteId: number;
  tiendaId: number;
  puntosDisponibles: number;
  tienda?: {
    id: number;
    nombre: string;
  };
}

// Interfaz para el resumen de puntos por tienda
export interface ResumenPuntosTienda {
  tiendaId: number;
  tiendaNombre: string;
  puntosDisponibles: number;
  totalGanados: number;
  totalCanjeados: number;
}

// Interfaz para el resumen de puntos de un cliente
export interface ResumenPuntosCliente {
  clienteId: number;
  nombreCliente: string;
  puntosAcumulados: number;
  totalTiendas: number;
  totalPuntosDisponibles: number;
  puntosPorTienda: ResumenPuntosTienda[];
}

// Interfaz para el resumen de puntos de un cliente en una tienda específica
export interface ResumenPuntosClienteTienda {
  disponibles: number;
  total: number;
  canjeados: number;
  tienda: {
    id: number;
    nombre: string;
  } | null;
}

// Interfaz para registrar puntos por producto
export interface RegistrarPuntosProductoParams {
  clienteId: number;
  tiendaId: number;
  ventaId: number;
  precioTotal: number;
  puntosPersonalizados?: number;
}

// Interfaz para registrar puntos por servicio
export interface RegistrarPuntosServicioParams {
  clienteId: number;
  tiendaId: number;
  reservaId: number;
  precioServicio: number;
  nombreServicio?: string;
  puntosPersonalizados?: number;
}

// Interfaz para canjear puntos
export interface CanjearPuntosParams {
  clienteId: number;
  tiendaId: number;
  cantidad: number;
  motivo: string;
  fecha: string;
}

// Respuesta al registrar puntos
export interface RegistrarPuntosResponse {
  puntos: number;
  mensaje: string;
  resultado: Punto;
}
