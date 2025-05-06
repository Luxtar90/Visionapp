// src/screens/Admin/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTiendasByUsuario, UsuarioTiendaRelacion } from '../../api/tiendas.api';
import { getServicios } from '../../api/servicios.api';
import { Tienda } from '../../interfaces/Tienda';
import { useNavigation } from '@react-navigation/native';

interface ModuleCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon, onPress, color = colors.primary }) => {
  return (
    <TouchableOpacity 
      style={[styles.moduleCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.moduleTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [tiendaActiva, setTiendaActiva] = useState<Tienda | null>(null);
  const [relaciones, setRelaciones] = useState<UsuarioTiendaRelacion[]>([]);
  const [serviciosCount, setServiciosCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar las relaciones usuario-tienda
        const relacionesData = await getTiendasByUsuario();
        setRelaciones(relacionesData);
        
        // Obtener la tienda activa desde AsyncStorage
        const tiendaIdString = await AsyncStorage.getItem('selectedTienda');
        
        if (tiendaIdString) {
          // Buscar la tienda activa en las relaciones
          const tiendaEncontrada = relacionesData.find(
            rel => rel.tienda.id.toString() === tiendaIdString
          );
          
          if (tiendaEncontrada) {
            setTiendaActiva(tiendaEncontrada.tienda);
            
            // Cargar servicios de la tienda activa
            const servicios = await getServicios(tiendaIdString);
            setServiciosCount(servicios.length);
          } else if (relacionesData.length > 0) {
            // Si no se encuentra la tienda activa pero hay tiendas disponibles, seleccionar la primera
            const primeraTienda = relacionesData[0].tienda;
            setTiendaActiva(primeraTienda);
            await AsyncStorage.setItem('selectedTienda', primeraTienda.id.toString());
            
            // Cargar servicios de la primera tienda
            const servicios = await getServicios(primeraTienda.id.toString());
            setServiciosCount(servicios.length);
          }
        } else if (relacionesData.length > 0) {
          // Si no hay tienda activa pero hay tiendas disponibles, seleccionar la primera
          const primeraTienda = relacionesData[0].tienda;
          setTiendaActiva(primeraTienda);
          await AsyncStorage.setItem('selectedTienda', primeraTienda.id.toString());
          
          // Cargar servicios de la primera tienda
          const servicios = await getServicios(primeraTienda.id.toString());
          setServiciosCount(servicios.length);
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('No se pudieron cargar los datos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleModulePress = (module: string) => {
    switch (module) {
      case 'business':
        // Navegar a la pantalla de información del negocio
        Alert.alert('Información del Negocio', 'Esta funcionalidad estará disponible próximamente.');
        break;
      case 'accounting':
        // Navegar a la pantalla de contabilidad
        navigation.navigate('Contabilidad' as never);
        break;
      case 'financial':
        // Navegar a la pantalla de informes financieros
        navigation.navigate('InformesFinancieros' as never);
        break;
      case 'services':
        // Navegar a la pantalla de catálogo de servicios
        navigation.navigate('CatalogoServicios' as never);
        break;
      case 'marketing':
        // Navegar a la pantalla de marketing
        navigation.navigate('Marketing' as never);
        break;
      case 'team':
        // Navegar a la pantalla de equipo
        navigation.navigate('Empleados' as never);
        break;
      case 'integrations':
        // Navegar a la pantalla de complementos
        Alert.alert('Complementos', 'Esta funcionalidad estará disponible próximamente.');
        break;
      case 'customers':
        // Navegar a la pantalla de clientes
        navigation.navigate('Clientes' as never);
        break;
      case 'kpi':
        // Navegar a la pantalla de informes KPI
        Alert.alert('Informes KPI', 'Esta funcionalidad estará disponible próximamente.');
        break;
      case 'calendar':
        // Navegar a la pantalla de calendario de reservas
        navigation.navigate('Reservas' as never);
        break;
      case 'client-management':
        // Navegar a la pantalla de gestión de clientes
        navigation.navigate('Clientes' as never);
        break;
      default:
        Alert.alert('Módulo', `Navegando al módulo: ${module}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            // Recargar datos
            setTimeout(() => {
              setLoading(false);
              setError('No se pudieron cargar los datos. Verifique su conexión a internet.');
            }, 2000);
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!tiendaActiva) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="business-outline" size={64} color={colors.textLight} />
        <Text style={styles.errorTitle}>No hay tiendas disponibles</Text>
        <Text style={styles.errorText}>
          No tienes tiendas asignadas. Contacta al administrador del sistema.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera con información de la tienda activa */}
        <View style={styles.storeHeader}>
          <Image 
            source={{ uri: tiendaActiva.logo_url || 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(tiendaActiva.nombre) }} 
            style={styles.storeImage} 
          />
          <View style={styles.storeInfo}>
            <View style={styles.storeNameContainer}>
              <Text style={styles.storeName}>{tiendaActiva.nombre}</Text>
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Activo</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewCount}>(207)</Text>
            </View>
            <Text style={styles.storeAddress}>
              {tiendaActiva.direccion}
            </Text>
            <Text style={styles.lastUpdate}>
              Actualizado el día de hoy, {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Botones de acción rápida */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Resumen', 'Esta funcionalidad estará disponible próximamente.')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="document-text-outline" size={22} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Resumen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Acciones', 'Esta funcionalidad estará disponible próximamente.')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="settings-outline" size={22} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Acciones</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de módulos administrativos */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>OPCIONES GENERALES</Text>
          
          <ModuleCard 
            title="Información del Negocio" 
            icon="business-outline" 
            onPress={() => handleModulePress('business')}
          />
          
          <ModuleCard 
            title="Contabilidad" 
            icon="calculator-outline" 
            onPress={() => handleModulePress('accounting')}
            color={colors.info}
          />
          
          <ModuleCard 
            title="Informes Financieros" 
            icon="bar-chart-outline" 
            onPress={() => handleModulePress('financial')}
            color="#4CAF50"
          />
          
          <ModuleCard 
            title={`Catálogo de Servicios (${serviciosCount})`}
            icon="list-outline" 
            onPress={() => handleModulePress('services')}
            color="#9C27B0"
          />
          
          <ModuleCard 
            title="Marketing" 
            icon="megaphone-outline" 
            onPress={() => handleModulePress('marketing')}
            color="#FF5722"
          />
          
          <ModuleCard 
            title="Equipo" 
            icon="people-outline" 
            onPress={() => handleModulePress('team')}
            color="#2196F3"
          />
          
          <ModuleCard 
            title="Complementos" 
            icon="extension-puzzle-outline" 
            onPress={() => handleModulePress('integrations')}
            color="#795548"
          />
          
          <ModuleCard 
            title="Clientes" 
            icon="person-outline" 
            onPress={() => handleModulePress('customers')}
            color="#607D8B"
          />
          
          <ModuleCard 
            title="Informes KPI" 
            icon="analytics-outline" 
            onPress={() => handleModulePress('kpi')}
            color="#FF9800"
          />
        </View>

        {/* Sección de reservas */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>RESERVAS</Text>
          
          <ModuleCard 
            title="Calendario de Reservas" 
            icon="calendar-outline" 
            onPress={() => handleModulePress('calendar')}
            color="#E91E63"
          />
          
          <ModuleCard 
            title="Gestión de Clientes" 
            icon="people-circle-outline" 
            onPress={() => handleModulePress('client-management')}
            color="#3F51B5"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  storeHeader: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  storeInfo: {
    marginTop: 8,
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  modulesSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});

export default DashboardScreen;