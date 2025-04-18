// src/interfaces/Notificacion.ts

export type TipoDestinatario = 'cliente' | 'empleado' | 'todos';
export type TipoNotificacion = 'informativa' | 'promocion' | 'recordatorio' | 'alerta';
export type EstadoNotificacion = 'pendiente' | 'enviada' | 'leida' | 'cancelada';

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_lectura?: string;
  estado: EstadoNotificacion;
  destinatario: TipoDestinatario;
  destinatarios_ids?: string[]; // IDs específicos de destinatarios
  tienda_id: string;
  creador_id: string;
  imagen_url?: string;
  accion?: {
    tipo: 'url' | 'pantalla' | 'telefono';
    valor: string; // URL, nombre de pantalla o número de teléfono
  };
  programada: boolean;
  fecha_programada?: string;
}

export interface NotificacionUsuario {
  id: string;
  notificacion_id: string;
  usuario_id: string;
  estado: 'no_leida' | 'leida' | 'eliminada';
  fecha_recepcion: string;
  fecha_lectura?: string;
}

export interface FiltrosNotificaciones {
  tipo?: TipoNotificacion;
  estado?: EstadoNotificacion;
  destinatario?: TipoDestinatario;
  fecha_inicio?: string;
  fecha_fin?: string;
  busqueda?: string;
}
