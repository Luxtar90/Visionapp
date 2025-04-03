import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#FF69B4', // Rosa principal
  primaryLight: '#FFB6C1', // Rosa claro
  primaryDark: '#FF1493', // Rosa oscuro
  secondary: '#9370DB', // Púrpura
  secondaryLight: '#E6E6FA', // Lavanda
  accent: '#FFD700', // Dorado
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#2196F3',
  background: '#FFF9FC', // Fondo rosa muy claro
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  border: '#FFECF2', // Borde rosa muy claro
  divider: '#F5F5F5',
  skeleton: '#F0F0F0',
  shimmer: '#E8E8E8',
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  } as ViewStyle,
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  } as ViewStyle,
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 7.84,
    elevation: 8,
  } as ViewStyle,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '600',
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  } as TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
  } as TextStyle,
};

const theme = {
  colors,
  shadows,
  spacing,
  borderRadius,
  typography,
};

export default theme;
