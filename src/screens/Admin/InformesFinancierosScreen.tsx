// src/screens/Admin/InformesFinancierosScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const InformesFinancierosScreen = () => {
  const [periodoActivo, setPeriodoActivo] = useState<'dia' | 'semana' | 'mes' | 'trimestre' | 'semestre' | 'anual' | 'todo'>('mes');
  const [informeActivo, setInformeActivo] = useState<'ventas' | 'indicadores' | 'rendimiento'>('ventas');
  
  // Datos de ejemplo para los gráficos
  const datosVentas = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Ventas Mensuales"]
  };
  
  const datosIndicadores = {
    labels: ["Valor Promedio", "Clientes Habituales", "Clientes Nuevos", "Ocupación"],
    datasets: [
      {
        data: [65, 80, 40, 75]
      }
    ]
  };
  
  const datosRendimiento = {
    data: [
      {
        name: "Excelente",
        population: 35,
        color: "#4CAF50",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      },
      {
        name: "Bueno",
        population: 45,
        color: "#2196F3",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      },
      {
        name: "Regular",
        population: 15,
        color: "#FF9800",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      },
      {
        name: "Deficiente",
        population: 5,
        color: "#F44336",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      }
    ]
  };
  
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>INFORMES FINANCIEROS</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color={colors.white} />
          <Text style={styles.exportButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'dia' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('dia')}
          >
            <Text style={[styles.periodText, periodoActivo === 'dia' && styles.activePeriodText]}>Día</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'semana' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('semana')}
          >
            <Text style={[styles.periodText, periodoActivo === 'semana' && styles.activePeriodText]}>Semana</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'mes' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('mes')}
          >
            <Text style={[styles.periodText, periodoActivo === 'mes' && styles.activePeriodText]}>Mes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'trimestre' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('trimestre')}
          >
            <Text style={[styles.periodText, periodoActivo === 'trimestre' && styles.activePeriodText]}>Trimestre</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'semestre' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('semestre')}
          >
            <Text style={[styles.periodText, periodoActivo === 'semestre' && styles.activePeriodText]}>Semestre</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'anual' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('anual')}
          >
            <Text style={[styles.periodText, periodoActivo === 'anual' && styles.activePeriodText]}>Anual</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, periodoActivo === 'todo' && styles.activePeriodButton]}
            onPress={() => setPeriodoActivo('todo')}
          >
            <Text style={[styles.periodText, periodoActivo === 'todo' && styles.activePeriodText]}>Todo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, informeActivo === 'ventas' && styles.activeTab]}
          onPress={() => setInformeActivo('ventas')}
        >
          <Ionicons 
            name="cash-outline" 
            size={20} 
            color={informeActivo === 'ventas' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            informeActivo === 'ventas' && styles.activeTabText
          ]}>Ventas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, informeActivo === 'indicadores' && styles.activeTab]}
          onPress={() => setInformeActivo('indicadores')}
        >
          <Ionicons 
            name="stats-chart-outline" 
            size={20} 
            color={informeActivo === 'indicadores' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            informeActivo === 'indicadores' && styles.activeTabText
          ]}>Indicadores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, informeActivo === 'rendimiento' && styles.activeTab]}
          onPress={() => setInformeActivo('rendimiento')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={informeActivo === 'rendimiento' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            informeActivo === 'rendimiento' && styles.activeTabText
          ]}>Rendimiento</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {informeActivo === 'ventas' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Informe de Ventas</Text>
            <Text style={styles.chartSubtitle}>Periodo: {periodoActivo}</Text>
            
            <LineChart
              data={datosVentas}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Ventas</Text>
                <Text style={styles.statValue}>$12,450.00</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Promedio</Text>
                <Text style={styles.statValue}>$2,075.00</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Crecimiento</Text>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>+15%</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Detalles</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ventas por canales</Text>
                <Text style={styles.detailValue}>Presencial: 75%, Online: 25%</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Clientes habituales</Text>
                <Text style={styles.detailValue}>65% de las ventas</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Nuevos clientes</Text>
                <Text style={styles.detailValue}>35% de las ventas</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ocupación de empleados</Text>
                <Text style={styles.detailValue}>78% de capacidad</Text>
              </View>
            </View>
          </View>
        )}
        
        {informeActivo === 'indicadores' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Indicadores Clave</Text>
            <Text style={styles.chartSubtitle}>Periodo: {periodoActivo}</Text>
            
            <BarChart
              data={datosIndicadores}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
            
            <Text style={styles.sectionTitle}>Detalles de Indicadores</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Valor promedio de venta</Text>
                <Text style={styles.detailValue}>$65.00 por cliente</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Clientes habituales</Text>
                <Text style={styles.detailValue}>80% de fidelización</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Nuevos clientes</Text>
                <Text style={styles.detailValue}>40 nuevos este mes</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ocupación de empleados</Text>
                <Text style={styles.detailValue}>75% de capacidad</Text>
              </View>
            </View>
          </View>
        )}
        
        {informeActivo === 'rendimiento' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Rendimiento del Personal</Text>
            <Text style={styles.chartSubtitle}>Periodo: {periodoActivo}</Text>
            
            <PieChart
              data={datosRendimiento.data}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
            
            <Text style={styles.sectionTitle}>Detalles de Rendimiento</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mejor trabajador</Text>
                <Text style={styles.detailValue}>Ana Martínez</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Peor trabajador</Text>
                <Text style={styles.detailValue}>Carlos López</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Promedio de servicio</Text>
                <Text style={styles.detailValue}>4.2/5 estrellas</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posicionamiento</Text>
                <Text style={styles.detailValue}>Top 3 en la zona</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Los informes financieros incluyen filtros por día, semana, mes, trimestre, semestre, anual y todo.
          Proporcionan datos sobre ventas, indicadores y rendimiento del personal.
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exportButtonText: {
    color: colors.white,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  periodSelector: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: colors.text,
  },
  activePeriodText: {
    color: colors.white,
    fontWeight: '500',
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
  content: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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

export default InformesFinancierosScreen;
