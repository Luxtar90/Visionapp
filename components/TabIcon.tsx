import { Ionicons } from '@expo/vector-icons';
import Animated, { withSpring, useAnimatedStyle } from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}

export const TabIcon = ({ name, color, focused = false }: TabIconProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.2 : 1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedIcon
      name={name}
      size={24}
      color={color}
      style={animatedStyle}
    />
  );
};
