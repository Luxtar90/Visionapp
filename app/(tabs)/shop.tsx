import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../app/contexts/AuthContext';

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
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
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
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    height: 300,
    width: '100%',
  },
  headerOverlay: {
    flex: 1,
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 8,
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  mainContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardInner: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  serviceBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    color: '#FFB300',
    fontWeight: 'bold',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  durationIcon: {
    marginRight: 4,
    color: '#666666',
  },
  duration: {
    fontSize: 14,
    color: '#666666',
  },
  stockContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  serviceIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFD700',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyState: {
    padding: 20,
  },
  emptyStateGradient: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  errorContainer: {
    padding: 20,
  },
  errorBanner: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    height: 20,
  },
  placeholderContainer: {
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
});
