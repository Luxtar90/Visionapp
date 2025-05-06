// src/interfaces/Cliente.ts

export interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  email: string;
  telefono: string;
  direccion_detalle?: string;
  direccion_ciudad?: string;
  direccion_pais?: string;
  fecha_nacimiento?: string;
  origen_cita?: string;
  puntos_acumulados: number;
  tiendaId: number | null;
  tienda?: {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email_contacto: string;
    fecha_registro: string;
  } | null;
}
