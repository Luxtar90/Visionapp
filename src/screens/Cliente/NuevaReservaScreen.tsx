// src/screens/Cliente/NuevaReservaScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';

// Placeholder component for Nueva Reserva screen
export default function NuevaReservaScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Select service
  const [selectedService, setSelectedService] = useState<string | null>(null);
  // Step 2: Select employee
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  // Step 3: Select date and time
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      Alert.alert('Error', 'Por favor seleccione un servicio');
      return;
    }
    if (currentStep === 2 && !selectedEmployee) {
      Alert.alert('Error', 'Por favor seleccione un profesional');
      return;
    }
    if (currentStep === 3 && !selectedTime) {
      Alert.alert('Error', 'Por favor seleccione una hora');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateReservation();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateReservation = async () => {
    setLoading(true);
    try {
      // Here you would call the API to create the reservation
      // await createReservation({ ... });
      
      // For now, just show a success message
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Reserva Confirmada',
          'Su reserva ha sido creada exitosamente.',
          [{ text: 'OK', onPress: () => resetForm() }]
        );
      }, 1000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo crear la reserva. Por favor intente nuevamente.');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedEmployee(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 1: Seleccione un Servicio</Text>
            <View style={styles.serviceList}>
              {/* Placeholder for service selection */}
              <TouchableOpacity 
                style={[styles.serviceItem, selectedService === '1' && styles.selectedItem]}
                onPress={() => setSelectedService('1')}
              >
                <Text style={styles.serviceName}>Corte de Cabello</Text>
                <Text style={styles.serviceDetails}>Duración: 30 min - Precio: $20</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.serviceItem, selectedService === '2' && styles.selectedItem]}
                onPress={() => setSelectedService('2')}
              >
                <Text style={styles.serviceName}>Manicure</Text>
                <Text style={styles.serviceDetails}>Duración: 45 min - Precio: $25</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.serviceItem, selectedService === '3' && styles.selectedItem]}
                onPress={() => setSelectedService('3')}
              >
                <Text style={styles.serviceName}>Tratamiento Facial</Text>
                <Text style={styles.serviceDetails}>Duración: 60 min - Precio: $40</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 2: Seleccione un Profesional</Text>
            <View style={styles.employeeList}>
              {/* Placeholder for employee selection */}
              <TouchableOpacity 
                style={[styles.employeeItem, selectedEmployee === '1' && styles.selectedItem]}
                onPress={() => setSelectedEmployee('1')}
              >
                <Text style={styles.employeeName}>Ana García</Text>
                <Text style={styles.employeeDetails}>Especialista Senior</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.employeeItem, selectedEmployee === '2' && styles.selectedItem]}
                onPress={() => setSelectedEmployee('2')}
              >
                <Text style={styles.employeeName}>Carlos Rodríguez</Text>
                <Text style={styles.employeeDetails}>Estilista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.employeeItem, selectedEmployee === '3' && styles.selectedItem]}
                onPress={() => setSelectedEmployee('3')}
              >
                <Text style={styles.employeeName}>María López</Text>
                <Text style={styles.employeeDetails}>Esteticista</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 3: Seleccione Fecha y Hora</Text>
            
            <Text style={styles.dateLabel}>Fecha seleccionada: {selectedDate.toLocaleDateString()}</Text>
            
            {/* Placeholder for time selection */}
            <View style={styles.timeList}>
              <TouchableOpacity 
                style={[styles.timeItem, selectedTime === '09:00' && styles.selectedItem]}
                onPress={() => setSelectedTime('09:00')}
              >
                <Text style={styles.timeText}>09:00 AM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timeItem, selectedTime === '10:00' && styles.selectedItem]}
                onPress={() => setSelectedTime('10:00')}
              >
                <Text style={styles.timeText}>10:00 AM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timeItem, selectedTime === '11:00' && styles.selectedItem]}
                onPress={() => setSelectedTime('11:00')}
              >
                <Text style={styles.timeText}>11:00 AM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timeItem, selectedTime === '12:00' && styles.selectedItem]}
                onPress={() => setSelectedTime('12:00')}
              >
                <Text style={styles.timeText}>12:00 PM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timeItem, selectedTime === '13:00' && styles.selectedItem]}
                onPress={() => setSelectedTime('13:00')}
              >
                <Text style={styles.timeText}>01:00 PM</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Reserva</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]} />
        </View>
      </View>

      {renderStep()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handlePreviousStep}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Confirmar Reserva' : 'Siguiente'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  activeStepDot: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  serviceList: {
    marginBottom: 20,
  },
  serviceItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: '#e6f2ff',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: '#666',
  },
  employeeList: {
    marginBottom: 20,
  },
  employeeItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: 14,
    color: '#666',
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 15,
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    flex: 2,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});