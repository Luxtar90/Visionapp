// Importamos las pantallas de Admin que existen
import { ClientesScreen } from './ClientesScreen';
import EstadisticasScreen from './EstadisticasScreen';
import { InventarioScreen } from './InventarioScreen';
import { NotificacionesScreen } from './NotificacionesScreen';
import TiendasScreen from './TiendasScreen';
import NuevoEmpleadosScreen from './NuevoEmpleadosScreen';
import NuevoReservasScreen from './NuevoReservasScreen';
import NuevoServiciosScreen from './NuevoServiciosScreen';

// Creamos el archivo DashboardScreen.tsx y ProductosScreen.tsx en una carpeta separada

// Exportamos todas las pantallas
export {
  ClientesScreen,
  EstadisticasScreen as DashboardScreen, // Usamos EstadisticasScreen temporalmente
  EstadisticasScreen, // También exportamos el original
  InventarioScreen,
  NotificacionesScreen,
  TiendasScreen,
  InventarioScreen as ProductosScreen, // Usamos InventarioScreen temporalmente
  
  // Exportamos con los nombres que espera el AdminTabNavigator
  NuevoEmpleadosScreen as EmpleadosScreen,
  NuevoReservasScreen as ReservasScreen,
  NuevoServiciosScreen as ServiciosScreen
};
