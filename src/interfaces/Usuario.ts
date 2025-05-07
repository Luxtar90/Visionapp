// src/interfaces/Usuario.ts

export interface Rol {
  id: number;
  nombre: string;
  nivel: number;
  descripcion: string;
}

export interface Usuario {
  id: number;
  nombre_usuario: string;
  email: string;
  password_hash?: string;
  empleado_id?: number | null;
  cliente_id?: number | null;
  rol?: Rol | null;
  rolId?: number | null;
}
