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
import { EmptyState } from '../common/EmptyState';

interface PermisosEmpleadoProps {
  empleadoId: string;
}

export const PermisosEmpleado = ({ 
  empleadoId 
}: PermisosEmpleadoProps) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [permisosEmpleado, setPermisosEmpleado] = useState<any[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [todosLosPermisos, setTodosLosPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showRolesSelector, setShowRolesSelector] = useState(false);
  const [showPermisosSelector, setShowPermisosSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para manejar los permisos seleccionados temporalmente
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

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
      const rolEmpleado = await getRolEmpleado(empleadoId);
      console.log('Rol del empleado:', rolEmpleado);
      
      if (rolEmpleado && rolEmpleado.rol) {
        setRolSeleccionado(rolEmpleado.rol);
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
  const handleAsignarRol = async (rol: Rol) => {
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
  const isPermisoAsignado = (permisoId: string): boolean => {
    return permisosSeleccionados.includes(permisoId);
  };

  // Alternar la selección de un permiso
  const handleTogglePermiso = (permiso: Permiso) => {
    if (isPermisoAsignado(permiso.id)) {
      // Si ya está seleccionado, lo quitamos
      setPermisosSeleccionados(prev => prev.filter(id => id !== permiso.id));
    } else {
      // Si no está seleccionado, lo añadimos
      setPermisosSeleccionados(prev => [...prev, permiso.id]);
    }
  };

  // Guardar los permisos seleccionados
  const handleGuardarPermisos = async () => {
    try {
      setLoading(true);
      
      console.log('Guardando permisos seleccionados:', permisosSeleccionados);
      
      // Crear un array de promesas para asignar cada permiso
      const promesas = permisosSeleccionados.map(permisoId => 
        asignarPermisoAEmpleado(empleadoId, permisoId)
      );
      
      // Esperar a que todas las asignaciones se completen
      await Promise.all(promesas);
      
      // Recargar los permisos del empleado
      await cargarPermisosEmpleado();
      
      // Cerrar el selector de permisos
      setShowPermisosSelector(false);
      
      // Mostrar mensaje de éxito
      Alert.alert('Éxito', 'Permisos asignados correctamente');
      
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      Alert.alert('Error', 'No se pudieron guardar los permisos');
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
  const renderPermisoSelectorItem = ({ item }: { item: Permiso }) => (
    <TouchableOpacity 
      style={[
        styles.permisoCheckbox,
        isPermisoAsignado(item.id) && { backgroundColor: colors.primary + '10' }
      ]}
      onPress={() => handleTogglePermiso(item)}
    >
      <Ionicons 
        name={isPermisoAsignado(item.id) ? "checkmark-circle" : "ellipse-outline"} 
        size={24} 
        color={isPermisoAsignado(item.id) ? colors.primary : colors.text + '50'} 
      />
      <Text style={styles.permisoCheckboxLabel}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const renderPermisoItem = ({ item }: { item: Permiso }) => (
    <View style={styles.permisoItem}>
      <View style={styles.permisoInfo}>
        <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.permisoIcon} />
        <Text style={styles.permisoNombre}>{item.nombre}</Text>
      </View>
      <TouchableOpacity 
        style={styles.eliminarPermisoButton}
        onPress={() => handleEliminarPermiso(item)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

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
      setLoading(true);
      
      // Obtener el ID del registro de permiso_empleado
      const permisoEmpleadoId = permiso.permisoEmpleadoId;
      
      if (!permisoEmpleadoId) {
        Alert.alert('Error', 'No se pudo identificar el ID del permiso para eliminarlo');
        setLoading(false);
        return;
      }
      
      console.log(`Eliminando permiso con ID ${permisoEmpleadoId} del empleado ${empleadoId}`);
      
      // Llamar a la API para eliminar el permiso
      await eliminarPermisoDeEmpleado(permisoEmpleadoId.toString());
      
      // Recargar los permisos del empleado
      await cargarPermisosEmpleado();
      
      // Mostrar mensaje de éxito
      Alert.alert('Éxito', `Se ha eliminado el permiso "${permiso.nombre}" del empleado`);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar permiso:', error);
      Alert.alert('Error', 'No se pudo eliminar el permiso');
      setLoading(false);
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
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Permisos y Roles</Text>
            {rolSeleccionado && (
              <TouchableOpacity 
                style={styles.cambiarRolButton}
                onPress={() => setShowRolesSelector(true)}
              >
                <Text style={styles.cambiarRolButtonText}>Cambiar Rol</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {rolSeleccionado ? (
            <View style={styles.rolContainer}>
              <Text style={styles.rolNombre}>{rolSeleccionado.nombre}</Text>
              <Text style={styles.rolDescripcion}>{rolSeleccionado.descripcion}</Text>
              <View style={styles.nivelContainer}>
                <Text style={styles.nivelLabel}>Nivel de acceso:</Text>
                <Text style={styles.nivelValor}>{rolSeleccionado.nivel}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sinRolContainer}>
              <Ionicons name="key-outline" size={50} color="#ccc" />
              <Text style={styles.sinRolTitulo}>Sin rol asignado</Text>
              <Text style={styles.sinRolDescripcion}>Este empleado no tiene un rol asignado</Text>
              <TouchableOpacity 
                style={styles.asignarRolButton}
                onPress={() => setShowRolesSelector(true)}
              >
                <Text style={styles.asignarRolButtonText}>Asignar Rol</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.permisosContainer}>
            <View style={styles.permisosHeader}>
              <Text style={styles.permisosTitle}>Permisos incluidos</Text>
              {rolSeleccionado && (
                <TouchableOpacity 
                  style={styles.asignarPermisosButton}
                  onPress={() => setShowPermisosSelector(true)}
                >
                  <Text style={styles.asignarPermisosButtonText}>Asignar Permisos</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {permisos.length > 0 ? (
              <FlatList
                data={permisos}
                renderItem={renderPermisoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.permisosList}
              />
            ) : (
              <View style={styles.sinPermisosContainer}>
                <Text style={styles.sinPermisosText}>
                  {rolSeleccionado 
                    ? 'Este rol no tiene permisos asignados'
                    : 'Asigne un rol para ver los permisos disponibles'}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
      
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
                keyExtractor={item => item.id}
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
              <Text style={{ fontSize: 14, color: colors.text + '80', marginBottom: 16 }}>
                Seleccione los permisos que desea asignar al empleado
              </Text>
              <FlatList
                data={todosLosPermisos}
                renderItem={renderPermisoSelectorItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 16 }}
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
    marginTop: 4,
  },
  nivelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  nivelLabel: {
    fontSize: 14,
    color: colors.text + '80',
    marginRight: 8,
  },
  nivelValor: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  permisosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  asignarPermisosButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
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
  permisosList: {
    paddingBottom: 16,
  },
  permisoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  permisoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permisoIcon: {
    marginRight: 12,
  },
  permisoNombre: {
    fontSize: 16,
    color: colors.text,
  },
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
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
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
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  cancelButtonText: {
    color: colors.secondary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  permisoCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  permisoCheckboxLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
});
