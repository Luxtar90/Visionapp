// src/hooks/usePuntos.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getPuntosCliente, 
  getResumenPuntosCliente,
  getPuntosClienteTienda,
  getResumenPuntosClienteTienda,
  registrarPuntosProducto,
  registrarPuntosServicio,
  canjearPuntos,
  calcularPuntosProducto,
  calcularPuntosServicio
} from '../api/puntos.api';
import {
  Punto,
  ResumenPuntosCliente,
  ResumenPuntosClienteTienda,
  RegistrarPuntosProductoParams,
  RegistrarPuntosServicioParams,
  CanjearPuntosParams
} from '../types/puntos.types';

export function usePuntosCliente() {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [resumen, setResumen] = useState<ResumenPuntosCliente>({
    clienteId: 0,
    nombreCliente: '',
    puntosAcumulados: 0,
    totalTiendas: 0,
    totalPuntosDisponibles: 0,
    puntosPorTienda: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<number | null>(null);
  const [resumenTienda, setResumenTienda] = useState<ResumenPuntosClienteTienda | null>(null);

  // Obtener el ID del cliente
  useEffect(() => {
    const getClienteId = async () => {
      try {
        // Intentar obtener el ID del cliente de diferentes fuentes
        const userData = await AsyncStorage.getItem('@userData');
        const userJson = await AsyncStorage.getItem('@user');
        
        // Primero intentar con @userData
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            
            if (parsedData.clienteId) {
              setClienteId(Number(parsedData.clienteId));
              return;
            }
          } catch (parseError) {
            console.error('[usePuntos] Error al parsear @userData:', parseError);
          }
        }
        
        // Luego intentar con @user
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            
            // Verificar diferentes propiedades donde podría estar el ID del cliente
            const possibleClienteId = user.cliente_id || user.clienteId || (user.cliente && user.cliente.id);
            
            if (possibleClienteId) {
              setClienteId(Number(possibleClienteId));
              return;
            }
            
            // Si no hay cliente_id pero hay id, usar ese como fallback
            if (user.id) {
              setClienteId(Number(user.id));
              return;
            }
          } catch (parseError) {
            console.error('[usePuntos] Error al parsear @user:', parseError);
          }
        }
        
        // Si llegamos aquí, no se pudo obtener el ID del cliente
        console.error('[usePuntos] No se pudo obtener el ID del cliente');
      } catch (error) {
        console.error('[usePuntos] Error al obtener ID del cliente:', error);
      }
    };

    getClienteId();
  }, []);

  // Cargar puntos cuando tengamos el ID del cliente
  useEffect(() => {
    if (clienteId) {
      fetchPuntos();
    }
  }, [clienteId]);

  // Cargar puntos de tienda específica cuando se seleccione una tienda
  useEffect(() => {
    if (clienteId && tiendaSeleccionada) {
      fetchPuntosTienda();
    }
  }, [clienteId, tiendaSeleccionada]);

  // Función para cargar los puntos generales
  const fetchPuntos = useCallback(async () => {
    if (!clienteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar el historial de puntos y el resumen en paralelo
      const [puntosData, resumenData] = await Promise.all([
        getPuntosCliente(clienteId),
        getResumenPuntosCliente(clienteId)
      ]);
      
      setPuntos(puntosData);
      setResumen(resumenData);
    } catch (error) {
      console.error('[usePuntos] Error al cargar puntos:', error);
      setError(error instanceof Error ? error : new Error('Error desconocido al cargar puntos'));
      
      // Establecer valores por defecto en caso de error
      setPuntos([]);
      setResumen({
        clienteId: clienteId,
        nombreCliente: '',
        puntosAcumulados: 0,
        totalTiendas: 0,
        totalPuntosDisponibles: 0,
        puntosPorTienda: []
      });
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  // Función para cargar los puntos de una tienda específica
  const fetchPuntosTienda = useCallback(async () => {
    if (!clienteId || !tiendaSeleccionada) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar el historial de puntos y el resumen de la tienda en paralelo
      const [puntosTiendaData, resumenTiendaData] = await Promise.all([
        getPuntosClienteTienda(clienteId, tiendaSeleccionada),
        getResumenPuntosClienteTienda(clienteId, tiendaSeleccionada)
      ]);
      
      setPuntos(puntosTiendaData);
      setResumenTienda(resumenTiendaData);
    } catch (error) {
      console.error('[usePuntos] Error al cargar puntos de tienda:', error);
      setError(error instanceof Error ? error : new Error('Error desconocido al cargar puntos de tienda'));
      
      // Establecer valores por defecto en caso de error
      setPuntos([]);
      setResumenTienda({
        disponibles: 0,
        total: 0,
        canjeados: 0,
        tienda: {
          id: tiendaSeleccionada,
          nombre: 'Tienda seleccionada'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [clienteId, tiendaSeleccionada]);

  // Función para registrar puntos por compra de productos
  const registrarPuntosPorProducto = useCallback(async (params: RegistrarPuntosProductoParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await registrarPuntosProducto(params);
      
      // Recargar los puntos para reflejar los cambios
      await fetchPuntos();
      return resultado;
    } catch (error) {
      console.error('[usePuntos] Error al registrar puntos por producto:', error);
      setError(error instanceof Error ? error : new Error('Error al registrar puntos por producto'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPuntos]);

  // Función para registrar puntos por servicio
  const registrarPuntosPorServicio = useCallback(async (params: RegistrarPuntosServicioParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await registrarPuntosServicio(params);
      
      // Recargar los puntos para reflejar los cambios
      await fetchPuntos();
      return resultado;
    } catch (error) {
      console.error('[usePuntos] Error al registrar puntos por servicio:', error);
      setError(error instanceof Error ? error : new Error('Error al registrar puntos por servicio'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPuntos]);

  // Función para canjear puntos
  const canjearPuntosCliente = useCallback(async (params: CanjearPuntosParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await canjearPuntos(params);
      
      // Recargar los puntos para reflejar los cambios
      await fetchPuntos();
      
      // Si hay una tienda seleccionada, también recargar los puntos de esa tienda
      if (tiendaSeleccionada) {
        await fetchPuntosTienda();
      }
      
      return resultado;
    } catch (error) {
      console.error('[usePuntos] Error al canjear puntos:', error);
      setError(error instanceof Error ? error : new Error('Error al canjear puntos'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPuntos, fetchPuntosTienda, tiendaSeleccionada]);

  // Función para calcular puntos por producto
  const calcularPuntosPorProducto = useCallback((precioTotal: number) => {
    return calcularPuntosProducto(precioTotal);
  }, []);

  // Función para calcular puntos por servicio
  const calcularPuntosPorServicio = useCallback((precioServicio: number) => {
    return calcularPuntosServicio(precioServicio);
  }, []);

  return {
    puntos,
    resumen,
    resumenTienda,
    loading,
    error,
    clienteId,
    tiendaSeleccionada,
    setTiendaSeleccionada,
    fetchPuntos,
    fetchPuntosTienda,
    registrarPuntosPorProducto,
    registrarPuntosPorServicio,
    canjearPuntosCliente,
    calcularPuntosPorProducto,
    calcularPuntosPorServicio
  };
}
