// src/screens/Cliente/PuntosScreen.tsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { usePuntosCliente } from '../../hooks/usePuntos';
import { Punto, TipoPunto, ResumenPuntosTienda } from '../../types/puntos.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PuntosScreen() {
  const { 
    puntos, 
    resumen, 
    resumenTienda,
    loading, 
    error,
    tiendaSeleccionada,
    setTiendaSeleccionada,
    fetchPuntos,
    fetchPuntosTienda
  } = usePuntosCliente();

  const [activeTab, setActiveTab] = useState<'puntos' | 'tiendas'>('puntos');
  const [authError, setAuthError] = useState<boolean>(false);

  // Verificar si hay un error de autenticación
  useEffect(() => {
    if (error && error.message === 'Unauthorized') {
      setAuthError(true);
    } else {
      setAuthError(false);
    }
  }, [error]);

  // Refrescar los datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      fetchPuntos();
    }, [fetchPuntos])
  );

  // Función para manejar errores de autenticación
  const handleAuthError = async () => {
    try {
      // Redirigir al usuario a la pantalla de login
      Alert.alert(
        'Sesión expirada',
        'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        [
          { 
            text: 'Aceptar', 
            onPress: async () => {
              // Limpiar el token y redirigir a login
              await AsyncStorage.removeItem('@token');
              // Aquí deberías navegar a la pantalla de login
              // navigation.navigate('Login');
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error al manejar error de autenticación:', error);
    }
  };

  // Renderizar un item del historial de puntos
  const renderPuntoItem = ({ item }: { item: Punto }) => {
    const esCanje = item.tipo === TipoPunto.CANJE;
    const iconName = esCanje ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = esCanje ? colors.danger : colors.success;
    
    return (
      <View style={styles.puntoItem}>
        <View style={styles.puntoIconContainer}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.puntoInfo}>
          <Text style={styles.puntoMotivo}>{item.motivo}</Text>
          <Text style={styles.puntoFecha}>{formatearFecha(item.fecha)}</Text>
          {item.referencia && (
            <Text style={styles.puntoReferencia}>Ref: {item.referencia}</Text>
          )}
          {item.tienda && (
            <Text style={styles.puntoTienda}>Tienda: {item.tienda.nombre}</Text>
          )}
        </View>
        <View style={styles.puntoCantidadContainer}>
          <Text
            style={[
              styles.puntoCantidad,
              { color: esCanje ? colors.danger : colors.success }
            ]}
          >
            {esCanje ? item.cantidad : `+${item.cantidad}`}
          </Text>
          <Text style={styles.puntoLabel}>puntos</Text>
        </View>
      </View>
    );
  };

  // Renderizar una tienda en la lista de tiendas
  const renderTiendaItem = ({ item }: { item: ResumenPuntosTienda }) => {
    const isSelected = tiendaSeleccionada === item.tiendaId;
    
    return (
      <TouchableOpacity 
        style={[
          styles.tiendaItem,
          isSelected && styles.tiendaItemSelected
        ]}
        onPress={() => {
          setTiendaSeleccionada(item.tiendaId);
          fetchPuntosTienda();
        }}
      >
        <View style={styles.tiendaInfo}>
          <Text style={styles.tiendaNombre}>{item.tiendaNombre}</Text>
          <Text style={styles.tiendaDisponibles}>
            {item.puntosDisponibles} puntos disponibles
          </Text>
        </View>
        <View style={styles.tiendaEstadisticas}>
          <View style={styles.tiendaEstadisticaItem}>
            <Text style={styles.tiendaEstadisticaValor}>{item.totalGanados}</Text>
            <Text style={styles.tiendaEstadisticaLabel}>Ganados</Text>
          </View>
          <View style={styles.tiendaEstadisticaItem}>
            <Text style={styles.tiendaEstadisticaValor}>{item.totalCanjeados}</Text>
            <Text style={styles.tiendaEstadisticaLabel}>Canjeados</Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.tiendaSelectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Formatear fecha a formato legible
  const formatearFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Mostrar información sobre el programa de puntos
  const mostrarInfoPuntos = () => {
    Alert.alert(
      'Programa de Puntos',
      'Acumula puntos con cada compra y servicio:\n\n' +
      '• Productos: 1 punto por cada $10 de compra\n' +
      '• Servicios: 2 puntos por cada $10 de servicio\n\n' +
      'Los puntos pueden ser canjeados por descuentos en tus próximas compras o servicios.',
      [{ text: 'Entendido' }]
    );
  };

  if (authError) {
    handleAuthError();
  }

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Puntos</Text>
        <TouchableOpacity onPress={mostrarInfoPuntos} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs de navegación */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'puntos' && styles.activeTab]}
          onPress={() => {
            setActiveTab('puntos');
            fetchPuntos();
          }}
        >
          <Ionicons 
            name="star" 
            size={20} 
            color={activeTab === 'puntos' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'puntos' && styles.activeTabText
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tiendas' && styles.activeTab]}
          onPress={() => setActiveTab('tiendas')}
        >
          <Ionicons 
            name="business" 
            size={20} 
            color={activeTab === 'tiendas' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'tiendas' && styles.activeTabText
            ]}
          >
            Por Tienda
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de resumen de puntos */}
      <View style={styles.puntosCard}>
        <View style={styles.puntosHeader}>
          <Text style={styles.puntosTitle}>
            {tiendaSeleccionada && resumenTienda?.tienda 
              ? `Puntos en ${resumenTienda.tienda.nombre}`
              : 'Tus Puntos Totales'
            }
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={tiendaSeleccionada ? fetchPuntosTienda : fetchPuntos}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.puntosResumen}>
          <View style={styles.puntosTotalContainer}>
            <Text style={styles.puntosTotal}>
              {tiendaSeleccionada && resumenTienda 
                ? resumenTienda.disponibles 
                : resumen.totalPuntosDisponibles
              }
            </Text>
            <Text style={styles.puntosTotalLabel}>Puntos Disponibles</Text>
          </View>
          
          <View style={styles.puntosEstadisticas}>
            <View style={styles.puntosEstadisticaItem}>
              <Text style={styles.puntosEstadisticaValor}>
                {tiendaSeleccionada && resumenTienda 
                  ? resumenTienda.total 
                  : resumen.puntosAcumulados
                }
              </Text>
              <Text style={styles.puntosEstadisticaLabel}>Total Acumulados</Text>
            </View>
            <View style={styles.puntosEstadisticaItem}>
              <Text style={styles.puntosEstadisticaValor}>
                {tiendaSeleccionada && resumenTienda 
                  ? resumenTienda.canjeados 
                  : (resumen.puntosAcumulados - resumen.totalPuntosDisponibles)
                }
              </Text>
              <Text style={styles.puntosEstadisticaLabel}>Canjeados</Text>
            </View>
          </View>

          {tiendaSeleccionada && (
            <TouchableOpacity 
              style={styles.verTodasButton}
              onPress={() => {
                setTiendaSeleccionada(null);
                fetchPuntos();
              }}
            >
              <Text style={styles.verTodasButtonText}>Ver todas las tiendas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contenido principal */}
      {activeTab === 'puntos' ? (
        // Historial de puntos
        <View style={styles.historialContainer}>
          <Text style={styles.historialTitle}>
            {tiendaSeleccionada && resumenTienda?.tienda 
              ? `Historial en ${resumenTienda.tienda.nombre}`
              : 'Historial de Puntos'
            }
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
          ) : puntos.length > 0 ? (
            <FlatList
              data={puntos}
              renderItem={renderPuntoItem}
              keyExtractor={(item) => item.id?.toString() || `${item.fecha}-${item.motivo}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl 
                  refreshing={loading} 
                  onRefresh={tiendaSeleccionada ? fetchPuntosTienda : fetchPuntos} 
                />
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={64} color={colors.lightGray} />
              <Text style={styles.emptyText}>Sin historial de puntos</Text>
              <Text style={styles.emptySubtext}>
                {tiendaSeleccionada 
                  ? 'Aún no tienes puntos en esta tienda.'
                  : 'Aún no tienes puntos registrados.'
                }
              </Text>
            </View>
          )}
        </View>
      ) : (
        // Lista de tiendas
        <View style={styles.tiendasContainer}>
          <Text style={styles.tiendasTitle}>Mis Tiendas</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
          ) : resumen.puntosPorTienda.length > 0 ? (
            <FlatList
              data={resumen.puntosPorTienda}
              renderItem={renderTiendaItem}
              keyExtractor={(item) => item.tiendaId.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchPuntos} />
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color={colors.lightGray} />
              <Text style={styles.emptyText}>Sin tiendas registradas</Text>
              <Text style={styles.emptySubtext}>Aún no tienes puntos en ninguna tienda.</Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoButton: {
    padding: 5,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  puntosCard: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  puntosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  puntosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  puntosResumen: {
    padding: 16,
  },
  puntosTotalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  puntosTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  puntosTotalLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  puntosEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  puntosEstadisticaItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  puntosEstadisticaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  puntosEstadisticaLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  puntosVencimiento: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    padding: 8,
    marginTop: 16,
  },
  puntosVencimientoText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 8,
  },
  historialContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  puntoItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  puntoIconContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  puntoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  puntoMotivo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  puntoFecha: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  puntoReferencia: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  puntoTienda: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  puntoCantidadContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  puntoCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  puntoLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  loading: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  tiendasContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tiendasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 12,
  },
  tiendaItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tiendaItemSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tiendaInfo: {
    marginBottom: 8,
  },
  tiendaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tiendaDisponibles: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  tiendaEstadisticas: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tiendaEstadisticaItem: {
    marginRight: 24,
  },
  tiendaEstadisticaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tiendaEstadisticaLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  tiendaSelectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  verTodasButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  verTodasButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
