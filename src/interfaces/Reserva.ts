// src/interfaces/Reserva.ts

export interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;
  };
  empleado: {
    id: string;
    nombre: string;
    apellido: string;
  };
  servicio: {
    id: string;
    nombre: string;
    duracion: number;
    precio: number;
  };
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
}
