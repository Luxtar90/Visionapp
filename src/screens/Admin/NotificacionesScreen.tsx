// src/screens/Admin/NotificacionesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Modal,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FiltrosNotificaciones } from '../../components/Notificaciones/FiltrosNotificaciones';
import { ListaNotificaciones } from '../../components/Notificaciones/ListaNotificaciones';
import { NotificacionForm } from '../../components/Notificaciones/NotificacionForm';
import { EstadisticasNotificaciones } from '../../components/Notificaciones/EstadisticasNotificaciones';
import { StatusMessage } from '../../components/common/StatusMessage';
import { ActionButton } from '../../components/common/ActionButton';
import { 
  getNotificaciones, 
  getNotificacionById, 
  createNotificacion, 
  updateNotificacion,
  deleteNotificacion,
  enviarNotificacion,
  cancelarNotificacion,
  getEstadisticasNotificaciones
} from '../../api/notificaciones.api';
import { 
  Notificacion, 
  FiltrosNotificaciones as FiltrosNotificacionesType,
  EstadoNotificacion
} from '../../interfaces/Notificacion';
import { useAuth } from '../../hooks/useAuth';
import { useTienda } from '../../hooks/useTienda';
import { colors } from '../../theme/colors';

export const NotificacionesScreen: React.FC = () => {
  const { user } = useAuth();
  const { tiendaActual } = useTienda();
  
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    enviadas: 0,
    leidas: 0,
    tasa_apertura: 0,
  });
  
  const [filtros, setFiltros] = useState<FiltrosNotificacionesType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Datos de ejemplo para el formulario
  const clientesEjemplo = [
    { id: '1', nombre: 'Juan', apellido: 'Pérez' },
    { id: '2', nombre: 'María', apellido: 'González' },
    { id: '3', nombre: 'Carlos', apellido: 'Rodríguez' },
    { id: '4', nombre: 'Ana', apellido: 'López' },
  ];
  
  const empleadosEjemplo = [
    { id: '1', nombre: 'Pedro', apellido: 'Martínez' },
    { id: '2', nombre: 'Laura', apellido: 'Sánchez' },
    { id: '3', nombre: 'Miguel', apellido: 'Fernández' },
  ];

  // Cargar notificaciones y estadísticas
  const cargarDatos = useCallback(async () => {
    if (!tiendaActual?.id) return;
    
    setIsLoading(true);
    try {
      const [notificacionesData, estadisticasData] = await Promise.all([
        getNotificaciones(tiendaActual.id, filtros),
        getEstadisticasNotificaciones(tiendaActual.id, filtros)
      ]);
      
      setNotificaciones(notificacionesData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error al cargar datos de notificaciones:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar las notificaciones. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [tiendaActual?.id, filtros]);

  // Cargar datos cuando cambia la tienda o los filtros
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Recargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosNotificacionesType) => {
    setFiltros(nuevosFiltros);
  };

  const handleAplicarFiltros = () => {
    cargarDatos();
  };

  const handleCrearNotificacion = () => {
    setNotificacionSeleccionada(null);
    setShowForm(true);
  };

  const handleEditarNotificacion = async (id: string) => {
    try {
      const notificacion = await getNotificacionById(id);
      setNotificacionSeleccionada(notificacion);
      setShowForm(true);
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al obtener la notificación. Intente nuevamente.'
      });
    }
  };

  const handleNotificacionPress = (notificacion: Notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setShowDetail(true);
  };

  const handleEnviarNotificacion = async (id: string) => {
    try {
      await enviarNotificacion(id);
      setStatusMessage({
        type: 'success',
        message: 'Notificación enviada correctamente'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al enviar la notificación. Intente nuevamente.'
      });
    }
  };

  const handleCancelarNotificacion = async (id: string) => {
    try {
      await cancelarNotificacion(id);
      setStatusMessage({
        type: 'success',
        message: 'Notificación cancelada correctamente'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cancelar la notificación. Intente nuevamente.'
      });
    }
  };

  const handleEliminarNotificacion = async (id: string) => {
    try {
      await deleteNotificacion(id);
      setStatusMessage({
        type: 'success',
        message: 'Notificación eliminada correctamente'
      });
      if (notificacionSeleccionada?.id === id) {
        setShowDetail(false);
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar la notificación. Intente nuevamente.'
      });
    }
  };

  const handleSubmitForm = async (data: Partial<Notificacion>) => {
    setFormLoading(true);
    try {
      if (notificacionSeleccionada) {
        // Actualizar notificación existente
        await updateNotificacion(notificacionSeleccionada.id, data);
        setStatusMessage({
          type: 'success',
          message: 'Notificación actualizada correctamente'
        });
      } else {
        // Crear nueva notificación
        if (tiendaActual?.id && user?.id) {
          const nuevaNotificacion = {
            ...data,
            tienda_id: tiendaActual.id,
            creador_id: String(user.id),
            estado: 'pendiente' as EstadoNotificacion,
          };
          await createNotificacion(nuevaNotificacion);
          setStatusMessage({
            type: 'success',
            message: 'Notificación creada correctamente'
          });
        }
      }
      setShowForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al guardar la notificación. Intente nuevamente.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const renderDetalleNotificacion = () => {
    if (!notificacionSeleccionada) return null;
    
    const formatFecha = (fecha?: string) => {
      if (!fecha) return 'N/A';
      return new Date(fecha).toLocaleString();
    };
    
    return (
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Notificación</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetail(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Título</Text>
                <Text style={styles.detalleValor}>{notificacionSeleccionada.titulo}</Text>
              </View>
              
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Mensaje</Text>
                <Text style={styles.detalleValor}>{notificacionSeleccionada.mensaje}</Text>
              </View>
              
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Tipo</Text>
                <View style={styles.detalleBadge}>
                  <Text style={styles.detalleBadgeText}>{notificacionSeleccionada.tipo}</Text>
                </View>
              </View>
              
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Estado</Text>
                <View style={styles.detalleBadge}>
                  <Text style={styles.detalleBadgeText}>{notificacionSeleccionada.estado}</Text>
                </View>
              </View>
              
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Destinatario</Text>
                <Text style={styles.detalleValor}>{notificacionSeleccionada.destinatario}</Text>
              </View>
              
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Fecha de creación</Text>
                <Text style={styles.detalleValor}>
                  {formatFecha(notificacionSeleccionada.fecha_creacion)}
                </Text>
              </View>
              
              {notificacionSeleccionada.fecha_envio && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Fecha de envío</Text>
                  <Text style={styles.detalleValor}>
                    {formatFecha(notificacionSeleccionada.fecha_envio)}
                  </Text>
                </View>
              )}
              
              {notificacionSeleccionada.fecha_lectura && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Fecha de lectura</Text>
                  <Text style={styles.detalleValor}>
                    {formatFecha(notificacionSeleccionada.fecha_lectura)}
                  </Text>
                </View>
              )}
              
              {notificacionSeleccionada.programada && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Fecha programada</Text>
                  <Text style={styles.detalleValor}>
                    {formatFecha(notificacionSeleccionada.fecha_programada)}
                  </Text>
                </View>
              )}
              
              {notificacionSeleccionada.accion && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Acción</Text>
                  <Text style={styles.detalleValor}>
                    {`${notificacionSeleccionada.accion.tipo}: ${notificacionSeleccionada.accion.valor}`}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              {notificacionSeleccionada.estado === 'pendiente' && (
                <>
                  <ActionButton
                    label="Enviar"
                    onPress={() => {
                      handleEnviarNotificacion(notificacionSeleccionada.id);
                      setShowDetail(false);
                    }}
                    icon="paper-plane"
                    style={styles.footerButton}
                  />
                  
                  <ActionButton
                    label="Cancelar"
                    onPress={() => {
                      handleCancelarNotificacion(notificacionSeleccionada.id);
                      setShowDetail(false);
                    }}
                    icon="close-circle"
                    type="secondary"
                    style={styles.footerButton}
                  />
                </>
              )}
              
              <ActionButton
                label="Editar"
                onPress={() => {
                  setShowDetail(false);
                  handleEditarNotificacion(notificacionSeleccionada.id);
                }}
                icon="create"
                type="secondary"
                style={styles.footerButton}
              />
              
              <ActionButton
                label="Eliminar"
                onPress={() => {
                  handleEliminarNotificacion(notificacionSeleccionada.id);
                  setShowDetail(false);
                }}
                icon="trash"
                type="danger"
                style={styles.footerButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderFormularioModal = () => {
    return (
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {notificacionSeleccionada ? 'Editar Notificación' : 'Nueva Notificación'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowForm(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <NotificacionForm
              notificacion={notificacionSeleccionada || undefined}
              onSubmit={handleSubmitForm}
              onCancel={() => setShowForm(false)}
              isLoading={formLoading}
              clientes={clientesEjemplo}
              empleados={empleadosEjemplo}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <ActionButton
          label="Nueva Notificación"
          onPress={handleCrearNotificacion}
          icon="add-circle"
        />
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <EstadisticasNotificaciones estadisticas={estadisticas} />
        
        <FiltrosNotificaciones
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          onAplicarFiltros={handleAplicarFiltros}
        />
      </ScrollView>
      
      <View style={styles.listContainer}>
        <ListaNotificaciones
          notificaciones={notificaciones}
          isLoading={isLoading}
          onNotificacionPress={handleNotificacionPress}
          onEnviar={handleEnviarNotificacion}
          onCancelar={handleCancelarNotificacion}
          onEliminar={handleEliminarNotificacion}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </View>
      
      {renderDetalleNotificacion()}
      {renderFormularioModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 0,
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 24,
    maxHeight: '90%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  detalleSeccion: {
    marginBottom: 16,
  },
  detalleLabel: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 4,
  },
  detalleValor: {
    fontSize: 16,
    color: colors.text,
  },
  detalleBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  detalleBadgeText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
});
