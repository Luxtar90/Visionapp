// src/screens/Admin/ClientesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ActionButton } from '../../components/common/ActionButton';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusMessage } from '../../components/common/StatusMessage';
import { getClientes } from '../../api/clientes.api';
import { Cliente } from '../../interfaces/Cliente';
import { colors } from '../../theme/colors';

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
    navigation.navigate('NuevoCliente');
  };

  const handleClientePress = (cliente: Cliente) => {
    navigation.navigate('DetalleCliente', { cliente });
  };

  const renderClienteItem = ({ item }: { item: Cliente }) => (
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
      <Ionicons name="chevron-forward" size={20} color={colors.text + '80'} />
    </TouchableOpacity>
  );

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
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clienteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clienteInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  clienteDetail: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text + '80',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
  },
  refreshText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
});
