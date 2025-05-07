// src/components/Empleados/PermisosEmpleado.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { 
  Permiso, 
  Rol, 
  getRoles,
  getPermisos,
  getPermisosDeEmpleado,
  getRolEmpleado,
  asignarRolEmpleado,
  asignarPermisoAEmpleado,
  eliminarPermisoDeEmpleado
} from '../../api/permisos.api';
import { getUsuarioPorEmpleadoId } from '../../api/usuarios.api';
import { Rol as RolUsuario } from '../../interfaces/Usuario';
import { EmptyState } from '../common/EmptyState';

interface PermisosEmpleadoProps {
  empleadoId: string;
}

interface TipoUsuario {
  esEmpleado: boolean;
  esCliente: boolean;
  empleadoId?: string;
  clienteId?: string;
  rolId?: string;
}

// Definimos una interfaz local para los permisos
interface PermisoLocal {
  id: number;
  nombre: string;
}

export const PermisosEmpleado = ({ 
  empleadoId 
}: PermisosEmpleadoProps) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario | null>(null);
  const [permisos, setPermisos] = useState<PermisoLocal[]>([]);
  const [permisosEmpleado, setPermisosEmpleado] = useState<any[]>([]);
  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [todosLosPermisos, setTodosLosPermisos] = useState<PermisoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showRolesSelector, setShowRolesSelector] = useState(false);
  const [showPermisosSelector, setShowPermisosSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>({ esEmpleado: false, esCliente: false });

  // Estado para manejar los permisos seleccionados temporalmente
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [empleadoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando carga de datos para empleado ID:', empleadoId);
      
      // Cargar todos los permisos disponibles primero
      await cargarPermisos();
      
      // Luego cargar roles disponibles
      await cargarRoles();
      
      // Cargar los permisos asignados al empleado
      await cargarPermisosEmpleado();
      
      // Finalmente cargar el rol actual del empleado
      await cargarRolEmpleado();
      
      console.log('Carga de datos completada');
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('No se pudieron cargar los datos. Intente nuevamente.');
      setLoading(false);
    }
  };

  // Cargar roles disponibles
  const cargarRoles = async () => {
    try {
      setLoadingRoles(true);
      const rolesData = await getRoles();
      console.log('Roles obtenidos:', rolesData);
      setRoles(rolesData);
      setLoadingRoles(false);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setLoadingRoles(false);
      Alert.alert('Error', 'No se pudieron cargar los roles disponibles');
    }
  };

  // Cargar todos los permisos
  const cargarPermisos = async () => {
    try {
      const permisosData = await getPermisos();
      console.log('Todos los permisos:', permisosData);
      setTodosLosPermisos(permisosData);
    } catch (error) {
      console.error('Error al cargar todos los permisos:', error);
    }
  };

  // Cargar el rol actual del empleado
  const cargarRolEmpleado = async () => {
    try {
      // Usar la nueva función para obtener el usuario directamente por ID de empleado
      const usuario = await getUsuarioPorEmpleadoId(parseInt(empleadoId));
      console.log('Usuario del empleado:', usuario);
      
      // Inicializar información del tipo de usuario
      const infoUsuario: TipoUsuario = {
        esEmpleado: false,
        esCliente: false
      };
      
      // Verificar si es un empleado (siempre será true en este contexto)
      infoUsuario.esEmpleado = true;
      infoUsuario.empleadoId = empleadoId;
      
      // Verificar si también es un cliente
      if (usuario && usuario.cliente_id) {
        infoUsuario.esCliente = true;
        infoUsuario.clienteId = usuario.cliente_id.toString();
      }
      
      // Guardar el ID del rol si existe
      if (usuario && usuario.rol && usuario.rol.id) {
        infoUsuario.rolId = usuario.rol.id.toString();
      }
      
      // Actualizar el estado con la información del tipo de usuario
      setTipoUsuario(infoUsuario);
      
      // Actualizar el rol seleccionado si existe
      if (usuario && usuario.rol) {
        // Asegurarse de que el rol tenga todas las propiedades requeridas
        const rolCompleto: RolUsuario = {
          id: usuario.rol.id,
          nombre: usuario.rol.nombre,
          descripcion: usuario.rol && typeof usuario.rol === 'object' && 'descripcion' in usuario.rol ? String(usuario.rol.descripcion) : '',
          nivel: usuario.rol && typeof usuario.rol === 'object' && 'nivel' in usuario.rol ? Number(usuario.rol.nivel) : 0
        };
        setRolSeleccionado(rolCompleto);
      } else {
        setRolSeleccionado(null);
      }
    } catch (error) {
      console.error('Error al cargar rol del empleado:', error);
      setRolSeleccionado(null);
    }
  };

  // Cargar los permisos asignados al empleado
  const cargarPermisosEmpleado = async () => {
    try {
      console.log('Obteniendo permisos para empleado ID:', empleadoId);
      const permisosData = await getPermisosDeEmpleado(empleadoId);
      console.log('Permisos del empleado recibidos:', JSON.stringify(permisosData));
      
      // Inicializar array vacío para los permisos
      let permisosActivos: Permiso[] = [];
      
      // Asegurarnos de que todosLosPermisos esté cargado
      if (todosLosPermisos.length === 0) {
        await cargarPermisos();
      }
      
      if (permisosData && Array.isArray(permisosData)) {
        // Si es un array, asumimos que es un array de permisos directamente
        permisosActivos = permisosData
          .filter((p: any) => p.activo)
          .map((p: any) => {
            const permisoId = p.permisoId?.toString() || p.id?.toString();
            // Buscar el permiso completo en todosLosPermisos
            const permisoCompleto = todosLosPermisos.find(
              permiso => permiso.id === permisoId
            );
            
            if (permisoCompleto) {
              return {
                ...permisoCompleto,
                permisoEmpleadoId: p.id // Guardar el ID del registro de permiso_empleado para poder eliminarlo
              };
            }
            
            return { 
              id: permisoId, 
              nombre: `Permiso ID: ${permisoId}`,
              permisoEmpleadoId: p.id
            };
          });
        
        console.log('Permisos activos procesados:', permisosActivos);
        setPermisos(permisosActivos);
        setPermisosEmpleado(permisosData);
      } else if (permisosData && permisosData.permisos && Array.isArray(permisosData.permisos)) {
        // Si tiene una propiedad permisos, usamos esa
        permisosActivos = permisosData.permisos
          .filter((p: any) => p.activo)
          .map((p: any) => {
            const permisoId = p.permisoId?.toString() || p.id?.toString();
            // Buscar el permiso completo en todosLosPermisos
            const permisoCompleto = todosLosPermisos.find(
              permiso => permiso.id === permisoId
            );
            
            if (permisoCompleto) {
              return {
                ...permisoCompleto,
                permisoEmpleadoId: p.id // Guardar el ID del registro de permiso_empleado para poder eliminarlo
              };
            }
            
            return { 
              id: permisoId, 
              nombre: `Permiso ID: ${permisoId}`,
              permisoEmpleadoId: p.id
            };
          });
        
        console.log('Permisos activos procesados (desde permisosData.permisos):', permisosActivos);
        setPermisos(permisosActivos);
        setPermisosEmpleado(permisosData.permisos);
      } else {
        console.log('No se encontraron permisos para el empleado o formato desconocido');
        setPermisos([]);
        setPermisosEmpleado([]);
      }
    } catch (error) {
      console.error('Error al cargar permisos del empleado:', error);
      setPermisos([]);
      setPermisosEmpleado([]);
    }
  };

  // Asignar un rol al empleado
  const handleAsignarRol = async (rol: RolUsuario) => {
    try {
      setLoading(true);
      console.log(`Asignando rol ${rol.nombre} (ID: ${rol.id}) al empleado ${empleadoId}`);
      
      // Llamar a la API para asignar el rol al empleado
      await asignarRolEmpleado(empleadoId, rol.id);
      
      // Actualizar el estado local
      setRolSeleccionado(rol);
      
      // Recargar los permisos del empleado después de asignar el rol
      await cargarPermisosEmpleado();
      
      // Cerrar el selector de roles
      setShowRolesSelector(false);
      
      // Mostrar mensaje de éxito
      Alert.alert('Éxito', `Se ha asignado el rol ${rol.nombre} al empleado`);
      setLoading(false);
    } catch (error) {
      console.error('Error al asignar rol:', error);
      Alert.alert('Error', 'No se pudo asignar el rol al empleado');
      setLoading(false);
    }
  };

  // Verificar si un permiso está asignado al empleado
  const isPermisoAsignado = (permisoId: number): boolean => {
    return permisosSeleccionados.includes(permisoId);
  };

  // Alternar la selección de un permiso
  const handleTogglePermiso = (permisoId: number) => {
    if (isPermisoAsignado(permisoId)) {
      // Si ya está seleccionado, lo quitamos
      setPermisosSeleccionados(prev => prev.filter(id => id !== permisoId));
    } else {
      // Si no está seleccionado, lo añadimos
      setPermisosSeleccionados(prev => [...prev, permisoId]);
    }
  };

  // Guardar los permisos seleccionados
  const handleGuardarPermisos = async () => {
    try {
      // Verificar si se seleccionaron permisos
      if (permisosSeleccionados.length === 0) {
        Alert.alert(
          'Advertencia', 
          'No ha seleccionado ningún permiso. ¿Está seguro de que desea continuar?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Continuar',
              onPress: async () => {
                await procesarGuardadoPermisos();
              }
            }
          ]
        );
      } else {
        // Mostrar confirmación con los permisos seleccionados
        const permisosNombres = permisosSeleccionados.map(id => {
          const permiso = todosLosPermisos.find(p => p.id === id);
          return permiso ? `${permiso.nombre} (ID: ${permiso.id})` : `ID: ${id}`;
        });

        Alert.alert(
          'Confirmar asignación', 
          `¿Está seguro de asignar los siguientes permisos al empleado?\n\n${permisosNombres.join('\n')}`,
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Asignar',
              onPress: async () => {
                await procesarGuardadoPermisos();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al preparar guardado de permisos:', error);
      Alert.alert('Error', 'Ocurrió un error al preparar la asignación de permisos');
    }
  };

  // Procesar el guardado de permisos
  const procesarGuardadoPermisos = async () => {
    try {
      setLoading(true);
      
      console.log('Guardando permisos seleccionados:', permisosSeleccionados);
      
      // Crear un array de promesas para asignar cada permiso
      const promesas = permisosSeleccionados.map(permisoId => 
        asignarPermisoAEmpleado(empleadoId, permisoId.toString())
      );
      
      // Esperar a que todas las asignaciones se completen
      await Promise.all(promesas);
      
      // Recargar los permisos del empleado
      await cargarPermisosEmpleado();
      
      // Cerrar el selector de permisos
      setShowPermisosSelector(false);
      
      // Mostrar mensaje de éxito con detalles
      const cantidadPermisos = permisosSeleccionados.length;
      Alert.alert(
        'Operación exitosa', 
        `Se ${cantidadPermisos === 1 ? 'ha' : 'han'} asignado ${cantidadPermisos} ${cantidadPermisos === 1 ? 'permiso' : 'permisos'} correctamente al empleado.`
      );
      
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      Alert.alert('Error', 'No se pudieron guardar los permisos. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Inicializar los permisos seleccionados cuando se abra el selector
  useEffect(() => {
    if (showPermisosSelector) {
      // Inicializar con los permisos actuales del empleado
      const idsPermisosActuales = permisos.map(p => p.id);
      setPermisosSeleccionados(idsPermisosActuales);
    }
  }, [showPermisosSelector, permisos]);

  // Renderizar un permiso en la lista de todos los permisos
  const renderPermisoSelectorItem = ({ item }: { item: Permiso }) => {
    const isSelected = isPermisoAsignado(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.permisoCheckbox, isSelected ? { backgroundColor: colors.primary + '10' } : {}]}
        onPress={() => handleTogglePermiso(item.id)}
      >
        <View style={styles.checkboxCircle}>
          {isSelected ? (
            <View style={styles.checkboxCircleSelected}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          ) : (
            <View style={styles.checkboxCircleEmpty} />
          )}
        </View>
        <View style={styles.permisoLabelContainer}>
          <Text style={styles.permisoCheckboxLabel}>
            {getPermisoNombreFormateado(item.nombre)}
          </Text>
          <Text style={styles.permisoDescripcion}>
            {getPermisoDescripcion(item.nombre)} <Text style={styles.permisoIdSelector}>ID: {item.id}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para obtener una descripción del permiso basada en su nombre
  const getPermisoDescripcion = (nombre: string) => {
    const partes = nombre.split(':');
    if (partes.length === 2) {
      const modulo = partes[0];
      const accion = partes[1];
      
      let descripcionAccion = '';
      switch (accion) {
        case 'leer':
          descripcionAccion = 'Ver información';
          break;
        case 'crear':
          descripcionAccion = 'Crear nuevos registros';
          break;
        case 'editar':
          descripcionAccion = 'Modificar registros existentes';
          break;
        case 'eliminar':
          descripcionAccion = 'Eliminar registros';
          break;
        default:
          descripcionAccion = accion;
      }
      
      let moduloNombre = '';
      switch (modulo) {
        case 'usuarios':
          moduloNombre = 'Usuarios';
          break;
        case 'ventas':
          moduloNombre = 'Ventas';
          break;
        case 'reservas':
          moduloNombre = 'Reservas';
          break;
        default:
          moduloNombre = modulo;
      }
      
      return `${descripcionAccion} en el módulo de ${moduloNombre}`;
    } else if (nombre === 'crear_producto') {
      return 'Crear nuevos productos en el sistema';
    }
    
    return 'Permiso del sistema';
  };
  
  // Función para obtener el nombre del permiso basado en su ID
  const getPermisoNombrePorId = (permisoId: string) => {
    // Verificar si es un ID numérico conocido
    switch(permisoId) {
      case '1': return 'usuarios:leer';
      case '2': return 'usuarios:crear';
      case '3': return 'usuarios:editar';
      case '4': return 'usuarios:eliminar';
      case '5': return 'ventas:leer';
      case '6': return 'ventas:crear';
      case '7': return 'ventas:editar';
      case '8': return 'ventas:eliminar';
      case '9': return 'reservas:leer';
      case '10': return 'reservas:crear';
      case '11': return 'reservas:editar';
      case '12': return 'reservas:eliminar';
      case '13': return 'crear_producto';
      default: return `permiso:${permisoId}`;
    }
  };
  
  // Función para formatear el nombre del permiso de manera más legible
  const getPermisoNombreFormateado = (nombre: string) => {
    const partes = nombre.split(':');
    if (partes.length === 2) {
      const modulo = partes[0];
      const accion = partes[1];
      
      let accionFormateada = '';
      switch (accion) {
        case 'leer':
          accionFormateada = 'Ver';
          break;
        case 'crear':
          accionFormateada = 'Crear';
          break;
        case 'editar':
          accionFormateada = 'Editar';
          break;
        case 'eliminar':
          accionFormateada = 'Eliminar';
          break;
        default:
          accionFormateada = accion.charAt(0).toUpperCase() + accion.slice(1);
      }
      
      let moduloFormateado = '';
      switch (modulo) {
        case 'usuarios':
          moduloFormateado = 'Usuarios';
          break;
        case 'ventas':
          moduloFormateado = 'Ventas';
          break;
        case 'reservas':
          moduloFormateado = 'Reservas';
          break;
        default:
          moduloFormateado = modulo.charAt(0).toUpperCase() + modulo.slice(1);
      }
      
      return `${accionFormateada} ${moduloFormateado}`;
    } else if (nombre === 'crear_producto') {
      return 'Crear Productos';
    }
    
    return nombre.charAt(0).toUpperCase() + nombre.slice(1).replace(/_/g, ' ');
  };

  const renderPermisoItem = ({ item }: { item: Permiso }) => {
    // Obtener el nombre del permiso, ya sea formateado o por ID
    let nombreMostrar = item.nombre;
    
    // Si el nombre comienza con "Permiso ID:", reemplazarlo con un nombre más descriptivo
    if (nombreMostrar.startsWith('Permiso ID:')) {
      const idPermiso = nombreMostrar.split(':')[1].trim();
      nombreMostrar = getPermisoNombrePorId(idPermiso);
    } else {
      // Si es un nombre normal, formatearlo para mejor legibilidad
      nombreMostrar = getPermisoNombreFormateado(nombreMostrar);
    }
    
    // Determinar el icono basado en el tipo de permiso
    let iconName: any = "key-outline";
    let iconColor = colors.primary;
    
    if (nombreMostrar.includes('leer') || nombreMostrar.includes('ver')) {
      iconName = "eye-outline";
      iconColor = "#4285F4"; // Azul para permisos de lectura
    } else if (nombreMostrar.includes('crear') || nombreMostrar.includes('añadir')) {
      iconName = "add-circle-outline";
      iconColor = "#0F9D58"; // Verde para permisos de creación
    } else if (nombreMostrar.includes('editar') || nombreMostrar.includes('modificar')) {
      iconName = "pencil-outline";
      iconColor = "#F4B400"; // Amarillo para permisos de edición
    } else if (nombreMostrar.includes('eliminar') || nombreMostrar.includes('borrar')) {
      iconName = "trash-outline";
      iconColor = "#DB4437"; // Rojo para permisos de eliminación
    }
    
    return (
      <View style={styles.permisoItemCard}>
        <View style={styles.permisoInfo}>
          <View style={[styles.permisoIconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.permisoDetalles}>
            <Text style={styles.permisoNombre}>
              {nombreMostrar}
            </Text>
            <Text style={styles.permisoDescripcion}>
              {getPermisoDescripcion(nombreMostrar)}
            </Text>
          </View>
          <Text style={styles.permisoId}>ID: {item.id}</Text>
        </View>
        <TouchableOpacity 
          style={styles.eliminarPermisoButton}
          onPress={() => handleEliminarPermiso(item)}
        >
          <Ionicons name="close-circle-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRolItem = ({ item }: { item: Rol }) => (
    <TouchableOpacity 
      style={[
        styles.rolItem,
        rolSeleccionado?.id === item.id && styles.rolItemSelected
      ]}
      onPress={() => handleAsignarRol(item)}
    >
      <View style={styles.rolItemInfo}>
        <Text style={[
          styles.rolItemNombre,
          rolSeleccionado?.id === item.id && { color: colors.primary }
        ]}>
          {item.nombre}
        </Text>
        {item.descripcion && (
          <Text style={styles.rolItemDescripcion}>{item.descripcion}</Text>
        )}
      </View>
      {rolSeleccionado?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Eliminar un permiso específico del empleado
  const handleEliminarPermiso = async (permiso: any) => {
    try {
      // Obtener el ID del registro de permiso_empleado
      const permisoEmpleadoId = permiso.permisoEmpleadoId;
      
      if (!permisoEmpleadoId) {
        Alert.alert('Error', 'No se pudo identificar el ID del permiso para eliminarlo');
        return;
      }
      
      // Mostrar confirmación antes de eliminar
      Alert.alert(
        'Confirmar eliminación',
        `¿Está seguro de que desea eliminar el permiso "${permiso.nombre}" (ID: ${permiso.id}) del empleado?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                
                console.log(`Eliminando permiso con ID ${permisoEmpleadoId} del empleado ${empleadoId}`);
                
                // Llamar a la API para eliminar el permiso
                await eliminarPermisoDeEmpleado(permisoEmpleadoId.toString());
                
                // Recargar los permisos del empleado
                await cargarPermisosEmpleado();
                
                // Mostrar mensaje de éxito
                Alert.alert(
                  'Operación exitosa', 
                  `Se ha eliminado el permiso "${permiso.nombre}" (ID: ${permiso.id}) del empleado correctamente.`
                );
                
                setLoading(false);
              } catch (error) {
                console.error('Error al eliminar permiso:', error);
                Alert.alert(
                  'Error', 
                  `No se pudo eliminar el permiso "${permiso.nombre}". Por favor, inténtelo de nuevo.`
                );
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al preparar eliminación de permiso:', error);
      Alert.alert('Error', 'Ocurrió un error al preparar la eliminación del permiso');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando permisos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarDatos}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Roles y Permisos</Text>
            {rolSeleccionado && (
              <TouchableOpacity 
                style={styles.cambiarRolButton}
                onPress={() => setShowRolesSelector(true)}
              >
                <Text style={styles.cambiarRolButtonText}>Cambiar Rol</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.rolesMainContainer}>
            {/* Sección de Roles Principales */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Roles Principales</Text>
              <View style={styles.rolesPrincipalesList}>
                {tipoUsuario.esEmpleado && (
                  <View style={styles.rolPrincipalItem}>
                    <View style={styles.rolIconBadge}>
                      <Ionicons name="briefcase-outline" size={20} color="#fff" />
                    </View>
                    <View style={styles.rolInfoContent}>
                      <Text style={styles.rolPrincipalNombre}>Empleado</Text>
                      <Text style={styles.rolPrincipalId}>ID: {tipoUsuario.empleadoId}</Text>
                    </View>
                  </View>
                )}
                {tipoUsuario.esCliente && (
                  <View style={styles.rolPrincipalItem}>
                    <View style={[styles.rolIconBadge, { backgroundColor: colors.success }]}>
                      <Ionicons name="person-outline" size={20} color="#fff" />
                    </View>
                    <View style={styles.rolInfoContent}>
                      <Text style={styles.rolPrincipalNombre}>Cliente</Text>
                      <Text style={styles.rolPrincipalId}>ID: {tipoUsuario.clienteId}</Text>
                    </View>
                  </View>
                )}
                {!tipoUsuario.esEmpleado && !tipoUsuario.esCliente && (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="#9e9e9e" />
                    <Text style={styles.emptyStateText}>No tiene roles principales asignados</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Sección de Roles Adicionales */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Rol Adicional</Text>
                {!rolSeleccionado && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setShowRolesSelector(true)}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.actionButtonText}>Asignar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {rolSeleccionado ? (
                <View style={styles.rolAdditionalCard}>
                  <View style={styles.rolHeaderRow}>
                    <View style={styles.rolBadge}>
                      <Text style={styles.rolBadgeText}>{rolSeleccionado.nombre.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.rolHeaderInfo}>
                      <Text style={styles.rolNombre}>{rolSeleccionado.nombre}</Text>
                      {tipoUsuario.rolId && (
                        <Text style={styles.rolIdText}>ID: {tipoUsuario.rolId}</Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={styles.editRolButton}
                      onPress={() => setShowRolesSelector(true)}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.rolDescripcion}>{rolSeleccionado.descripcion}</Text>
                  
                  <View style={styles.nivelContainer}>
                    <Text style={styles.nivelLabel}>Nivel de acceso:</Text>
                    <View style={styles.nivelBadge}>
                      <Text style={styles.nivelValor}>{rolSeleccionado.nivel}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyRolContainer}>
                  <Ionicons name="shield-outline" size={48} color="#e0e0e0" />
                  <Text style={styles.emptyRolTitle}>Sin rol adicional</Text>
                  <Text style={styles.emptyRolDescription}>
                    Este usuario no tiene un rol adicional asignado
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Permisos incluidos</Text>
                <Text style={styles.sectionSubtitle}>
                  {permisos.length} {permisos.length === 1 ? 'permiso asignado' : 'permisos asignados'}
                </Text>
              </View>
              {rolSeleccionado && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowPermisosSelector(true)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.actionButtonText}>Gestionar</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {permisos.length > 0 ? (
              <FlatList
                data={permisos}
                keyExtractor={(item) => item.id.toString()}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    padding: 12,
                    marginHorizontal: 8,
                    marginVertical: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 4,
                    }}>{item.nombre}</Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.text + '70',
                    }}>ID: {item.id}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  height: 300,
                  marginTop: 8
                }}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="key-outline" size={40} color="#e0e0e0" />
                <Text style={styles.emptyStateTitle}>
                  {rolSeleccionado 
                    ? 'Sin permisos asignados'
                    : 'Asigne un rol primero'}
                </Text>
                <Text style={styles.emptyStateDescription}>
                  {rolSeleccionado 
                    ? 'Este rol no tiene permisos asignados. Haga clic en "Gestionar" para añadir permisos.'
                    : 'Asigne un rol para poder gestionar los permisos disponibles'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Modals */}
      <Modal
        visible={showRolesSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRolesSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Rol</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowRolesSelector(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <FlatList
                data={roles}
                renderItem={renderRolItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRolesSelector(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPermisosSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPermisosSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gestionar Permisos</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPermisosSelector(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalSubtitleContainer}>
                <Text style={styles.modalSubtitle}>
                  Seleccione los permisos que desea asignar al empleado
                </Text>
              </View>
              <FlatList
                data={todosLosPermisos}
                renderItem={renderPermisoSelectorItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.permisosSelectorList}
                showsVerticalScrollIndicator={true}
                ItemSeparatorComponent={() => <View style={styles.separadorLista} />}
                style={{ height: '100%' }}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowPermisosSelector(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleGuardarPermisos}
              >
                <Text style={styles.confirmButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Nuevos estilos para tarjetas de sección
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  rolesPrincipalesList: {
    marginTop: 12,
  },
  rolPrincipalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rolIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rolInfoContent: {
    flex: 1,
  },
  rolPrincipalNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  rolPrincipalId: {
    fontSize: 14,
    color: colors.text + '80',
    marginTop: 2,
  },
  emptyStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  // Estilos para encabezados de secciones
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonIcon: {
    marginRight: 4,
  },
  // Estilos para tarjeta de rol adicional
  rolAdditionalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  rolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rolBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rolBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rolHeaderInfo: {
    flex: 1,
  },
  editRolButton: {
    padding: 8,
  },
  nivelBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  // Estilos para estado vacío de rol
  emptyRolContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyRolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptyRolDescription: {
    fontSize: 14,
    color: colors.text + '80',
    textAlign: 'center',
    marginTop: 8,
  },
  // Estilos para la sección de permisos
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text + '70',
    marginTop: 4,
  },
  permisosListContainer: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  permisosList: {
    paddingVertical: 8,
  },
  permisosSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.text + '80',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text + '80',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  rolContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  rolNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  rolDescripcion: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 8
  },
  nivelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8
  },
  nivelLabel: {
    fontSize: 14,
    color: colors.text + '80',
    marginRight: 4
  },
  nivelValor: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary
  },
  // Contenedores principales para roles
  rolesMainContainer: {
    marginBottom: 16
  },
  rolesPrincipalesContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12
  },
  rolesAdicionalesContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12
  },
  rolesCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  rolesPrincipalesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  
  // Estilos para tags de tipos de usuario
  tipoUsuarioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
    marginBottom: 4,
    alignSelf: 'flex-start'
  },
  empleadoTag: {
    backgroundColor: colors.primary + '15',
  },
  clienteTag: {
    backgroundColor: colors.success + '15',
  },
  tipoUsuarioText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4
  },
  idText: {
    fontSize: 10,
    color: colors.primary + '90',
    marginLeft: 4,
    marginTop: 2
  },
  noRolesText: {
    fontSize: 14,
    color: colors.text + '70',
    fontStyle: 'italic'
  },
  rolIdText: {
    fontSize: 12,
    color: colors.text + '70',
    marginTop: 4
  },
  sinRolContainer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 24,
  },
  sinRolTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  sinRolDescripcion: {
    fontSize: 16,
    color: colors.text + '80',
    textAlign: 'center',
    marginTop: 8,
  },
  asignarRolButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  asignarRolButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  cambiarRolButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cambiarRolButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  permisosContainer: {
    flex: 1,
    padding: 16,
  },
  permisosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permisosTitleContainer: {
    flex: 1,
  },
  permisosSubtitle: {
    fontSize: 12,
    color: colors.text + '80',
    marginTop: 2,
  },
  permisoCheckboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  permisosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  // Ya existe una propiedad actionButton que cumple la misma función
  asignarPermisosButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  sinPermisosContainer: {
    padding: 24,
    alignItems: 'center',
  },
  sinPermisosText: {
    fontSize: 16,
    color: colors.text + '80',
    textAlign: 'center',
    marginBottom: 16,
  },
  // Se eliminó la propiedad permisosList duplicada
  permisoItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  permisoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permisoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permisoDetalles: {
    flex: 1,
    marginLeft: 12,
  },
  permisoIcon: {
    marginRight: 12,
  },
  permisoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  permisoId: {
    fontSize: 12,
    color: colors.text + '70',
    fontWeight: 'normal',
  },
  // Estilos eliminados para evitar duplicados

  eliminarPermisoButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSubtitleContainer: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text + '80',
    paddingHorizontal: 4,
  },
  permisosSelectorList: {
    paddingBottom: 16,
  },
  separadorLista: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 52,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 0,
    flex: 1,
    maxHeight: '80%',
  },
  rolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  rolItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  rolItemInfo: {
    flex: 1,
  },
  rolItemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  rolItemDescripcion: {
    fontSize: 14,
    color: colors.text + '80',
  },
  rolItemNivel: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalFooterSimple: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 120,
  },
  cancelButtonText: {
    color: '#5c5c5c',
    fontWeight: '500',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#4a6da7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    width: 120,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  // Ya existe una propiedad buttonIcon arriba, esta es redundante
  permisoCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCircleSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircleEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d1d1',
  },
  // Estilo eliminado para evitar duplicados
  permisoLabelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  permisoIdSelector: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'normal',
    marginLeft: 4,
  },
  permisoDescripcion: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
});
