import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';

const AnimatedPressable = ({
  children,
  style,
  scaleTo = 0.97,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  const handlePressIn = (e) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
    onPressOut?.(e);
  };

  const handlePress = (e) => {
    // Ensure we don't carry a "pressed" visual state into a navigation transition.
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
    onPress?.(e);
  };

  const normalizedChildren = useMemo(
    () =>
      React.Children.map(children, (child) => {
        if (child == null) return child;
        if (typeof child === 'string') {
          // Remove whitespace-only text nodes that can crash RN when placed under a View/Pressable.
          if (child.trim().length === 0) return null;
          return <Text>{child}</Text>;
        }
        if (typeof child === 'number') {
          return <Text>{String(child)}</Text>;
        }
        // If someone accidentally passes a plain object/array as a child, render a safe string
        // instead of crashing with "Objects are not valid as a React child".
        if (typeof child === 'object' && !React.isValidElement(child)) {
          return <Text>{String(child)}</Text>;
        }
        return child;
      }),
    [children]
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        {...props}
        disabled={disabled}
        onPress={disabled ? undefined : handlePress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
      >
        {normalizedChildren}
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedPressable;
