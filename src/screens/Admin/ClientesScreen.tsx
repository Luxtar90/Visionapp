// src/screens/Admin/ClientesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ActionButton } from '../../components/common/ActionButton';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusMessage } from '../../components/common/StatusMessage';
import { getClientes } from '../../api/clientes.api';
import { Cliente } from '../../interfaces/Cliente';
import { colors } from '../../theme/colors';
import { ConvertirClienteModal } from '../../components/Admin/ConvertirClienteModal';

export const ClientesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getClientes();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los clientes. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useFocusEffect(
    useCallback(() => {
      loadClientes();
    }, [loadClientes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadClientes();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(
        cliente => 
          cliente.nombres.toLowerCase().includes(text.toLowerCase()) ||
          cliente.apellidos.toLowerCase().includes(text.toLowerCase()) ||
          cliente.email.toLowerCase().includes(text.toLowerCase()) ||
          cliente.telefono.includes(text)
      );
      setFilteredClientes(filtered);
    }
  };

  const handleNuevoCliente = () => {
    navigation.navigate('NuevoClientes');
  };

  const handleClientePress = (cliente: Cliente) => {
    navigation.navigate('DetalleCliente', { cliente });
  };

  const handleConvertirEmpleado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModalVisible(true);
  };

  const handleConversionExitosa = () => {
    setStatusMessage({
      type: 'success',
      message: 'Cliente convertido a empleado exitosamente'
    });
    loadClientes();
  };

  const renderClienteItem = ({ item }: { item: Cliente }) => (
    <View style={styles.clienteItemContainer}>
      <TouchableOpacity 
        style={styles.clienteItem}
        onPress={() => handleClientePress(item)}
      >
        <View style={styles.clienteAvatar}>
          <Text style={styles.clienteInitials}>
            {item.nombres.charAt(0)}{item.apellidos.charAt(0)}
          </Text>
        </View>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteName}>{item.nombres} {item.apellidos}</Text>
          <Text style={styles.clienteDetail}>{item.email}</Text>
          <Text style={styles.clienteDetail}>{item.telefono}</Text>
        </View>
        <View style={styles.clienteActions}>
          <TouchableOpacity 
            style={styles.convertIconButton}
            onPress={() => handleConvertirEmpleado(item)}
          >
            <Ionicons name="person-add" size={18} color={colors.primary} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={colors.text + '80'} />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <View style={styles.container}>
        {statusMessage && (
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
            onDismiss={() => setStatusMessage(null)}
          />
        )}
        
        <ConvertirClienteModal
          visible={modalVisible}
          cliente={clienteSeleccionado}
          onClose={() => setModalVisible(false)}
          onSuccess={handleConversionExitosa}
        />
        
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Clientes</Text>
            <ActionButton
              label="Nuevo Cliente"
              onPress={handleNuevoCliente}
              icon="add-circle"
            />
          </View>
          
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Buscar clientes..."
            />
          </View>
        </View>
        
        <FlatList
          data={filteredClientes}
          renderItem={renderClienteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.text + '40'} />
              <Text style={styles.emptyText}>
                {searchQuery.trim() !== '' 
                  ? 'No se encontraron clientes que coincidan con la búsqueda' 
                  : 'No hay clientes disponibles'}
              </Text>
              {!isLoading && (
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.refreshText}>Actualizar</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    padding: 12,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  clienteItemContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden',
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  clienteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clienteInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  clienteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clienteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convertIconButton: {
    padding: 8,
    marginRight: 4,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  clienteDetail: {
    fontSize: 14,
    color: colors.text + '80',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text + '80',
    textAlign: 'center',
    marginTop: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  refreshText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
});
