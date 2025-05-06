// src/screens/Admin/DetalleClienteScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Componentes
import { Header } from '../../components/common/Header';
import { ClienteForm } from '../../components/Clientes/ClienteForm';
import { StatusMessage } from '../../components/common/StatusMessage';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ActionButton } from '../../components/common/ActionButton';

// API
import { getClienteById, updateCliente, deleteCliente, toggleClienteActivo } from '../../api/clientes.api';

// Interfaces
import { Cliente } from '../../interfaces/Cliente';

// Tema
import { colors } from '../../theme/colors';

// Tipos para la navegación
type RootStackParamList = {
  Clientes: undefined;
  DetalleCliente: { cliente: Cliente };
};

type DetalleClienteScreenProps = {
  route?: any;
  navigation?: any;
};

export const DetalleClienteScreen: React.FC<DetalleClienteScreenProps> = (props) => {
  // Navegación
  const navigation = useNavigation();
  const route = useRoute();
  
  // Estado
  const [cliente, setCliente] = useState<Cliente | null>(route.params?.cliente || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Cargar datos del cliente
  useEffect(() => {
    if (cliente?.id) {
      loadClienteDetails(cliente.id.toString());
    }
  }, []);

  const loadClienteDetails = async (clienteId: string) => {
    try {
      setIsLoading(true);
      const data = await getClienteById(clienteId);
      setCliente(data);
    } catch (error) {
      console.error('Error al cargar detalles del cliente:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los detalles del cliente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar cliente
  const handleUpdateCliente = async (data: Partial<Cliente>) => {
    if (!cliente?.id) return;
    
    try {
      setIsLoading(true);
      const updatedCliente = await updateCliente(cliente.id.toString(), data);
      setCliente(updatedCliente);
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        message: 'Cliente actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al actualizar el cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = () => {
    if (!cliente?.id) return;
    
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar a ${cliente.nombres} ${cliente.apellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteCliente(cliente.id.toString());
              setStatusMessage({
                type: 'success',
                message: 'Cliente eliminado correctamente'
              });
              // Volver a la lista después de un breve retraso
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              console.error('Error al eliminar cliente:', error);
              setStatusMessage({
                type: 'error',
                message: 'Error al eliminar el cliente. Por favor, intenta de nuevo.'
              });
              setIsLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Cambiar estado activo/inactivo
  const handleToggleActivo = async () => {
    if (!cliente?.id) return;
    
    try {
      setIsLoading(true);
      // En la nueva estructura, consideramos que un cliente está activo si tiene tiendaId
      const isActive = cliente.tiendaId !== null;
      
      // Si está activo, lo desactivamos (quitamos la tienda)
      // Si está inactivo, lo activamos (asignamos la tienda actual)
      const updatedData: Partial<Cliente> = {
        tiendaId: isActive ? null : cliente.tiendaId
      };
      
      const updatedCliente = await updateCliente(cliente.id.toString(), updatedData);
      setCliente(updatedCliente);
      setStatusMessage({
        type: 'success',
        message: `Cliente ${isActive ? 'desactivado' : 'activado'} correctamente`
      });
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado del cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !cliente) {
    return <LoadingIndicator message="Cargando detalles del cliente..." />;
  }

  if (!cliente) {
    return (
      <View style={styles.container}>
        <Header 
          title="Detalle de Cliente" 
          showBackButton 
          onBackPress={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <StatusMessage 
            type="error" 
            message="No se pudo cargar la información del cliente" 
          />
          <ActionButton 
            label="Volver" 
            onPress={() => navigation.goBack()} 
            variant="primary" 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={isEditing ? "Editar Cliente" : "Detalle de Cliente"} 
        showBackButton 
        onBackPress={() => isEditing ? setIsEditing(false) : navigation.goBack()} 
        rightComponent={
          !isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteCliente} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleToggleActivo} 
                style={[styles.headerButton, { marginLeft: 10 }]}
              >
                <Ionicons 
                  name={cliente.tiendaId ? "checkmark-circle-outline" : "close-circle-outline"} 
                  size={24} 
                  color={cliente.tiendaId ? colors.success : colors.warning} 
                />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      {isEditing ? (
        <ClienteForm 
          cliente={cliente} 
          onSubmit={handleUpdateCliente} 
          onCancel={() => setIsEditing(false)} 
          isLoading={isLoading}
        />
      ) : (
        <ScrollView style={styles.content}>
          {/* Información básica */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre completo:</Text>
              <Text style={styles.infoValue}>{cliente.nombres} {cliente.apellidos}</Text>
            </View>
          </View>
          
          {/* Dirección */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Dirección</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>
                {cliente.direccion_detalle || 'No especificada'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ciudad/País:</Text>
              <Text style={styles.infoValue}>
                {cliente.direccion_ciudad || 'No especificada'}{cliente.direccion_pais ? `, ${cliente.direccion_pais}` : ''}
              </Text>
            </View>
          </View>
          
          {/* Información adicional */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Información Adicional</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: cliente.tiendaId ? colors.success : colors.warning }
                  ]} 
                />
                <Text style={styles.infoValue}>
                  {cliente.tiendaId ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de registro:</Text>
              <Text style={styles.infoValue}>
                {cliente.fecha_nacimiento || 'No especificada'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última visita:</Text>
              <Text style={styles.infoValue}>
                {cliente.origen_cita || 'No registrada'}
              </Text>
            </View>
          </View>
          
          {/* Notas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Notas</Text>
            </View>
            <Text style={styles.notesText}>
              {cliente.puntos_acumulados ? cliente.puntos_acumulados.toString() : 'No hay notas para este cliente.'}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text + '99',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
});

export default DetalleClienteScreen;
