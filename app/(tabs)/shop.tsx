import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  ImageBackground
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Store {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  uniqueCode: string;
  imagen: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  imageUrl: string;
  store: Store;
  isFeatured: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration: number;
  store: Store;
  isFeatured: boolean;
}

interface ClientStore {
  idCliente: number;
  idTienda: number;
  estado: boolean;
  puntosAcumulados: number;
  ultimaVisita: string;
  fechaRegistro: string;
  store: Store;
}

export default function ShopScreen() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const scrollY = new Animated.Value(0);
  const { user } = useAuth();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [250, 100],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    const getUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.error('Error getting user name:', error);
      }
    };
    getUserName();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      const currentStoreId = await AsyncStorage.getItem("currentStoreId");
      
      if (!token || !userId) {
        console.error("❌ No token or userId found");
        return;
      }

      console.log("📝 Fetching data with:", {
        userId,
        currentStoreId: currentStoreId || 'Not set',
        token: token.substring(0, 10) + "..."
      });

      const headers = { Authorization: `Bearer ${token}` };

      // Primero verificamos la relación cliente-tienda
      console.log("📡 Fetching client-stores...");
      try {
        const clientStoreResponse = await axios.get(
          `${API_URL}/client-stores/client/${userId}`,
          { headers }
        );

        console.log("✅ Client-stores response:", clientStoreResponse.data);

        if (!clientStoreResponse.data || clientStoreResponse.data.length === 0) {
          console.error("❌ No stores found for this client");
          return;
        }

        // Si no hay tienda seleccionada, usamos la primera
        let storeIdToUse = currentStoreId || '';
        if (!storeIdToUse) {
          const firstStore = clientStoreResponse.data[0].store;
          storeIdToUse = firstStore.id.toString();
          console.log("📝 Using first store:", {
            id: firstStore.id,
            name: firstStore.name
          });
          await AsyncStorage.setItem("currentStoreId", storeIdToUse);
          await AsyncStorage.setItem("currentStoreName", firstStore.name);
        }

        console.log("🏪 Store ID to use:", storeIdToUse);

        console.log("📡 Fetching data for ID:", storeIdToUse);

        try {
          // Obtenemos los datos de la tienda - usando la tienda que ya tenemos del clientStore
          const storeData = clientStoreResponse.data[0].store;
          setStore(storeData);

          try {
            // Obtenemos los servicios
            console.log("📡 Fetching services");
            const servicesResponse = await axios.get(
              `${API_URL}/services`,
              { headers }
            );
            
            // Filtramos los servicios por tienda usando store.id
            const storeServices = servicesResponse.data
              .filter((service: Service) => service.store?.id === parseInt(storeIdToUse));
            
            console.log(`✅ Found ${storeServices.length} services for store ${storeIdToUse}`);
            setServices(storeServices);
          } catch (error: any) {
            console.error("❌ Error fetching services:", error.message);
            setServices([]);
          }

          try {
            // Obtenemos los productos
            console.log("📡 Fetching products");
            const productsResponse = await axios.get(
              `${API_URL}/products`,
              { headers }
            );
            
            // Filtramos los productos por tienda usando store.id
            const storeProducts = productsResponse.data
              .filter((product: Product) => product.store?.id === parseInt(storeIdToUse));
            
            console.log(`✅ Found ${storeProducts.length} products for store ${storeIdToUse}`);
            setProducts(storeProducts);
          } catch (error: any) {
            console.error("❌ Error fetching products:", error.message);
            setProducts([]);
          }

        } catch (error: any) {
          console.error("❌ Error in data fetching:", error.message);
          // Si falla la obtención de datos, al menos mostramos la información básica de la tienda
          setStore(clientStoreResponse.data[0].store);
          setProducts([]);
          setServices([]);

          // Mostramos un mensaje al usuario
          Alert.alert(
            "Error",
            "No se pudieron cargar los productos y servicios",
            [{ text: "OK" }]
          );
        }
      } catch (error: any) {
        console.error("❌ Error fetching client-stores:", error.message);
      }
    } catch (error: any) {
      console.error("❌ Error in fetchData:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    Alert.alert(
      product.name,
      `${product.description}\n\nPrecio: $${product.price}\nStock: ${product.stock}`
    );
  };

  const handleServicePress = (service: Service) => {
    Alert.alert(
      service.name,
      `${service.description}\n\nPrecio: $${service.price}\nDuración: ${service.duration} min`
    );
  };

  const renderServiceItem = (service: Service) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardInner}>
        <View style={styles.serviceBackground}>
          <View style={styles.serviceIcon}>
            <Feather name="scissors" size={30} color="#FFFFFF" />
          </View>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio:</Text>
          <Text style={styles.price}>${service.price}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Feather name="clock" size={14} style={styles.durationIcon} />
          <Text style={styles.duration}>{service.duration} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (product: Product) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardInner}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.cardImage}
            onError={() => console.log(`Error loading image for product: ${product.name}`)}
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderContainer]}>
            <Feather name="package" size={40} color="#FFD700" />
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
        <View style={styles.stockContainer}>
          <Text style={styles.cardStock}>{product.stock} en stock</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio:</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80' }}
        style={styles.headerBackground}
      >
        <LinearGradient
          colors={['rgba(107, 70, 193, 0.85)', 'rgba(107, 70, 193, 0.85)']}
          style={styles.headerOverlay}
        >
          <Animated.View style={[styles.header, { height: headerHeight }]}>
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>¡Bienvenido{userName ? `, ${userName}` : ''}!</Text>
                <Text style={styles.welcomeSubtitle}>Tu belleza, nuestra pasión</Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Feather name="scissors" size={24} color="#FFD700" />
                </View>
                <Text style={styles.statNumber}>{services.length}</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Feather name="package" size={24} color="#FFD700" />
                </View>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>Productos</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>

      <Animated.ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <LinearGradient
              colors={['#FFF5F5', '#FED7D7']}
              style={styles.errorBanner}
            >
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchData}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.mainContent}>
            {services.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="scissors" size={24} color="#1a1a1a" />
                  <Text style={styles.sectionTitle}>Servicios de Belleza</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Descubre nuestra exclusiva selección de servicios profesionales
                </Text>
                <View style={styles.servicesGrid}>
                  {services.map(service => (
                    <React.Fragment key={`service-${service.id}`}>
                      {renderServiceItem(service)}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {products.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="package" size={24} color="#1a1a1a" />
                  <Text style={styles.sectionTitle}>Productos Profesionales</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Cuida tu belleza con nuestra línea de productos selectos
                </Text>
                <View style={styles.productsGrid}>
                  {products.map(product => (
                    <React.Fragment key={`product-${product.id}`}>
                      {renderProductItem(product)}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {services.length === 0 && products.length === 0 && (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#FFF8E1', '#FFFDE7']}
                  style={styles.emptyStateGradient}
                >
                  <Feather name="alert-circle" size={64} color="#FFD700" />
                  <Text style={styles.emptyStateText}>
                    Estamos actualizando nuestro catálogo
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Vuelve pronto para descubrir nuestros servicios y productos
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        )}
        <View style={styles.footer} />
      </Animated.ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBackground: {
    height: 280,
    width: '100%',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(107, 70, 193, 0.85)',
  },
  header: {
    justifyContent: 'space-between',
    padding: 20,
  },
  welcomeContainer: {
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  mainContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardInner: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  serviceBackground: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  cardContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666666',
  },
  price: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  durationIcon: {
    marginRight: 4,
    color: '#666666',
  },
  duration: {
    fontSize: 13,
    color: '#666666',
  },
  stockContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardStock: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#6B46C1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 16,
  },
  emptyStateGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    padding: 16,
  },
  errorBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    height: 16,
  },
  placeholderContainer: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666666',
  },
});
