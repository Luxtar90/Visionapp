// src/components/Estadisticas/TablaEstadisticas.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ColumnaTabla {
  id: string;
  titulo: string;
  ancho?: number; // porcentaje del ancho total
  alineacion?: 'left' | 'center' | 'right';
  renderCelda?: (valor: any, fila: any) => React.ReactNode;
}

interface TablaEstadisticasProps {
  titulo: string;
  columnas: ColumnaTabla[];
  datos: any[];
  onPressFila?: (item: any) => void;
  mostrarIndice?: boolean;
  colorAlternar?: boolean;
  accionesColumna?: {
    titulo: string;
    acciones: {
      icono: string;
      color?: string;
      onPress: (item: any) => void;
    }[];
  };
}

export const TablaEstadisticas: React.FC<TablaEstadisticasProps> = ({
  titulo,
  columnas,
  datos,
  onPressFila,
  mostrarIndice = false,
  colorAlternar = true,
  accionesColumna,
}) => {
  const renderCabecera = () => {
    return (
      <View style={styles.filaCabecera}>
        {mostrarIndice && (
          <View style={[styles.celdaCabecera, { width: '10%' }]}>
            <Text style={styles.textoCabecera}>#</Text>
          </View>
        )}
        
        {columnas.map((columna) => (
          <View
            key={columna.id}
            style={[
              styles.celdaCabecera,
              {
                width: columna.ancho ? `${columna.ancho}%` : `${100 / columnas.length}%`,
                alignItems: getAlineacion(columna.alineacion),
              },
            ]}
          >
            <Text style={styles.textoCabecera}>{columna.titulo}</Text>
          </View>
        ))}
        
        {accionesColumna && (
          <View
            style={[
              styles.celdaCabecera,
              {
                width: '15%',
                alignItems: 'center',
              },
            ]}
          >
            <Text style={styles.textoCabecera}>{accionesColumna.titulo}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderFila = (item: any, index: number) => {
    const filaProps = onPressFila
      ? {
          onPress: () => onPressFila(item),
          activeOpacity: 0.7,
        }
      : {};

    const FilaComponente = onPressFila ? TouchableOpacity : View;

    return (
      <FilaComponente
        key={index}
        style={[
          styles.fila,
          colorAlternar && index % 2 === 1 && styles.filaAlterna,
        ]}
        {...filaProps}
      >
        {mostrarIndice && (
          <View style={[styles.celda, { width: '10%' }]}>
            <Text style={styles.textoIndice}>{index + 1}</Text>
          </View>
        )}
        
        {columnas.map((columna) => (
          <View
            key={columna.id}
            style={[
              styles.celda,
              {
                width: columna.ancho ? `${columna.ancho}%` : `${100 / columnas.length}%`,
                alignItems: getAlineacion(columna.alineacion),
              },
            ]}
          >
            {columna.renderCelda ? (
              columna.renderCelda(item[columna.id], item)
            ) : (
              <Text style={styles.textoCelda}>{item[columna.id]}</Text>
            )}
          </View>
        ))}
        
        {accionesColumna && (
          <View
            style={[
              styles.celda,
              {
                width: '15%',
                flexDirection: 'row',
                justifyContent: 'center',
              },
            ]}
          >
            {accionesColumna.acciones.map((accion, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.botonAccion}
                onPress={() => accion.onPress(item)}
              >
                <Ionicons
                  name={accion.icono as any}
                  size={18}
                  color={accion.color || colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </FilaComponente>
    );
  };

  const getAlineacion = (alineacion?: 'left' | 'center' | 'right') => {
    switch (alineacion) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {renderCabecera()}
          
          {datos.length > 0 ? (
            datos.map((item, index) => renderFila(item, index))
          ) : (
            <View style={styles.sinDatos}>
              <Text style={styles.sinDatosTexto}>No hay datos disponibles</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  filaCabecera: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.lightGray,
  },
  celdaCabecera: {
    paddingHorizontal: 8,
  },
  textoCabecera: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.text,
  },
  fila: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  filaAlterna: {
    backgroundColor: colors.lightGray + '40',
  },
  celda: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  textoCelda: {
    fontSize: 14,
    color: colors.text,
  },
  textoIndice: {
    fontSize: 14,
    color: colors.text + '80',
    textAlign: 'center',
  },
  botonAccion: {
    padding: 6,
    marginHorizontal: 2,
  },
  sinDatos: {
    padding: 20,
    alignItems: 'center',
  },
  sinDatosTexto: {
    color: colors.text + '80',
    fontStyle: 'italic',
  },
});
