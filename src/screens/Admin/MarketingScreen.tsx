// src/screens/Admin/MarketingScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaRegistro: string;
  ultimaVisita: string;
  origen: string;
  avatar: string;
  gastosTotal: number;
  visitas: number;
}

interface Campania {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'programada' | 'finalizada';
  alcance: number;
  conversion: number;
  costo: number;
  roi: number;
}

const clientesMock: Cliente[] = [
  {
    id: 1,
    nombre: 'María López',
    email: 'maria@example.com',
    telefono: '123-456-7890',
    fechaRegistro: '2025-01-15',
    ultimaVisita: '2025-05-01',
    origen: 'Recomendación',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=random',
    gastosTotal: 350,
    visitas: 8
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '123-456-7891',
    fechaRegistro: '2025-02-20',
    ultimaVisita: '2025-04-28',
    origen: 'Google',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=random',
    gastosTotal: 220,
    visitas: 5
  },
  {
    id: 3,
    nombre: 'Ana García',
    email: 'ana@example.com',
    telefono: '123-456-7892',
    fechaRegistro: '2025-03-10',
    ultimaVisita: '2025-05-03',
    origen: 'Instagram',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=random',
    gastosTotal: 480,
    visitas: 12
  }
];

const campaniasMock: Campania[] = [
  {
    id: 1,
    nombre: 'Promoción Primavera',
    descripcion: 'Descuentos en servicios de belleza para la temporada',
    fechaInicio: '2025-03-21',
    fechaFin: '2025-04-21',
    estado: 'finalizada',
    alcance: 1200,
    conversion: 8.5,
    costo: 300,
    roi: 2.1
  },
  {
    id: 2,
    nombre: 'Día de la Madre',
    descripcion: 'Paquetes especiales para mamá',
    fechaInicio: '2025-05-01',
    fechaFin: '2025-05-10',
    estado: 'activa',
    alcance: 800,
    conversion: 10.2,
    costo: 250,
    roi: 1.8
  },
  {
    id: 3,
    nombre: 'Verano 2025',
    descripcion: 'Prepárate para el verano con nuestros tratamientos',
    fechaInicio: '2025-06-01',
    fechaFin: '2025-08-31',
    estado: 'programada',
    alcance: 0,
    conversion: 0,
    costo: 500,
    roi: 0
  }
];

const MarketingScreen = () => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'campañas' | 'kpis' | 'integraciones'>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [campanias, setCampanias] = useState<Campania[]>(campaniasMock);
  const [searchText, setSearchText] = useState('');
  
  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchText.toLowerCase()) ||
    cliente.origen.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const filteredCampanias = campanias.filter(campania => 
    campania.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    campania.descripcion.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const renderClienteItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity style={styles.clienteCard}>
      <Image source={{ uri: item.avatar }} style={styles.clienteAvatar} />
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNombre}>{item.nombre}</Text>
        <Text style={styles.clienteEmail}>{item.email}</Text>
        <View style={styles.clienteDetalles}>
          <View style={styles.detalle}>
            <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>Registro: {item.fechaRegistro}</Text>
          </View>
          <View style={styles.detalle}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>Última visita: {item.ultimaVisita}</Text>
          </View>
        </View>
        <View style={styles.clienteDetalles}>
          <View style={styles.detalle}>
            <Ionicons name="globe-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>Origen: {item.origen}</Text>
          </View>
          <View style={styles.detalle}>
            <Ionicons name="cash-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>Gastos: ${item.gastosTotal}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  const renderCampaniaItem = ({ item }: { item: Campania }) => (
    <TouchableOpacity style={styles.campaniaCard}>
      <View style={styles.campaniaHeader}>
        <Text style={styles.campaniaNombre}>{item.nombre}</Text>
        <View style={[
          styles.estadoIndicator, 
          { 
            backgroundColor: 
              item.estado === 'activa' ? '#4CAF50' : 
              item.estado === 'programada' ? '#2196F3' : 
              '#9E9E9E'
          }
        ]}>
          <Text style={styles.estadoText}>
            {item.estado === 'activa' ? 'Activa' : 
             item.estado === 'programada' ? 'Programada' : 
             'Finalizada'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.campaniaDescripcion}>{item.descripcion}</Text>
      
      <View style={styles.campaniaDates}>
        <Text style={styles.campaniaDate}>
          <Ionicons name="calendar-outline" size={14} color={colors.textLight} /> 
          {item.fechaInicio} - {item.fechaFin}
        </Text>
      </View>
      
      {item.estado !== 'programada' && (
        <View style={styles.campaniaStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Alcance</Text>
            <Text style={styles.statValue}>{item.alcance}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Conversión</Text>
            <Text style={styles.statValue}>{item.conversion}%</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Costo</Text>
            <Text style={styles.statValue}>${item.costo}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ROI</Text>
            <Text style={[
              styles.statValue, 
              { color: item.roi > 1 ? '#4CAF50' : colors.danger }
            ]}>{item.roi}x</Text>
          </View>
        </View>
      )}
      
      <View style={styles.campaniaActions}>
        <TouchableOpacity style={styles.campaniaAction}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.campaniaAction}>
          <Ionicons name="bar-chart-outline" size={16} color={colors.info} />
          <Text style={styles.actionText}>Analítica</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.campaniaAction}>
          <Ionicons name="share-social-outline" size={16} color="#FF9800" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MARKETING</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'clientes' ? "Buscar cliente..." : "Buscar campaña..."}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'clientes' && styles.activeTab]}
          onPress={() => setActiveTab('clientes')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'clientes' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'clientes' && styles.activeTabText
          ]}>Clientes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'campañas' && styles.activeTab]}
          onPress={() => setActiveTab('campañas')}
        >
          <Ionicons 
            name="megaphone-outline" 
            size={20} 
            color={activeTab === 'campañas' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'campañas' && styles.activeTabText
          ]}>Campañas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'kpis' && styles.activeTab]}
          onPress={() => setActiveTab('kpis')}
        >
          <Ionicons 
            name="analytics-outline" 
            size={20} 
            color={activeTab === 'kpis' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'kpis' && styles.activeTabText
          ]}>KPIs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'integraciones' && styles.activeTab]}
          onPress={() => setActiveTab('integraciones')}
        >
          <Ionicons 
            name="link-outline" 
            size={20} 
            color={activeTab === 'integraciones' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'integraciones' && styles.activeTabText
          ]}>Integraciones</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'clientes' && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.infoHighlight}>{filteredClientes.length}</Text> clientes encontrados
            </Text>
          </View>
          
          <FlatList
            data={filteredClientes}
            renderItem={renderClienteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      
      {activeTab === 'campañas' && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.infoHighlight}>{filteredCampanias.length}</Text> campañas encontradas
            </Text>
          </View>
          
          <FlatList
            data={filteredCampanias}
            renderItem={renderCampaniaItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      
      {activeTab === 'kpis' && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyStateTitle}>Análisis de KPIs</Text>
          <Text style={styles.emptyStateText}>
            Aquí podrás analizar el costo de adquisición de clientes,
            el retorno de inversión y otros indicadores clave.
          </Text>
          <TouchableOpacity style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Configurar KPIs</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'integraciones' && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="link-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyStateTitle}>Integraciones</Text>
          <Text style={styles.emptyStateText}>
            Conecta tu negocio con plataformas de meta y Google.
            Configura opciones para enlazar URLs y analiza el costo
            de adquisición de clientes.
          </Text>
          <TouchableOpacity style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Configurar Integraciones</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El módulo de marketing te permite gestionar clientes, crear un avatar para cada uno,
          analizar el origen de los clientes, crear campañas y medir su efectividad.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoHighlight: {
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for footer
  },
  clienteCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clienteAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  clienteEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  clienteDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detalleTexto: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  moreButton: {
    padding: 8,
  },
  campaniaCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaniaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaniaNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  estadoIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estadoText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  campaniaDescripcion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  campaniaDates: {
    marginBottom: 12,
  },
  campaniaDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  campaniaStats: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  campaniaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  campaniaAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    color: colors.text,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MarketingScreen;
