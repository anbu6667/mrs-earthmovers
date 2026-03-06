import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const shouldWrapStringChild = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  return false;
};

export default function installRawTextGuard() {
  if (!__DEV__) return;
  if (global.__mrs_raw_text_guard_installed) return;

  const origCreateElement = React.createElement;

  const WRAP_PARENTS = new Set([
    View,
    ScrollView,
    Pressable,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
    SafeAreaView,
    KeyboardAvoidingView,
  ]);

  React.createElement = function patchedCreateElement(type, props, ...children) {
    if (type && WRAP_PARENTS.has(type) && children && children.length) {
      let mutated = false;
      const nextChildren = children.map((child) => {
        if (shouldWrapStringChild(child)) {
          mutated = true;
          return origCreateElement(Text, null, String(child));
        }
        return child;
      });

      if (mutated) {
        // This stack points to the JSX source location in dev.
        // eslint-disable-next-line no-console
        console.warn('Raw text child auto-wrapped in <Text>. Trace:', new Error().stack);
        return origCreateElement(type, props, ...nextChildren);
      }
    }

    return origCreateElement(type, props, ...children);
  };

  global.__mrs_raw_text_guard_installed = true;
}
