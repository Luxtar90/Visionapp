// src/types/index.ts
export interface UserProfile {
  id?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  avatar?: string;
  identificacion?: string;
  tiendaId?: number;
  puntos_acumulados?: number;
  origen_cita?: string;
  genero?: string;
  permisos?: {
    notificaciones: boolean;
    marketing: boolean;
    localizacion: boolean;
    compartir_datos: boolean;
  };
}

export interface Permisos {
  notificaciones: boolean;
  marketing: boolean;
  localizacion: boolean;
  compartir_datos: boolean;
}

export interface Store {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email_contacto?: string;
}
