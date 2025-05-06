// src/screens/Admin/ContabilidadScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Transaccion {
  id: number;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  monto: number;
  fecha: string;
  codigoContable: string;
  descripcion: string;
  metodo: 'caja' | 'banco';
  afectaInventario: boolean;
}

const transaccionesMock: Transaccion[] = [
  {
    id: 1,
    tipo: 'ingreso',
    concepto: 'Venta de servicios',
    monto: 150.00,
    fecha: '2025-05-05',
    codigoContable: 'ING-001',
    descripcion: 'Corte de cabello y manicure',
    metodo: 'caja',
    afectaInventario: true
  },
  {
    id: 2,
    tipo: 'egreso',
    concepto: 'Compra de insumos',
    monto: 75.50,
    fecha: '2025-05-04',
    codigoContable: 'EGR-001',
    descripcion: 'Tintes y productos para el cabello',
    metodo: 'banco',
    afectaInventario: true
  },
  {
    id: 3,
    tipo: 'ingreso',
    concepto: 'Venta de productos',
    monto: 45.00,
    fecha: '2025-05-03',
    codigoContable: 'ING-002',
    descripcion: 'Shampoo y acondicionador',
    metodo: 'caja',
    afectaInventario: true
  },
  {
    id: 4,
    tipo: 'egreso',
    concepto: 'Pago de servicios',
    monto: 120.00,
    fecha: '2025-05-02',
    codigoContable: 'EGR-002',
    descripcion: 'Electricidad y agua',
    metodo: 'banco',
    afectaInventario: false
  }
];

const ContabilidadScreen = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>(transaccionesMock);
  const [activeTab, setActiveTab] = useState<'libro' | 'inventario' | 'activos'>('libro');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  
  const filteredTransacciones = transacciones.filter(t => {
    if (filtroTipo === 'todos') return true;
    return t.tipo === filtroTipo;
  });
  
  const totalIngresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
    
  const totalEgresos = transacciones
    .filter(t => t.tipo === 'egreso')
    .reduce((sum, t) => sum + t.monto, 0);
    
  const balance = totalIngresos - totalEgresos;

  const renderTransaccionItem = ({ item }: { item: Transaccion }) => (
    <TouchableOpacity style={styles.transaccionCard}>
      <View style={styles.transaccionHeader}>
        <View style={[
          styles.tipoIndicator, 
          { backgroundColor: item.tipo === 'ingreso' ? '#4CAF50' : colors.danger }
        ]} />
        <Text style={styles.transaccionConcepto}>{item.concepto}</Text>
        <Text style={[
          styles.transaccionMonto,
          { color: item.tipo === 'ingreso' ? '#4CAF50' : colors.danger }
        ]}>
          {item.tipo === 'ingreso' ? '+' : '-'}${item.monto.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.transaccionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Fecha:</Text>
          <Text style={styles.detailValue}>{item.fecha}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Código:</Text>
          <Text style={styles.detailValue}>{item.codigoContable}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Método:</Text>
          <Text style={styles.detailValue}>
            {item.metodo === 'caja' ? 'Caja' : 'Banco'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Afecta inventario:</Text>
          <Text style={styles.detailValue}>
            {item.afectaInventario ? 'Sí' : 'No'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.transaccionDescripcion}>{item.descripcion}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONTABILIDAD</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'libro' && styles.activeTab]}
          onPress={() => setActiveTab('libro')}
        >
          <Ionicons 
            name="book-outline" 
            size={20} 
            color={activeTab === 'libro' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'libro' && styles.activeTabText
          ]}>Libro Diario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'inventario' && styles.activeTab]}
          onPress={() => setActiveTab('inventario')}
        >
          <Ionicons 
            name="cube-outline" 
            size={20} 
            color={activeTab === 'inventario' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'inventario' && styles.activeTabText
          ]}>Inventario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activos' && styles.activeTab]}
          onPress={() => setActiveTab('activos')}
        >
          <Ionicons 
            name="briefcase-outline" 
            size={20} 
            color={activeTab === 'activos' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'activos' && styles.activeTabText
          ]}>Activos</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'libro' && (
        <>
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Ingresos</Text>
              <Text style={[styles.balanceValue, { color: '#4CAF50' }]}>
                +${totalIngresos.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Egresos</Text>
              <Text style={[styles.balanceValue, { color: colors.danger }]}>
                -${totalEgresos.toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.balanceCard, styles.totalBalanceCard]}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={[
                styles.balanceValue, 
                { color: balance >= 0 ? '#4CAF50' : colors.danger }
              ]}>
                ${balance.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, filtroTipo === 'todos' && styles.activeFilterButton]}
              onPress={() => setFiltroTipo('todos')}
            >
              <Text style={[
                styles.filterText,
                filtroTipo === 'todos' && styles.activeFilterText
              ]}>Todos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtroTipo === 'ingreso' && styles.activeFilterButton]}
              onPress={() => setFiltroTipo('ingreso')}
            >
              <Text style={[
                styles.filterText,
                filtroTipo === 'ingreso' && styles.activeFilterText
              ]}>Ingresos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtroTipo === 'egreso' && styles.activeFilterButton]}
              onPress={() => setFiltroTipo('egreso')}
            >
              <Text style={[
                styles.filterText,
                filtroTipo === 'egreso' && styles.activeFilterText
              ]}>Egresos</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredTransacciones}
            renderItem={renderTransaccionItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      
      {activeTab === 'inventario' && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="cube-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyStateTitle}>Gestión de Inventario</Text>
          <Text style={styles.emptyStateText}>
            Aquí podrás gestionar tu inventario de insumos y productos.
            Controla las entradas, salidas y stock actual.
          </Text>
          <TouchableOpacity style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Configurar Inventario</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'activos' && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="briefcase-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyStateTitle}>Activos Fijos</Text>
          <Text style={styles.emptyStateText}>
            Registra y controla los activos fijos de tu negocio.
            Lleva un registro de depreciación y valor actual.
          </Text>
          <TouchableOpacity style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Configurar Activos</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El libro diario debe llevar una base principal que alimente: Ingresos y egresos, saldos, ID de registro, 
          fecha de la operación, descripción de la operación, código contable.
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
  balanceContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  totalBalanceCard: {
    backgroundColor: '#f0f0f0',
    marginRight: 0,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for footer
  },
  transaccionCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transaccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipoIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  transaccionConcepto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  transaccionMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transaccionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  transaccionDescripcion: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

export default ContabilidadScreen;
