// src/hooks/useTienda.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

interface Tienda {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email?: string;
  logo_url?: string;
  horario?: {
    apertura: string;
    cierre: string;
    dias: string[];
  };
}

interface TiendaHookResult {
  tiendas: Tienda[];
  tiendaActual: Tienda | null;
  isLoading: boolean;
  seleccionarTienda: (tiendaId: string) => Promise<void>;
  actualizarTienda: (tiendaId: string, datos: Partial<Tienda>) => Promise<void>;
}

// Datos de ejemplo
const tiendasEjemplo: Tienda[] = [
  {
    id: '1',
    nombre: 'Salón Principal',
    direccion: 'Calle Mayor 123, Madrid',
    telefono: '912345678',
    email: 'salon@ejemplo.com',
    logo_url: 'https://via.placeholder.com/150',
    horario: {
      apertura: '09:00',
      cierre: '20:00',
      dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    },
  },
  {
    id: '2',
    nombre: 'Sucursal Centro',
    direccion: 'Gran Vía 45, Madrid',
    telefono: '913456789',
    email: 'centro@ejemplo.com',
    logo_url: 'https://via.placeholder.com/150',
    horario: {
      apertura: '10:00',
      cierre: '21:00',
      dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
  },
];

export const useTienda = (): TiendaHookResult => {
  const { user } = useAuth();
  const [tiendas, setTiendas] = useState<Tienda[]>(tiendasEjemplo);
  const [tiendaActual, setTiendaActual] = useState<Tienda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar tienda seleccionada desde AsyncStorage al iniciar
    const cargarTiendaSeleccionada = async () => {
      try {
        const tiendaIdGuardada = await AsyncStorage.getItem('@tienda_seleccionada');
        
        if (tiendaIdGuardada) {
          const tienda = tiendas.find(t => t.id === tiendaIdGuardada);
          if (tienda) {
            setTiendaActual(tienda);
          } else {
            // Si no se encuentra la tienda guardada, seleccionar la primera
            setTiendaActual(tiendas[0]);
          }
        } else {
          // Si no hay tienda guardada, seleccionar la primera
          setTiendaActual(tiendas[0]);
        }
      } catch (error) {
        console.error('Error al cargar tienda seleccionada:', error);
        // En caso de error, seleccionar la primera tienda
        setTiendaActual(tiendas[0]);
      } finally {
        setIsLoading(false);
      }
    };

    // Cargar las tiendas desde la API (simulado)
    const cargarTiendas = async () => {
      setIsLoading(true);
      try {
        // Aquí iría la llamada a la API para obtener las tiendas
        // Por ahora, usamos los datos de ejemplo
        setTiendas(tiendasEjemplo);
        
        // Después de cargar las tiendas, cargar la seleccionada
        await cargarTiendaSeleccionada();
      } catch (error) {
        console.error('Error al cargar tiendas:', error);
        setIsLoading(false);
      }
    };

    cargarTiendas();
  }, []);

  const seleccionarTienda = async (tiendaId: string) => {
    setIsLoading(true);
    try {
      const tienda = tiendas.find(t => t.id === tiendaId);
      if (!tienda) {
        throw new Error('Tienda no encontrada');
      }

      // Guardar selección en AsyncStorage
      await AsyncStorage.setItem('@tienda_seleccionada', tiendaId);
      
      setTiendaActual(tienda);
    } catch (error) {
      console.error('Error al seleccionar tienda:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarTienda = async (tiendaId: string, datos: Partial<Tienda>) => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API para actualizar la tienda
      // Por ahora, actualizamos localmente
      const tiendasActualizadas = tiendas.map(tienda => 
        tienda.id === tiendaId ? { ...tienda, ...datos } : tienda
      );
      
      setTiendas(tiendasActualizadas);
      
      // Si la tienda actualizada es la actual, actualizar también tiendaActual
      if (tiendaActual && tiendaActual.id === tiendaId) {
        setTiendaActual({ ...tiendaActual, ...datos });
      }
    } catch (error) {
      console.error('Error al actualizar tienda:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tiendas,
    tiendaActual,
    isLoading,
    seleccionarTienda,
    actualizarTienda,
  };
};

export default useTienda;
