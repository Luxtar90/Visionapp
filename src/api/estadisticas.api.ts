// src/api/estadisticas.api.ts
import { client } from './client';
import { 
  ResumenEstadisticas, 
  EstadisticasPorPeriodo, 
  EstadisticasClientes,
  FiltrosEstadisticas,
  ServicioPopular,
  EmpleadoDestacado
} from '../interfaces/Estadisticas';

/**
 * Obtiene un resumen general de estadísticas para una tienda
 */
export const getResumenEstadisticas = async (tiendaId: string): Promise<ResumenEstadisticas> => {
  const { data } = await client.get(`/estadisticas/resumen/${tiendaId}`);
  return data;
};

/**
 * Obtiene estadísticas por período (diario, semanal, mensual, anual)
 */
export const getEstadisticasPorPeriodo = async (
  filtros: FiltrosEstadisticas
): Promise<EstadisticasPorPeriodo> => {
  const { data } = await client.get('/estadisticas/periodo', { params: filtros });
  return data;
};

/**
 * Obtiene estadísticas de clientes (demografía, frecuencia, etc.)
 */
export const getEstadisticasClientes = async (
  tiendaId: string,
  filtros?: Omit<FiltrosEstadisticas, 'tienda_id'>
): Promise<EstadisticasClientes> => {
  const params = { ...filtros, tienda_id: tiendaId };
  const { data } = await client.get('/estadisticas/clientes', { params });
  return data;
};

/**
 * Obtiene los servicios más populares
 */
export const getServiciosPopulares = async (
  tiendaId: string,
  limite: number = 5,
  filtros?: Omit<FiltrosEstadisticas, 'tienda_id'>
): Promise<ServicioPopular[]> => {
  const params = { ...filtros, tienda_id: tiendaId, limite };
  const { data } = await client.get('/estadisticas/servicios-populares', { params });
  return data;
};

/**
 * Obtiene los empleados destacados
 */
export const getEmpleadosDestacados = async (
  tiendaId: string,
  limite: number = 5,
  filtros?: Omit<FiltrosEstadisticas, 'tienda_id'>
): Promise<EmpleadoDestacado[]> => {
  const params = { ...filtros, tienda_id: tiendaId, limite };
  const { data } = await client.get('/estadisticas/empleados-destacados', { params });
  return data;
};

/**
 * Obtiene las estadísticas de ingresos
 */
export const getEstadisticasIngresos = async (
  filtros: FiltrosEstadisticas
): Promise<{ fecha: string; ingresos: number }[]> => {
  const { data } = await client.get('/estadisticas/ingresos', { params: filtros });
  return data;
};

/**
 * Obtiene las estadísticas de reservas
 */
export const getEstadisticasReservas = async (
  filtros: FiltrosEstadisticas
): Promise<{ fecha: string; reservas: number; completadas: number; canceladas: number }[]> => {
  const { data } = await client.get('/estadisticas/reservas', { params: filtros });
  return data;
};

/**
 * Exporta un reporte en formato CSV o PDF
 */
export const exportarReporte = async (
  tipo: 'ingresos' | 'reservas' | 'clientes' | 'servicios' | 'empleados',
  formato: 'csv' | 'pdf',
  filtros: FiltrosEstadisticas
): Promise<string> => {
  const { data } = await client.post('/estadisticas/exportar', {
    tipo,
    formato,
    filtros
  });
  return data.url; // URL de descarga del archivo
};
