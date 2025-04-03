import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

export interface AvatarProps {
  source?: ImageSourcePropType;
  size?: number;
  name?: string;
  showBadge?: boolean;
  badgeIcon?: IconName;
  badgeColor?: string;
  badgeSize?: number;
  onPress?: () => void;
  bordered?: boolean;
  borderColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  name,
  showBadge = false,
  badgeIcon = 'checkmark-circle',
  badgeColor = colors.primary,
  badgeSize = 20,
  onPress,
  bordered = false,
  borderColor = colors.white,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AvatarContent = () => (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: bordered ? 2 : 0,
          borderColor: borderColor,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : name ? (
        <View
          style={[
            styles.initialsContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: size * 0.4,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Ionicons name="person" size={size * 0.6} color={colors.textLight} />
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: -badgeSize / 4,
              bottom: -badgeSize / 4,
            },
          ]}
        >
          <Ionicons name={badgeIcon} size={badgeSize * 0.6} color={colors.white} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.skeleton,
  },
  initialsContainer: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: colors.skeleton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default Avatar; 