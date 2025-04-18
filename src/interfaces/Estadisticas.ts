// src/interfaces/Estadisticas.ts

export interface ResumenEstadisticas {
  ingresos_totales: number;
  reservas_totales: number;
  clientes_totales: number;
  servicios_populares: ServicioPopular[];
  empleados_destacados: EmpleadoDestacado[];
  tasa_conversion: number; // porcentaje de reservas completadas vs canceladas
  promedio_valoracion: number; // promedio de valoraciones de servicios
}

export interface EstadisticasPorPeriodo {
  periodo: string; // 'diario', 'semanal', 'mensual', 'anual'
  datos: DatosPorFecha[];
}

export interface DatosPorFecha {
  fecha: string;
  ingresos: number;
  reservas: number;
  clientes_nuevos: number;
}

export interface ServicioPopular {
  id: string;
  nombre: string;
  categoria: string;
  cantidad_reservas: number;
  ingresos_generados: number;
}

export interface EmpleadoDestacado {
  id: string;
  nombre: string;
  apellido: string;
  cantidad_servicios: number;
  valoracion_promedio: number;
  ingresos_generados: number;
}

export interface EstadisticasClientes {
  distribucion_genero: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  distribucion_edad: {
    menos_18: number;
    entre_18_24: number;
    entre_25_34: number;
    entre_35_44: number;
    entre_45_54: number;
    mas_55: number;
  };
  frecuencia_visitas: {
    primera_vez: number;
    ocasional: number;
    regular: number;
    frecuente: number;
  };
  servicios_preferidos: {
    categoria: string;
    cantidad: number;
  }[];
}

export interface FiltrosEstadisticas {
  fecha_inicio?: string;
  fecha_fin?: string;
  tienda_id?: string;
  categoria_servicio?: string;
  empleado_id?: string;
  periodo?: 'diario' | 'semanal' | 'mensual' | 'anual';
}
