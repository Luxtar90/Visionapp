// src/components/Cliente/CustomTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// Definimos el tipo de las props manualmente para evitar el error
interface CustomTabBarProps {
  state: {
    routes: Array<{
      key: string;
      name: string;
    }>;
    index: number;
  };
  descriptors: {
    [key: string]: {
      options: any;
    };
  };
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }: CustomTabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        // Ocultar las pantallas que no deben aparecer en la barra de navegación
        if (route.name === 'Carrito' || route.name === 'Notificaciones' || route.name === 'CalificarServicio' || route.name === 'TodasResenas') {
          return null;
        }

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        let iconName = 'help-outline';
        if (route.name === 'NuevaReserva') {
          iconName = isFocused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'MisReservas') {
          iconName = isFocused ? 'list' : 'list-outline';
        } else if (route.name === 'Productos') {
          iconName = isFocused ? 'basket' : 'basket-outline';
        } else if (route.name === 'Historial') {
          iconName = isFocused ? 'time' : 'time-outline';
        } else if (route.name === 'MiPerfil') {
          iconName = isFocused ? 'person' : 'person-outline';
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // @ts-ignore - La navegación puede tener diferentes tipos según la configuración
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name={iconName as any} 
                size={24} 
                color={isFocused ? colors.primary : colors.textLight} 
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? colors.primary : colors.textLight }
              ]}>
                {label as string}
              </Text>
              {isFocused && <View style={styles.indicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default CustomTabBar;
