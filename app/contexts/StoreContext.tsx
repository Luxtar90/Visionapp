import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Store {
  id: number;
  nombre: string;
  direccion: string;
  codigo_unico: string;
}

interface ClientStore {
  idCliente: number;
  idTienda: number;
  puntosAcumulados: number;
  fechaRegistro: string;
  ultimaVisita: string;
  estado: boolean;
  store: Store;
}

interface StoreContextType {
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  clientStores: ClientStore[];
  loading: boolean;
  error: string | null;
  fetchClientStores: () => Promise<void>;
  associateWithStore: (storeId: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [clientStores, setClientStores] = useState<ClientStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientStores = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/client-stores/client/${user.id}`);
      setClientStores(response.data);
      
      // Si hay una tienda guardada en AsyncStorage, la establecemos como actual
      const savedStoreId = await AsyncStorage.getItem('currentStoreId');
      if (savedStoreId) {
        const store = response.data.find((cs: ClientStore) => cs.store.id === parseInt(savedStoreId));
        if (store) {
          setCurrentStore(store.store);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las tiendas del cliente');
    } finally {
      setLoading(false);
    }
  };

  const associateWithStore = async (storeId: number) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/client-stores`, {
        idCliente: user.id,
        idTienda: storeId,
      });
      
      // Actualizamos la lista de tiendas
      await fetchClientStores();
      
      // Guardamos la tienda seleccionada
      await AsyncStorage.setItem('currentStoreId', storeId.toString());
      
      // Buscamos la tienda en la lista actualizada y la establecemos como actual
      const store = clientStores.find(cs => cs.store.id === storeId);
      if (store) {
        setCurrentStore(store.store);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asociar con la tienda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClientStores();
    }
  }, [user?.id]);

  const value = {
    currentStore,
    setCurrentStore,
    clientStores,
    loading,
    error,
    fetchClientStores,
    associateWithStore,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export default StoreProvider;
