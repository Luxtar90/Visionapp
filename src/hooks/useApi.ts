import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setLoading, setError, setCache, clearCache } from '../reducers/api';
import api from '../config/api';

interface UseApiOptions {
  cacheKey?: string;
  cacheTime?: number;
}

export function useApi() {
  const dispatch = useDispatch();
  const apiState = useSelector((state: RootState) => state.api);

  const request = useCallback(async <T>(
    key: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    options: UseApiOptions = {}
  ): Promise<T> => {
    try {
      // Si hay datos en caché y no han expirado, los devolvemos
      if (options.cacheKey && apiState.cache[options.cacheKey]) {
        const cachedData = apiState.cache[options.cacheKey];
        if (cachedData.timestamp + (options.cacheTime || 300000) > Date.now()) {
          return cachedData.data;
        }
      }

      dispatch(setLoading({ key, value: true }));
      dispatch(setError({ key, error: null }));

      const response = await api({
        method,
        url,
        data,
      });

      // Guardamos en caché si es necesario
      if (options.cacheKey) {
        dispatch(setCache({
          key: options.cacheKey,
          data: {
            data: response,
            timestamp: Date.now(),
          },
        }));
      }

      return response as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      dispatch(setError({ key, error: errorMessage }));
      throw error;
    } finally {
      dispatch(setLoading({ key, value: false }));
    }
  }, [dispatch, apiState.cache]);

  const clearApiCache = useCallback((key?: string) => {
    if (key) {
      dispatch(clearCache(key));
    } else {
      // Si no se proporciona una clave, limpiamos toda la caché
      Object.keys(apiState.cache).forEach((cacheKey) => {
        dispatch(clearCache(cacheKey));
      });
    }
  }, [dispatch]);

  return {
    request,
    clearCache: clearApiCache,
    loading: apiState.loading,
    errors: apiState.errors,
    cache: apiState.cache,
  };
}

export default useApi; 