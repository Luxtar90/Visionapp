/**
 * Sistema centralizado de temas para Visionapp
 * Este archivo contiene todas las constantes de estilo para mantener una apariencia consistente
 */

import { StyleSheet } from 'react-native';

// Paleta de colores principal
export const colors = {
  // Colores primarios
  primary: '#6B46C1', // Púrpura principal
  primaryLight: '#9F7AEA',
  primaryDark: '#553C9A',
  
  // Colores secundarios
  secondary: '#38B2AC', // Turquesa
  secondaryLight: '#4FD1C5',
  secondaryDark: '#2C7A7B',
  
  // Colores de acento
  accent: '#F6AD55', // Naranja
  accentLight: '#FBD38D',
  accentDark: '#DD6B20',
  
  // Colores de estado
  success: '#48BB78', // Verde
  error: '#E53E3E',   // Rojo
  warning: '#ECC94B', // Amarillo
  info: '#4299E1',    // Azul
  
  // Colores neutros
  black: '#1A202C',
  darkGray: '#2D3748',
  gray: '#718096',
  lightGray: '#E2E8F0',
  white: '#FFFFFF',
  
  // Colores de fondo
  background: '#F7FAFC',
  card: '#FFFFFF',
  
  // Colores de texto
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textLight: '#A0AEC0',
  textWhite: '#FFFFFF',
  
  // Colores de borde
  border: '#E2E8F0',
  borderDark: '#CBD5E0',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

// Espaciado consistente
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Espaciado para secciones
  section: 20,
  
  // Espaciado para contenedores
  container: 16,
  
  // Espaciado para elementos de formulario
  inputVertical: 12,
  inputHorizontal: 16,
  
  // Espaciado para botones
  buttonVertical: 14,
  buttonHorizontal: 20,
};

// Tipografía
export const typography = {
  // Tamaños de fuente
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Pesos de fuente
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Estilos de texto predefinidos
  heading: {
    fontWeight: '700',
    fontSize: 24,
    color: '#1A202C',
    marginBottom: 16,
  },
  subheading: {
    fontWeight: '600',
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: '#718096',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
};

// Bordes redondeados
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Sombras
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Estilos comunes reutilizables
export const commonStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.container,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  section: {
    marginBottom: spacing.section,
  },
  
  // Elementos de formulario
  input: {
    height: 50,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.inputHorizontal,
    paddingVertical: spacing.inputVertical,
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputError: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // Botones
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.buttonVertical,
    paddingHorizontal: spacing.buttonHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonDisabled: {
    backgroundColor: colors.lightGray,
  },
  buttonDisabledText: {
    color: colors.gray,
  },
  
  // Textos
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  textSmall: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  
  // Flexbox helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Utilidades
  shadow: shadows.md,
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
});

// Exportar todo como un objeto unificado
export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
};
