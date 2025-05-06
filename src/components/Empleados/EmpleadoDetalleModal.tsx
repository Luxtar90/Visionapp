// src/components/Empleados/EmpleadoDetalleModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Empleado } from '../../api/empleados.api';
import { EmpleadoForm } from './EmpleadoForm';
import { ServiciosAsignadosEmpleado } from './ServiciosAsignadosEmpleado';
import { AsignarServicioModal } from './AsignarServicioModal';
import { PermisosEmpleado } from './PermisosEmpleado';
import { ComisionesEmpleado } from './ComisionesEmpleado';
import { ContactosEmergenciaEmpleado } from './ContactosEmergenciaEmpleado';
import { ValoracionesEmpleado } from './ValoracionesEmpleado';
import { DashboardEmpleado } from './DashboardEmpleado';
import { ActionButton } from '../common/ActionButton';

interface EmpleadoDetalleModalProps {
  visible: boolean;
  empleado: Empleado | null;
  onClose: () => void;
  onUpdate: (empleado: Partial<Empleado>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const EmpleadoDetalleModal = ({
  visible,
  empleado,
  onClose,
  onUpdate,
  onDelete,
  isLoading
}: EmpleadoDetalleModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'info' | 'servicios' | 'permisos' | 'comisiones' | 'contactos' | 'valoraciones' | 'dashboard'>('info');
  const [asignarServicioVisible, setAsignarServicioVisible] = useState(false);
  
  const handleDelete = () => {
    if (!empleado) return;
    
    Alert.alert(
      'Eliminar Empleado',
      `¿Estás seguro de que deseas eliminar a ${empleado.nombres} ${empleado.apellidos}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (empleado.id) {
              onDelete(empleado.id);
            }
          }
        }
      ]
    );
  };
  
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  const handleCancelEditing = () => {
    setIsEditing(false);
  };
  
  const handleUpdate = async (data: Partial<Empleado>) => {
    await onUpdate(data);
    setIsEditing(false);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const renderTabs = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsScrollContainer}
      >
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, currentTab === 'info' && styles.activeTab]} 
            onPress={() => setCurrentTab('info')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={currentTab === 'info' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'info' && styles.activeTabText
              ]}
            >
              Información
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentTab === 'servicios' && styles.activeTab]} 
            onPress={() => setCurrentTab('servicios')}
          >
            <Ionicons 
              name="medical" 
              size={20} 
              color={currentTab === 'servicios' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'servicios' && styles.activeTabText
              ]}
            >
              Servicios
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentTab === 'permisos' && styles.activeTab]} 
            onPress={() => setCurrentTab('permisos')}
          >
            <Ionicons 
              name="key" 
              size={20} 
              color={currentTab === 'permisos' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'permisos' && styles.activeTabText
              ]}
            >
              Permisos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, currentTab === 'comisiones' && styles.activeTab]} 
            onPress={() => setCurrentTab('comisiones')}
          >
            <Ionicons 
              name="cash" 
              size={20} 
              color={currentTab === 'comisiones' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'comisiones' && styles.activeTabText
              ]}
            >
              Comisiones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, currentTab === 'contactos' && styles.activeTab]} 
            onPress={() => setCurrentTab('contactos')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={currentTab === 'contactos' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'contactos' && styles.activeTabText
              ]}
            >
              Contactos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, currentTab === 'valoraciones' && styles.activeTab]} 
            onPress={() => setCurrentTab('valoraciones')}
          >
            <Ionicons 
              name="star" 
              size={20} 
              color={currentTab === 'valoraciones' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'valoraciones' && styles.activeTabText
              ]}
            >
              Valoraciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, currentTab === 'dashboard' && styles.activeTab]} 
            onPress={() => setCurrentTab('dashboard')}
          >
            <Ionicons 
              name="stats-chart" 
              size={20} 
              color={currentTab === 'dashboard' ? colors.primary : colors.text} 
            />
            <Text 
              style={[
                styles.tabText, 
                currentTab === 'dashboard' && styles.activeTabText
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  const renderInfoContent = () => {
    if (!empleado) return null;
    
    return (
      <View style={styles.infoContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="person-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Nombre completo</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.nombres} {empleado.apellidos}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="card-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Identificación</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.identificacion || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="calendar-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Fecha de nacimiento</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(empleado.fecha_nacimiento)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="mail-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="call-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Teléfono</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.telefono}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="globe-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>País</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.direccion_pais || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="business-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Ciudad</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.direccion_ciudad || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="location-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Dirección</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.direccion_detalle || 'No disponible'}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Profesional</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="school-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Nivel de estudio</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.nivel_estudio || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="document-text-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Tipo de contrato</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.tipo_contrato || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="briefcase-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Cargo</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.cargo || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="trending-up-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Nivel de crecimiento</Text>
            </View>
            <Text style={styles.infoValue}>{empleado.nivel_crecimiento || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="calendar-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Fecha de inicio</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(empleado.fecha_inicio_contrato)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Estado para reservas</Text>
            </View>
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusIndicator, 
                  { backgroundColor: empleado.activo_para_reservas ? colors.success : colors.error }
                ]} 
              />
              <Text style={styles.infoValue}>
                {empleado.activo_para_reservas ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="color-palette-outline" size={18} color={colors.text} style={styles.infoIcon} />
              <Text style={styles.labelText}>Color asignado</Text>
            </View>
            <View style={styles.colorContainer}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: empleado.color_asignado || '#4287f5' }
                ]} 
              />
              <Text style={styles.infoValue}>{empleado.color_asignado || '#4287f5'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const renderServiciosContent = () => {
    if (!empleado) return null;
    
    return (
      <ServiciosAsignadosEmpleado 
        empleadoId={empleado.id}
        onAsignarServicio={() => setAsignarServicioVisible(true)}
        tiendaId={empleado.tiendaId?.toString() || '1'}
      />
    );
  };
  
  const renderPermisosContent = () => {
    if (!empleado) return null;
    
    return (
      <PermisosEmpleado 
        empleadoId={empleado.id}
      />
    );
  };
  
  const renderComisionesContent = () => {
    if (!empleado) return null;
    
    return (
      <ComisionesEmpleado 
        empleadoId={empleado.id}
      />
    );
  };

  const renderContactosContent = () => {
    if (!empleado) return null;
    
    return (
      <ContactosEmergenciaEmpleado 
        empleadoId={empleado.id}
      />
    );
  };

  const renderValoracionesContent = () => {
    if (!empleado) return null;
    
    return (
      <ValoracionesEmpleado 
        empleadoId={empleado.id}
      />
    );
  };

  const renderDashboardContent = () => {
    if (!empleado) return null;
    
    return (
      <DashboardEmpleado 
        empleadoId={empleado.id}
        nombre={`${empleado.nombres} ${empleado.apellidos}`}
      />
    );
  };
  
  if (!empleado) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      {isEditing ? (
        <EmpleadoForm
          empleado={empleado}
          onSubmit={handleUpdate}
          onCancel={handleCancelEditing}
          isLoading={isLoading}
        />
      ) : (
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles del Empleado</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleStartEditing} style={styles.actionButton}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {empleado.foto_url ? (
                <Image source={{ uri: empleado.foto_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {empleado.nombres ? empleado.nombres.charAt(0) : ''}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{empleado.nombres} {empleado.apellidos}</Text>
              <Text style={styles.profileRole}>{empleado.cargo || 'Sin cargo asignado'}</Text>
              <View style={styles.statusBadge}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: empleado.activo_para_reservas ? colors.success : colors.error }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {empleado.activo_para_reservas ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>
          
          {renderTabs()}
          
          <View style={styles.contentContainer}>
            {currentTab === 'info' && renderInfoContent()}
            {currentTab === 'servicios' && renderServiciosContent()}
            {currentTab === 'permisos' && renderPermisosContent()}
            {currentTab === 'comisiones' && renderComisionesContent()}
            {currentTab === 'contactos' && renderContactosContent()}
            {currentTab === 'valoraciones' && renderValoracionesContent()}
            {currentTab === 'dashboard' && renderDashboardContent()}
          </View>
          
          <AsignarServicioModal 
            visible={asignarServicioVisible}
            empleadoId={empleado?.id || ''}
            onClose={() => setAsignarServicioVisible(false)}
            onSuccess={() => {
              setAsignarServicioVisible(false);
              // Forzar actualización de la lista de servicios
              setCurrentTab('info');
              setTimeout(() => setCurrentTab('servicios'), 100);
            }}
          />
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: colors.text + 'AA',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.text + 'AA',
  },
  tabsScrollContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
    backgroundColor: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  infoContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 14,
    color: colors.text + '99',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text + '99',
    textAlign: 'center',
    marginTop: 8,
  },
});
