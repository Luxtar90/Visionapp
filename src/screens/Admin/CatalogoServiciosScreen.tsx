// src/screens/Admin/CatalogoServiciosScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  costo: number;
  precio: number;
  duracion: number;
  categoria: string;
  insumos: string[];
}

const serviciosMock: Servicio[] = [
  {
    id: 1,
    nombre: 'Corte de cabello',
    descripcion: 'Corte de cabello profesional para damas',
    imagen: 'https://via.placeholder.com/100',
    costo: 10,
    precio: 25,
    duracion: 30,
    categoria: 'Cabello',
    insumos: ['Tijeras', 'Peine', 'Secador']
  },
  {
    id: 2,
    nombre: 'Manicure',
    descripcion: 'Manicure completo con esmaltado',
    imagen: 'https://via.placeholder.com/100',
    costo: 8,
    precio: 20,
    duracion: 45,
    categoria: 'Uñas',
    insumos: ['Esmalte', 'Lima', 'Removedor']
  },
  {
    id: 3,
    nombre: 'Pedicure',
    descripcion: 'Pedicure completo con esmaltado',
    imagen: 'https://via.placeholder.com/100',
    costo: 12,
    precio: 30,
    duracion: 60,
    categoria: 'Uñas',
    insumos: ['Esmalte', 'Lima', 'Removedor', 'Exfoliante']
  },
  {
    id: 4,
    nombre: 'Tinte de cabello',
    descripcion: 'Tinte de cabello profesional',
    imagen: 'https://via.placeholder.com/100',
    costo: 25,
    precio: 60,
    duracion: 90,
    categoria: 'Cabello',
    insumos: ['Tinte', 'Oxidante', 'Guantes', 'Capa']
  }
];

const CatalogoServiciosScreen = () => {
  const [servicios, setServicios] = useState<Servicio[]>(serviciosMock);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categorias = [...new Set(servicios.map(s => s.categoria))];
  
  const filteredServicios = servicios.filter(servicio => {
    const matchesSearch = searchText === '' || 
      servicio.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesCategory = activeCategory === null || servicio.categoria === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderServicioItem = ({ item }: { item: Servicio }) => (
    <TouchableOpacity style={styles.servicioCard}>
      <Image source={{ uri: item.imagen }} style={styles.servicioImagen} />
      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{item.nombre}</Text>
        <Text style={styles.servicioDescripcion}>{item.descripcion}</Text>
        <View style={styles.servicioDetalles}>
          <View style={styles.detalle}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>{item.duracion} min</Text>
          </View>
          <View style={styles.detalle}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>${item.precio}</Text>
          </View>
          <View style={styles.detalle}>
            <Ionicons name="folder-outline" size={14} color={colors.textLight} />
            <Text style={styles.detalleTexto}>{item.categoria}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CATÁLOGO DE SERVICIOS</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar servicio..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity 
          style={[
            styles.categoryChip,
            activeCategory === null && styles.activeCategory
          ]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[
            styles.categoryText,
            activeCategory === null && styles.activeCategoryText
          ]}>Todos</Text>
        </TouchableOpacity>
        
        {categorias.map((categoria) => (
          <TouchableOpacity 
            key={categoria}
            style={[
              styles.categoryChip,
              activeCategory === categoria && styles.activeCategory
            ]}
            onPress={() => setActiveCategory(categoria)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === categoria && styles.activeCategoryText
            ]}>{categoria}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          <Text style={styles.infoHighlight}>{filteredServicios.length}</Text> servicios encontrados
        </Text>
      </View>
      
      <FlatList
        data={filteredServicios}
        renderItem={renderServicioItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Configura los servicios con toda la información necesaria: nombre, descripción, 
          imagen, costos, precios, duración, categoría e insumos.
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
  categoriesContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  activeCategoryText: {
    color: colors.white,
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
  },
  servicioCard: {
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
  servicioImagen: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  servicioDescripcion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  servicioDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  editButton: {
    padding: 8,
  },
  footer: {
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

export default CatalogoServiciosScreen;
