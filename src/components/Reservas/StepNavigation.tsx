import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  loading?: boolean;
  isLastStep?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  loading = false,
  isLastStep = false
}) => {
  return (
    <View style={styles.container}>
      {currentStep > 1 ? (
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={onPrevious}
          disabled={loading}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="arrow-back" size={18} color={colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.buttonTextOutline]}>Anterior</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonPlaceholder} />
      )}
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              {isLastStep ? 'Confirmar' : 'Siguiente'}
            </Text>
            {!isLastStep && (
              <Ionicons name="arrow-forward" size={18} color="#ffffff" style={styles.buttonIcon} />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 2,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonIcon: {
    marginHorizontal: 5,
  },
  buttonPlaceholder: {
    minWidth: 120,
  },
});

export default StepNavigation;
