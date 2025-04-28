// src/components/Estadisticas/GraficoEstadisticas.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors } from '../../theme/colors';

const screenWidth = Dimensions.get('window').width - 32;

interface DatosGrafico {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
}

interface DatosPie {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface GraficoEstadisticasProps {
  titulo: string;
  tipo: 'linea' | 'barra' | 'pastel';
  datos: DatosGrafico | DatosPie[];
  descripcion?: string;
  altura?: number;
  mostrarValores?: boolean;
  mostrarEtiquetas?: boolean;
}

export const GraficoEstadisticas: React.FC<GraficoEstadisticasProps> = ({
  titulo,
  tipo,
  datos,
  descripcion,
  altura = 220,
  mostrarValores = true,
  mostrarEtiquetas = true,
}) => {
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const renderGrafico = () => {
    switch (tipo) {
      case 'linea':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={datos as DatosGrafico}
              width={Math.max(screenWidth, (datos as DatosGrafico).labels.length * 50)}
              height={altura}
              chartConfig={chartConfig}
              bezier
              style={styles.grafico}
              withInnerLines={false}
              withOuterLines={true}
              withDots={true}
              withShadow={false}
              withHorizontalLabels={mostrarValores}
              withVerticalLabels={mostrarEtiquetas}
            />
          </ScrollView>
        );
      case 'barra':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={datos as DatosGrafico}
              width={Math.max(screenWidth, (datos as DatosGrafico).labels.length * 50)}
              height={altura}
              chartConfig={{
                ...chartConfig,
                barPercentage: 0.7,
              }}
              style={styles.grafico}
              showValuesOnTopOfBars={mostrarValores}
              withInnerLines={false}
              withHorizontalLabels={mostrarValores}
              withVerticalLabels={mostrarEtiquetas}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ScrollView>
        );
      case 'pastel':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PieChart
              data={datos as DatosPie[]}
              width={screenWidth}
              height={altura}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={mostrarValores}
            />
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}
      <View style={styles.graficoContenedor}>
        {renderGrafico()}
      </View>
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
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 12,
    color: colors.text + '99',
    marginBottom: 12,
  },
  graficoContenedor: {
    alignItems: 'center',
  },
  grafico: {
    borderRadius: 12,
    paddingRight: 16,
  },
});
