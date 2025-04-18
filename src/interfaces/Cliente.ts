// src/interfaces/Cliente.ts

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  activo: boolean;
  fecha_registro: string;
  ultima_visita?: string;
  foto_url?: string;
  notas?: string;
  tienda_id: string;
}
