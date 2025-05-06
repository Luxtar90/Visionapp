// src/components/Empleados/ValoracionesEmpleado.tsx
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
import { Valoracion, getValoracionesByEmpleado, getPromedioValoracionesByEmpleado } from '../../api/valoraciones.api';
import { EmptyState } from '../common/EmptyState';

interface ValoracionesEmpleadoProps {
  empleadoId: string;
}

export const ValoracionesEmpleado = ({ 
  empleadoId 
}: ValoracionesEmpleadoProps) => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [promedio, setPromedio] = useState<number | null>(null);
  const [totalValoraciones, setTotalValoraciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarValoraciones = async () => {
    try {
      setLoading(true);
      
      // Usar la API real para obtener las valoraciones
      const data = await getValoracionesByEmpleado(empleadoId);
      const promedioData = await getPromedioValoracionesByEmpleado(empleadoId);
      
      setValoraciones(data);
      setPromedio(promedioData.promedio);
      setTotalValoraciones(promedioData.total);
    } catch (error) {
      console.error('Error al cargar valoraciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las valoraciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      cargarValoraciones();
    }
  }, [empleadoId]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarValoraciones();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i}
          name={i <= rating ? "star" : "star-outline"} 
          size={16} 
          color={i <= rating ? "#FFD700" : colors.text + '50'} 
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };

  const renderValoracionItem = ({ item }: { item: Valoracion }) => (
    <View style={styles.valoracionCard}>
      <View style={styles.valoracionHeader}>
        <View style={styles.valoracionInfo}>
          <Text style={styles.valoracionFecha}>{formatDate(item.fecha)}</Text>
          {renderStars(item.puntuacion)}
        </View>
      </View>
      
      {item.comentario && (
        <Text style={styles.valoracionComentario}>
          "{item.comentario}"
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Valoraciones</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {promedio !== null && (
            <View style={styles.promedioContainer}>
              <View style={styles.promedioValorContainer}>
                <Text style={styles.promedioValor}>{promedio.toFixed(1)}</Text>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <Text style={styles.promedioText}>
                Promedio de {totalValoraciones} valoraciones
              </Text>
              <View style={styles.starsLarge}>
                {renderStars(Math.round(promedio))}
              </View>
            </View>
          )}
          
          {valoraciones.length === 0 ? (
            <EmptyState
              icon="star-outline"
              message="No hay valoraciones disponibles"
              description="Este empleado aún no ha recibido valoraciones"
              actionLabel="Actualizar"
              onAction={handleRefresh}
            />
          ) : (
            <FlatList
              data={valoraciones}
              keyExtractor={(item) => item.id}
              renderItem={renderValoracionItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promedioContainer: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  promedioValorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  promedioValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  promedioText: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 8,
  },
  starsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ scale: 1.2 }],
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  valoracionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  valoracionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valoracionInfo: {
    flex: 1,
  },
  valoracionFecha: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 4,
  },
  valoracionComentario: {
    fontSize: 15,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
