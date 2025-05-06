// src/components/Admin/CustomTabBar.tsx
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
  // Agrupamos las pestañas en categorías
  const mainTabs = ['Dashboard', 'Clientes', 'Empleados', 'Configuracion', 'Perfil'];
  const secondaryTabs = ['Servicios', 'Productos', 'Reservas', 'Ventas'];
  
  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === index;

    let iconName = 'help-outline';
    switch (route.name) {
      case 'Dashboard':
        iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
        break;
      case 'Clientes':
        iconName = isFocused ? 'people' : 'people-outline';
        break;
      case 'Empleados':
        iconName = isFocused ? 'briefcase' : 'briefcase-outline';
        break;
      case 'Servicios':
        iconName = isFocused ? 'cut' : 'cut-outline';
        break;
      case 'Productos':
        iconName = isFocused ? 'pricetag' : 'pricetag-outline';
        break;
      case 'Reservas':
        iconName = isFocused ? 'calendar' : 'calendar-outline';
        break;
      case 'Ventas':
        iconName = isFocused ? 'cash' : 'cash-outline';
        break;
      case 'Configuracion':
        iconName = isFocused ? 'settings' : 'settings-outline';
        break;
      case 'Perfil':
        iconName = isFocused ? 'person' : 'person-outline';
        break;
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
            size={22} 
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          // Solo mostrar las pestañas principales en la primera fila
          if (mainTabs.includes(route.name)) {
            return renderTab(route, index);
          }
          return null;
        })}
      </View>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          // Solo mostrar las pestañas secundarias en la segunda fila
          if (secondaryTabs.includes(route.name)) {
            return renderTab(route, index);
          }
          return null;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  }
});

export default CustomTabBar;
