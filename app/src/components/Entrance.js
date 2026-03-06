import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text } from 'react-native';

const Entrance = ({
  children,
  style,
  delay = 0,
  duration = 420,
  fromY = 14,
  fromOpacity = 0,
}) => {
  const opacity = useRef(new Animated.Value(fromOpacity)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  const normalizedChildren = useMemo(
    () =>
      React.Children.map(children, (child) => {
        if (child == null) return child;
        if (typeof child === 'string') {
          // Prevent RN crash when whitespace/newline nodes end up under a View/Animated.View.
          if (child.trim().length === 0) return null;
          return <Text>{child}</Text>;
        }
        if (typeof child === 'number') {
          return <Text>{String(child)}</Text>;
        }
        // Defensive: render accidental non-element objects safely.
        if (typeof child === 'object' && !React.isValidElement(child)) {
          return <Text>{String(child)}</Text>;
        }
        return child;
      }),
    [children]
  );

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {normalizedChildren}
    </Animated.View>
  );
};

export default Entrance;
