// src/components/Estadisticas/ExportarReporte.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectField, SelectOption } from '../common/SelectField';
import { exportarReporte } from '../../api/estadisticas.api';
import { FiltrosEstadisticas } from '../../interfaces/Estadisticas';
import { colors } from '../../theme/colors';

interface ExportarReporteProps {
  filtros: FiltrosEstadisticas;
}

export const ExportarReporte: React.FC<ExportarReporteProps> = ({ filtros }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<'ingresos' | 'reservas' | 'clientes' | 'servicios' | 'empleados'>('ingresos');
  const [formatoReporte, setFormatoReporte] = useState<'csv' | 'pdf'>('pdf');
  const [isLoading, setIsLoading] = useState(false);

  const handleExportar = async () => {
    try {
      setIsLoading(true);
      const urlDescarga = await exportarReporte(tipoReporte, formatoReporte, filtros);
      
      // Abrir la URL para descargar el archivo
      await Linking.openURL(urlDescarga);
      
      setModalVisible(false);
      Alert.alert(
        'Reporte generado',
        'El reporte se ha generado correctamente y se está descargando.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo generar el reporte. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoReporteOptions = (): SelectOption[] => {
    return [
      { label: 'Ingresos', value: 'ingresos' },
      { label: 'Reservas', value: 'reservas' },
      { label: 'Clientes', value: 'clientes' },
      { label: 'Servicios', value: 'servicios' },
      { label: 'Empleados', value: 'empleados' },
    ];
  };

  const getFormatoReporteOptions = (): SelectOption[] => {
    return [
      { label: 'PDF', value: 'pdf' },
      { label: 'CSV (Excel)', value: 'csv' },
    ];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botonExportar}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="download-outline" size={18} color={colors.primary} />
        <Text style={styles.botonExportarTexto}>Exportar reporte</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exportar reporte</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Tipo de reporte</Text>
              <SelectField
                label="Tipo de reporte"
                value={tipoReporte}
                options={getTipoReporteOptions()}
                onValueChange={(value) => setTipoReporte(value as any)}
                placeholder="Seleccionar tipo de reporte"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Formato</Text>
              <SelectField
                label="Formato"
                value={formatoReporte}
                options={getFormatoReporteOptions()}
                onValueChange={(value) => setFormatoReporte(value as any)}
                placeholder="Seleccionar formato"
              />

              <View style={styles.filtrosAplicados}>
                <Text style={styles.filtrosTitle}>Filtros aplicados:</Text>
                <Text style={styles.filtrosTexto}>
                  {filtros.fecha_inicio && filtros.fecha_fin
                    ? `Período: ${new Date(filtros.fecha_inicio).toLocaleDateString()} - ${new Date(filtros.fecha_fin).toLocaleDateString()}`
                    : 'Sin filtro de fechas'}
                </Text>
                {filtros.categoria_servicio && (
                  <Text style={styles.filtrosTexto}>
                    Categoría: {filtros.categoria_servicio}
                  </Text>
                )}
                {filtros.empleado_id && (
                  <Text style={styles.filtrosTexto}>
                    Empleado: ID {filtros.empleado_id}
                  </Text>
                )}
                {filtros.periodo && (
                  <Text style={styles.filtrosTexto}>
                    Agrupación: {filtros.periodo}
                  </Text>
                )}
              </View>

              <View style={styles.botonesContainer}>
                <TouchableOpacity
                  style={[styles.botonCancelar, isLoading && styles.botonDeshabilitado]}
                  onPress={() => setModalVisible(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botonGenerar, isLoading && styles.botonDeshabilitado]}
                  onPress={handleExportar}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={18} color="white" style={styles.botonIcono} />
                      <Text style={styles.botonGenerarTexto}>Generar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  botonExportar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'white',
  },
  botonExportarTexto: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  filtrosAplicados: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  filtrosTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  filtrosTexto: {
    fontSize: 13,
    color: colors.text + '99',
    marginBottom: 4,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  botonCancelar: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: colors.text,
  },
  botonGenerar: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonGenerarTexto: {
    color: 'white',
    fontWeight: '500',
  },
  botonIcono: {
    marginRight: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
