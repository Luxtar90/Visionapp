// src/hooks/useValoraciones.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getValoracionesByEmpleado, 
  getValoracionesByEmpleadoAndServicio,
  getPromedioValoracionesByEmpleado
} from '../api/valoraciones.api';
import { ValoracionDetallada, PromedioValoracion } from '../types/valoraciones.types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base para las peticiones API
const baseURL = 'http://10.0.2.2:3001';

interface UseValoracionesOptions {
  generarEjemplos?: boolean;
}

// Interfaces para los datos que obtendremos de la API
interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  email?: string;
  imagen?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  duracion?: number;
}

export function useValoracionesEmpleado(
  empleadoId: number, 
  servicioId?: number,
  options: UseValoracionesOptions = { generarEjemplos: true }
) {
  const [valoraciones, setValoraciones] = useState<ValoracionDetallada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [promedio, setPromedio] = useState(0);
  const [total, setTotal] = useState(0);
  const [clientes, setClientes] = useState<Record<number, Cliente>>({});
  const [servicios, setServicios] = useState<Record<number, Servicio>>({});

  // Función para obtener datos de clientes
  const fetchClientes = useCallback(async (clienteIds: number[]) => {
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[useValoraciones] No se encontró token');
        return {};
      }
      
      // Filtrar IDs únicos
      const uniqueIds = [...new Set(clienteIds)];
      
      // Crear un objeto para almacenar los datos de los clientes
      const clientesData: Record<number, Cliente> = {};
      
      // Obtener datos de cada cliente
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const response = await axios.get(`${baseURL}/clientes/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.data) {
              clientesData[id] = response.data;
            }
          } catch (error) {
            console.error(`[useValoraciones] Error al obtener cliente ${id}:`, error);
          }
        })
      );
      
      return clientesData;
    } catch (error) {
      console.error('[useValoraciones] Error al obtener clientes:', error);
      return {};
    }
  }, []);

  // Función para obtener datos de servicios
  const fetchServicios = useCallback(async (servicioIds: number[]) => {
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[useValoraciones] No se encontró token');
        return {};
      }
      
      // Filtrar IDs únicos
      const uniqueIds = [...new Set(servicioIds)];
      
      // Crear un objeto para almacenar los datos de los servicios
      const serviciosData: Record<number, Servicio> = {};
      
      // Obtener datos de cada servicio
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const response = await axios.get(`${baseURL}/servicios/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.data) {
              serviciosData[id] = response.data;
            }
          } catch (error) {
            console.error(`[useValoraciones] Error al obtener servicio ${id}:`, error);
          }
        })
      );
      
      return serviciosData;
    } catch (error) {
      console.error('[useValoraciones] Error al obtener servicios:', error);
      return {};
    }
  }, []);

  const generarResenasEjemplo = useCallback(() => {
    const nombres = ['Juan Pérez', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Pedro González'];
    const comentarios = [
      'Excelente servicio, muy profesional.',
      'Muy buen trato y atención. Recomendado.',
      'El servicio fue bueno, pero podría mejorar en puntualidad.',
      'Muy satisfecho con el resultado, volveré pronto.',
      'Buen profesional, pero el precio es un poco elevado.'
    ];
    const servicios = ['Examen de optometría', 'Adaptación de lentes', 'Revisión de fondo de ojo', 'Medición de presión ocular'];
    
    // Generar entre 3 y 7 reseñas aleatorias
    const cantidad = Math.floor(Math.random() * 5) + 3;
    const resenasEjemplo: ValoracionDetallada[] = [];
    
    for (let i = 0; i < cantidad; i++) {
      const valoracion = Math.floor(Math.random() * 5) + 1; // Valoración entre 1 y 5
      
      resenasEjemplo.push({
        id: i + 1,
        clienteId: i + 1,
        clienteNombre: nombres[Math.floor(Math.random() * nombres.length)],
        empleadoId: empleadoId,
        servicioId: servicioId || Math.floor(Math.random() * 4) + 1,
        servicioNombre: servicioId ? 
          servicios[Math.min(servicioId - 1, servicios.length - 1)] : 
          servicios[Math.floor(Math.random() * servicios.length)],
        reservaId: i + 100,
        valoracion: valoracion,
        comentario: comentarios[Math.floor(Math.random() * comentarios.length)],
        fecha: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clienteImagen: undefined
      });
    }
    
    // Ordenar por fecha (más recientes primero)
    resenasEjemplo.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    setValoraciones(resenasEjemplo);
    setTotal(resenasEjemplo.length);
    
    // Calcular promedio
    if (resenasEjemplo.length > 0) {
      const suma = resenasEjemplo.reduce((acc, curr) => acc + curr.valoracion, 0);
      setPromedio(parseFloat((suma / resenasEjemplo.length).toFixed(1)));
    }
  }, [empleadoId, servicioId]);

  const fetchValoraciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Aquí corregimos el error de tipado, asegurándonos de que los datos se traten como ValoracionDetallada[]
      let valoracionesData: any[] = [];
      
      if (servicioId) {
        valoracionesData = await getValoracionesByEmpleadoAndServicio(empleadoId, servicioId);
      } else {
        valoracionesData = await getValoracionesByEmpleado(empleadoId);
      }
      
      // Si no hay valoraciones, usar ejemplos si está habilitado
      if ((!valoracionesData || valoracionesData.length === 0) && options.generarEjemplos) {
        console.log('[useValoraciones] No se encontraron valoraciones, generando ejemplos');
        generarResenasEjemplo();
        setLoading(false);
        return;
      }
      
      // Extraer IDs de clientes y servicios para obtener sus datos
      const clienteIds = valoracionesData.map(item => item.clienteId);
      const servicioIds = valoracionesData.map(item => item.servicioId);
      
      // Obtener datos de clientes y servicios en paralelo
      const [clientesData, serviciosData] = await Promise.all([
        fetchClientes(clienteIds),
        fetchServicios(servicioIds)
      ]);
      
      // Guardar los datos obtenidos
      setClientes(clientesData);
      setServicios(serviciosData);
      
      // Procesar las valoraciones y asegurarnos de que cumplen con la interfaz ValoracionDetallada
      const valoracionesProcesadas: ValoracionDetallada[] = valoracionesData.map(item => {
        // Obtener datos del cliente
        let clienteNombre = 'Cliente';
        let clienteImagen = undefined;
        
        // Verificar si la valoración ya tiene un objeto cliente anidado
        if (item.cliente) {
          const cliente = item.cliente;
          // Manejar diferentes estructuras de nombres (nombres/apellidos o nombre/apellido)
          const nombre = cliente.nombre || cliente.nombres || '';
          const apellido = cliente.apellido || cliente.apellidos || '';
          
          if (nombre || apellido) {
            clienteNombre = `${nombre} ${apellido}`.trim();
          }
          
          clienteImagen = cliente.imagen;
        } else {
          // Si no tiene cliente anidado, buscar en los datos obtenidos
          const cliente = clientesData[item.clienteId];
          if (cliente) {
            const nombre = cliente.nombre || cliente.nombres || '';
            const apellido = cliente.apellido || cliente.apellidos || '';
            
            if (nombre || apellido) {
              clienteNombre = `${nombre} ${apellido}`.trim();
            }
            
            clienteImagen = cliente.imagen;
          } else if (item.clienteNombre) {
            clienteNombre = item.clienteNombre;
          }
        }
        
        // Obtener datos del servicio
        let servicioNombre = 'Servicio';
        
        // Verificar si la valoración ya tiene un objeto servicio anidado
        if (item.servicio && item.servicio.nombre) {
          servicioNombre = item.servicio.nombre;
        } else {
          // Si no tiene servicio anidado, buscar en los datos obtenidos
          const servicio = serviciosData[item.servicioId];
          if (servicio && servicio.nombre) {
            servicioNombre = servicio.nombre;
          } else if (item.servicioNombre) {
            servicioNombre = item.servicioNombre;
          }
        }
        
        return {
          id: item.id,
          clienteId: item.clienteId,
          clienteNombre: clienteNombre,
          empleadoId: item.empleadoId,
          servicioId: item.servicioId,
          servicioNombre: servicioNombre,
          reservaId: item.reservaId,
          valoracion: item.valoracion,
          comentario: item.comentario || '',
          fecha: item.fecha || new Date().toISOString().split('T')[0],
          clienteImagen: clienteImagen || item.clienteImagen
        };
      });
      
      // Ordenar por fecha (más recientes primero)
      valoracionesProcesadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      
      setValoraciones(valoracionesProcesadas);
      setTotal(valoracionesProcesadas.length);
      
      // Calcular promedio
      if (valoracionesProcesadas.length > 0) {
        const suma = valoracionesProcesadas.reduce((acc, curr) => acc + curr.valoracion, 0);
        setPromedio(parseFloat((suma / valoracionesProcesadas.length).toFixed(1)));
      } else {
        // Intentar obtener el promedio desde la API
        try {
          const promedioData = await getPromedioValoracionesByEmpleado(empleadoId);
          
          if (typeof promedioData === 'number') {
            setPromedio(promedioData);
          } else if (promedioData && typeof promedioData === 'object') {
            // Si es un objeto PromedioValoracion, extraer los valores
            if ('promedio' in promedioData && typeof promedioData.promedio === 'number') {
              setPromedio(promedioData.promedio);
            }
            
            if ('total' in promedioData && typeof promedioData.total === 'number') {
              setTotal(promedioData.total);
            }
          }
        } catch (promedioError) {
          console.error('[useValoraciones] Error al obtener promedio:', promedioError);
        }
      }
    } catch (error) {
      console.error('[useValoraciones] Error al obtener valoraciones:', error);
      setError(error instanceof Error ? error : new Error('Error desconocido'));
      
      // Si hay un error y está habilitada la generación de ejemplos, generar ejemplos
      if (options.generarEjemplos) {
        console.log('[useValoraciones] Generando ejemplos debido a error');
        generarResenasEjemplo();
      }
    } finally {
      setLoading(false);
    }
  }, [empleadoId, servicioId, options.generarEjemplos, fetchClientes, fetchServicios, generarResenasEjemplo]);

  useEffect(() => {
    fetchValoraciones();
  }, [fetchValoraciones]);

  return {
    valoraciones,
    loading,
    error,
    promedio,
    total,
    refetch: fetchValoraciones
  };
}
