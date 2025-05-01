import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ReservationStepsProps {
  currentStep: number;
  totalSteps?: number;
}

const ReservationSteps: React.FC<ReservationStepsProps> = ({ 
  currentStep, 
  totalSteps = 3 
}) => {
  const renderSteps = () => {
    const steps = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <View key={i} style={styles.stepContainer}>
          <View style={[
            styles.step, 
            currentStep >= i && styles.activeStep
          ]}>
            <Text style={[
              styles.stepText, 
              currentStep >= i ? styles.activeStepText : styles.inactiveStepText
            ]}>
              {i}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel, 
            currentStep >= i && styles.activeStepLabel
          ]}>
            {getStepLabel(i)}
          </Text>
        </View>
      );
      
      // Add connector line between steps
      if (i < totalSteps) {
        steps.push(
          <View 
            key={`line-${i}`} 
            style={[
              styles.stepLine, 
              currentStep > i && styles.activeStepLine
            ]} 
          />
        );
      }
    }
    
    return steps;
  };
  
  const getStepLabel = (step: number): string => {
    switch (step) {
      case 1:
        return 'Servicio';
      case 2:
        return 'Profesional';
      case 3:
        return 'Fecha y Hora';
      default:
        return `Paso ${step}`;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {renderSteps()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeStep: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: '#ffffff',
  },
  inactiveStepText: {
    color: '#000000',
  },
  stepLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    width: 80,
  },
  activeStepLabel: {
    fontWeight: 'bold',
    color: '#000000',
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },
});

export default ReservationSteps;
