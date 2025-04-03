import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  icon,
  iconColor,
  rightIcon,
  onRightIconPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  elevation = 'sm',
  bordered = false,
  footer,
}) => {
  // Obtener el estilo de sombra según la elevación
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return theme.shadows.none;
      case 'xs':
        return theme.shadows.xs;
      case 'sm':
        return theme.shadows.sm;
      case 'md':
        return theme.shadows.md;
      case 'lg':
        return theme.shadows.lg;
      case 'xl':
        return theme.shadows.xl;
      default:
        return theme.shadows.sm;
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[
        styles.container,
        getShadowStyle(),
        bordered && styles.bordered,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle || icon || rightIcon) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && (
              <Ionicons
                name={icon}
                size={24}
                color={iconColor || theme.colors.primary}
                style={styles.icon}
              />
            )}
            <View>
              {title && (
                <Text style={[styles.title, titleStyle]}>{title}</Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
              )}
            </View>
          </View>
          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
              <Ionicons
                name={rightIcon}
                size={24}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default Card;
