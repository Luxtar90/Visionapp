// src/components/Empleados/ContactosEmergenciaEmpleado.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ContactoEmergencia, getContactosEmergenciaPorEmpleado, eliminarContactoEmergencia } from '../../api/contactosEmergencia.api';
import { EmptyState } from '../common/EmptyState';
import { ContactoEmergenciaForm } from '../../components/Empleados/ContactoEmergenciaForm';

interface ContactosEmergenciaEmpleadoProps {
  empleadoId: string;
}

export const ContactosEmergenciaEmpleado = ({ 
  empleadoId 
}: ContactosEmergenciaEmpleadoProps) => {
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [contactoEditar, setContactoEditar] = useState<ContactoEmergencia | null>(null);

  const cargarContactos = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, descomentar la siguiente línea:
      // const data = await getContactosEmergenciaPorEmpleado(empleadoId);
      
      // Datos de ejemplo para desarrollo
      const mockData: ContactoEmergencia[] = [
        {
          id: '1',
          empleadoId: empleadoId,
          nombre: 'Juan Pérez',
          relacion: 'Padre',
          telefono: '555-123-4567',
          email: 'juan.perez@ejemplo.com',
          es_principal: true
        },
        {
          id: '2',
          empleadoId: empleadoId,
          nombre: 'María López',
          relacion: 'Madre',
          telefono: '555-987-6543',
          email: 'maria.lopez@ejemplo.com',
          es_principal: false
        }
      ];
      
      setContactos(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar contactos de emergencia:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudieron cargar los contactos de emergencia');
    }
  };

  useEffect(() => {
    cargarContactos();
  }, [empleadoId]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarContactos().then(() => setRefreshing(false));
  };

  const handleEliminarContacto = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este contacto de emergencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // En una implementación real, descomentar la siguiente línea:
              // await eliminarContactoEmergencia(id);
              
              // Actualización local para desarrollo
              setContactos(prev => prev.filter(c => c.id !== id));
              
              Alert.alert('Éxito', 'Contacto eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar contacto:', error);
              Alert.alert('Error', 'No se pudo eliminar el contacto');
            }
          }
        }
      ]
    );
  };

  const handleEditarContacto = (contacto: ContactoEmergencia) => {
    setContactoEditar(contacto);
    setIsFormVisible(true);
  };

  const handleGuardarContacto = (contacto: ContactoEmergencia) => {
    if (contactoEditar) {
      // Actualización
      setContactos(prev => 
        prev.map(c => c.id === contacto.id ? contacto : c)
      );
    } else {
      // Creación
      setContactos(prev => [
        ...prev, 
        { ...contacto, id: Math.random().toString(36).substr(2, 9) }
      ]);
    }
    
    setIsFormVisible(false);
    setContactoEditar(null);
  };

  const renderContacto = ({ item }: { item: ContactoEmergencia }) => {
    return (
      <View style={styles.contactoCard}>
        <View style={styles.contactoHeader}>
          <View style={styles.contactoInfo}>
            <Text style={styles.contactoNombre}>{item.nombre}</Text>
            <Text style={styles.contactoRelacion}>{item.relacion}</Text>
          </View>
          
          {item.es_principal && (
            <View style={styles.principalBadge}>
              <Text style={styles.principalText}>Principal</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactoDetalles}>
          <View style={styles.detalleItem}>
            <Ionicons name="call-outline" size={16} color={colors.text} />
            <Text style={styles.detalleText}>{item.telefono}</Text>
          </View>
          
          {item.email && (
            <View style={styles.detalleItem}>
              <Ionicons name="mail-outline" size={16} color={colors.text} />
              <Text style={styles.detalleText}>{item.email}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactoAcciones}>
          <TouchableOpacity 
            style={styles.accionButton}
            onPress={() => handleEditarContacto(item)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.accionButton}
            onPress={() => handleEliminarContacto(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contactos}
        renderItem={renderContacto}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            icon="people"
            message="No hay contactos de emergencia"
            description="Este empleado no tiene contactos de emergencia registrados."
          />
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setContactoEditar(null);
          setIsFormVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Agregar contacto</Text>
      </TouchableOpacity>
      
      <ContactoEmergenciaForm
        visible={isFormVisible}
        empleadoId={empleadoId}
        contacto={contactoEditar}
        onClose={() => {
          setIsFormVisible(false);
          setContactoEditar(null);
        }}
        onSave={handleGuardarContacto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  contactoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactoInfo: {
    flex: 1,
  },
  contactoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  contactoRelacion: {
    fontSize: 14,
    color: colors.text + 'AA',
  },
  principalBadge: {
    backgroundColor: colors.primary + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  principalText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  contactoDetalles: {
    marginBottom: 12,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detalleText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  contactoAcciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
    paddingTop: 12,
  },
  accionButton: {
    padding: 8,
    marginLeft: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
