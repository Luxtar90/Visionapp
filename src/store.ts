/**
 * @deprecated Este archivo está obsoleto. Por favor, utiliza el store configurado en /store/index.ts
 * 
 * Este archivo se mantiene temporalmente para compatibilidad con código antiguo.
 * Todos los nuevos componentes deben importar el store desde /store/index.ts
 */

import store from '../store';

// Re-exportamos el store desde la ubicación correcta
export { store };

// También exportamos los tipos para facilitar la migración
export type { RootState } from '../store';
