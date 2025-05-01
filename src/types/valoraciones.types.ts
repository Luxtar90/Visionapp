// src/types/valoraciones.types.ts
export interface Valoracion {
  id?: number;
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  reservaId: number;
  valoracion: number;
  comentario: string;
  fecha: string;
}

export interface ValoracionDetallada extends Valoracion {
  clienteNombre: string;
  empleadoNombre?: string;
  servicioNombre: string;
  clienteImagen?: string;
}

export interface CreateValoracionDto {
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  reservaId: number;
  valoracion: number;
  comentario: string;
  fecha: string;
}

export interface PromedioValoracion {
  promedio: number;
  total: number;
}
