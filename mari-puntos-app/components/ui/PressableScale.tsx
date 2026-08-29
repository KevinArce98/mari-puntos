import React from 'react';

import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated via `.value` by design
        scale.value = reducedMotion ? 1 : withTiming(0.97, { duration: 100 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated via `.value` by design
        scale.value = reducedMotion ? 1 : withSpring(1, { damping: 18, stiffness: 350 });
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
};
