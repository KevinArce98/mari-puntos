import * as React from 'react';

import {
  Animated,
  ColorValue,
  Easing,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useTheme } from 'expo-router';

// expo-router no longer re-exports @react-navigation/elements' PlatformPressable
// (SDK 56+), so this is copied locally per Expo's own migration guidance:
// https://docs.expo.dev/router/migrate/sdk-55-to-56/
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ANDROID_SUPPORTS_RIPPLE = Platform.OS === 'android' && Platform.Version >= 21;
const useNativeDriver = Platform.OS !== 'web';

type PlatformPressableProps = Omit<PressableProps, 'style' | 'onPress'> & {
  pressColor?: ColorValue;
  pressOpacity?: number;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  onPress?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
};

function PlatformPressable({
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  android_ripple,
  pressColor,
  pressOpacity = 0.3,
  style,
  children,
  ...rest
}: PlatformPressableProps) {
  const { dark } = useTheme();
  const [opacity] = React.useState(() => new Animated.Value(1));

  const animateTo = (toValue: number, duration: number) => {
    if (ANDROID_SUPPORTS_RIPPLE) return;
    Animated.timing(opacity, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver,
    }).start();
  };

  return (
    <AnimatedPressable
      accessible
      onPress={disabled ? undefined : onPress}
      onPressIn={(e) => {
        animateTo(pressOpacity, 0);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1, 200);
        onPressOut?.(e);
      }}
      android_ripple={
        ANDROID_SUPPORTS_RIPPLE && !disabled
          ? {
              color:
                pressColor ?? (dark ? 'rgba(255, 255, 255, .32)' : 'rgba(0, 0, 0, .32)'),
              ...android_ripple,
            }
          : undefined
      }
      style={[
        {
          cursor:
            (Platform.OS === 'web' || Platform.OS === 'ios') && !disabled
              ? 'pointer'
              : 'auto',
          opacity: !ANDROID_SUPPORTS_RIPPLE && !disabled ? opacity : 1,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export function HapticTab(props: PlatformPressableProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
