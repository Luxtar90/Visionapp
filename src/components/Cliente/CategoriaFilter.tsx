// src/components/Cliente/CategoriaFilter.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

interface CategoriaFilterProps {
  categorias: string[];
  categoriaSeleccionada: string | null;
  onSelectCategoria: (categoria: string | null) => void;
}

const CategoriaFilter: React.FC<CategoriaFilterProps> = ({ 
  categorias, 
  categoriaSeleccionada, 
  onSelectCategoria 
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriasContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoriaItem,
          categoriaSeleccionada === null && styles.categoriaSeleccionada
        ]}
        onPress={() => onSelectCategoria(null)}
      >
        <Text
          style={[
            styles.categoriaTexto,
            categoriaSeleccionada === null && styles.categoriaTextoSeleccionado
          ]}
        >
          Todos
        </Text>
      </TouchableOpacity>
      
      {categorias.map((categoria) => (
        <TouchableOpacity
          key={categoria}
          style={[
            styles.categoriaItem,
            categoriaSeleccionada === categoria && styles.categoriaSeleccionada
          ]}
          onPress={() => onSelectCategoria(categoria)}
        >
          <Text
            style={[
              styles.categoriaTexto,
              categoriaSeleccionada === categoria && styles.categoriaTextoSeleccionado
            ]}
          >
            {categoria}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoriasContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoriaItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoriaSeleccionada: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoriaTexto: {
    fontSize: 14,
    color: colors.text,
  },
  categoriaTextoSeleccionado: {
    color: 'white',
  },
});

export default CategoriaFilter;
