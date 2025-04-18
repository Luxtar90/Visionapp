// src/interfaces/Tienda.ts

export interface Tienda {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email?: string;
  horario?: string;
  logo_url?: string;
  activa: boolean;
  fecha_registro: string;
  descripcion?: string;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
  admin_id?: string;
}
