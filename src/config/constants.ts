// src/config/constants.ts

// URL base de la API
export const API_URL = 'http://10.0.2.2:3001/api';

// Configuración de tiempos de espera para las solicitudes
export const API_TIMEOUT = 30000; // 30 segundos

// Claves para almacenamiento local
export const STORAGE_KEYS = {
  TOKEN: '@token',
  USER_DATA: '@userData',
  SELECTED_TIENDA: '@selectedTienda',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

// Estados de las solicitudes
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLEADO: 'empleado',
  CLIENTE: 'cliente',
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Configuración de fecha y hora
export const DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Configuración de colores (complementario a theme/colors.ts)
export const CHART_COLORS = [
  '#4C6FFF', // Azul primario
  '#FF6B6B', // Rojo
  '#FFD166', // Amarillo
  '#06D6A0', // Verde
  '#118AB2', // Azul secundario
  '#073B4C', // Azul oscuro
  '#7209B7', // Púrpura
  '#F72585', // Rosa
  '#3A0CA3', // Índigo
  '#4361EE', // Azul claro
];
