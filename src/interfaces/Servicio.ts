// src/interfaces/Servicio.ts

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number; // duración en minutos
  categoria: string;
  activo: boolean;
  imagen_url?: string;
  tienda_id?: string;
}
