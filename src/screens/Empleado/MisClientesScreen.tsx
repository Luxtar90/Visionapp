// src/screens/Empleado/MisClientesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  fecha_registro: string;
  ultima_visita?: string;
  activo: boolean;
  tienda_id: string;
}

export default function MisClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const fetchClientes = async () => {
      try {
        // Aquí se llamaría a la API para obtener los clientes
        // const response = await getClientesByEmpleado(empleadoId);
        
        // Datos de ejemplo
        const mockData: Cliente[] = [
          {
            id: '1',
            nombre: 'María',
            apellido: 'González',
            email: 'maria.gonzalez@ejemplo.com',
            telefono: '555-123-4567',
            direccion: 'Calle Principal 123',
            fecha_registro: '2025-01-15',
            ultima_visita: '2025-04-10',
            activo: true,
            tienda_id: '1'
          },
          {
            id: '2',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@ejemplo.com',
            telefono: '555-987-6543',
            fecha_registro: '2025-02-20',
            ultima_visita: '2025-04-05',
            activo: true,
            tienda_id: '1'
          },
          {
            id: '3',
            nombre: 'Ana',
            apellido: 'Martínez',
            email: 'ana.martinez@ejemplo.com',
            telefono: '555-456-7890',
            direccion: 'Avenida Central 456',
            fecha_registro: '2025-03-10',
            activo: true,
            tienda_id: '1'
          },
        ];
        
        setClientes(mockData);
        setFilteredClientes(mockData);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredClientes(clientes);
      return;
    }
    
    const filtered = clientes.filter(cliente => {
      const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      return (
        fullName.includes(text.toLowerCase()) ||
        cliente.email.toLowerCase().includes(text.toLowerCase()) ||
        cliente.telefono.includes(text)
      );
    });
    
    setFilteredClientes(filtered);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Clientes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Cargando clientes...</Text>
        </View>
      ) : filteredClientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No se encontraron clientes con esa búsqueda' : 'No tienes clientes asignados'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.clienteItem}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {item.nombre.charAt(0)}{item.apellido.charAt(0)}
                </Text>
              </View>
              <View style={styles.clienteInfo}>
                <Text style={styles.clienteName}>
                  {item.nombre} {item.apellido}
                </Text>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={14} color="#777" />
                  <Text style={styles.contactText}>{item.telefono}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={14} color="#777" />
                  <Text style={styles.contactText}>{item.email}</Text>
                </View>
                <View style={styles.visitaRow}>
                  <Text style={styles.visitaLabel}>Última visita:</Text>
                  <Text style={styles.visitaDate}>{formatDate(item.ultima_visita)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 4,
  },
  visitaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  visitaLabel: {
    fontSize: 12,
    color: '#999',
  },
  visitaDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});
