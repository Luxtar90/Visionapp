// src/interfaces/Usuario.ts

export interface Usuario {
  id: string | number;
  nombre: string;
  email: string;
  rol: string;
  tiendaId?: string | number;
  clienteId?: string | number;
}
