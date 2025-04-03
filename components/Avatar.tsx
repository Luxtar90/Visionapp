import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  badgeSize?: number;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  bordered?: boolean;
  borderColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  variant = 'circle',
  backgroundColor,
  textColor,
  style,
  textStyle,
  onPress,
  showBadge = false,
  badgeColor = theme.colors.success,
  badgeIcon,
  badgeSize = 10,
  badgePosition = 'bottom-right',
  bordered = false,
  borderColor = theme.colors.white,
}) => {
  // Obtener el tamaño según la propiedad size
  const getSize = () => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  // Obtener el radio de borde según la variante
  const getBorderRadius = () => {
    const avatarSize = getSize();
    switch (variant) {
      case 'circle':
        return avatarSize / 2;
      case 'rounded':
        return theme.borderRadius.md;
      case 'square':
        return 0;
      default:
        return avatarSize / 2;
    }
  };

  // Obtener el tamaño de fuente según el tamaño del avatar
  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return theme.typography.fontSizes.xs;
      case 'sm':
        return theme.typography.fontSizes.sm;
      case 'md':
        return theme.typography.fontSizes.md;
      case 'lg':
        return theme.typography.fontSizes.lg;
      case 'xl':
        return theme.typography.fontSizes.xl;
      default:
        return theme.typography.fontSizes.md;
    }
  };

  // Obtener las iniciales del nombre
  const getInitials = () => {
    if (!name) return '';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  };

  // Obtener la posición del badge
  const getBadgePosition = () => {
    switch (badgePosition) {
      case 'top-right':
        return { top: 0, right: 0 };
      case 'top-left':
        return { top: 0, left: 0 };
      case 'bottom-right':
        return { bottom: 0, right: 0 };
      case 'bottom-left':
        return { bottom: 0, left: 0 };
      default:
        return { bottom: 0, right: 0 };
    }
  };

  // Generar un color de fondo basado en el nombre
  const generateColorFromName = () => {
    if (!name) return theme.colors.primary;
    
    const charCodeSum = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.info,
      theme.colors.success,
    ];
    
    return colors[charCodeSum % colors.length];
  };

  const avatarSize = getSize();
  const borderRadius = getBorderRadius();
  const fontSize = getFontSize();
  const bgColor = backgroundColor || generateColorFromName();
  const txtColor = textColor || theme.colors.white;
  const badgePositionStyle = getBadgePosition();
  const badgeDimension = badgeSize || avatarSize / 4;

  const AvatarContainer = onPress ? TouchableOpacity : View;

  return (
    <AvatarContainer
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: borderRadius,
          backgroundColor: !source ? bgColor : undefined,
        },
        bordered && {
          borderWidth: 2,
          borderColor: borderColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {source ? (
        <Image
          source={source}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: borderRadius,
          }}
          resizeMode="cover"
        />
      ) : name ? (
        <Text
          style={[
            styles.text,
            {
              fontSize: fontSize,
              color: txtColor,
            },
            textStyle,
          ]}
        >
          {getInitials()}
        </Text>
      ) : (
        <Ionicons
          name="person"
          size={avatarSize / 2}
          color={theme.colors.white}
        />
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeDimension,
              height: badgeDimension,
              borderRadius: badgeDimension / 2,
              backgroundColor: badgeColor,
              ...badgePositionStyle,
            },
          ]}
        >
          {badgeIcon && (
            <Ionicons
              name={badgeIcon}
              size={badgeDimension * 0.7}
              color={theme.colors.white}
            />
          )}
        </View>
      )}
    </AvatarContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
});

export default Avatar;
