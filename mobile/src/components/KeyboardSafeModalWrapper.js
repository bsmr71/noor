import React from 'react';
import { KeyboardAvoidingView, View, StyleSheet, Platform } from 'react-native';

/**
 * Universal keyboard-safe container for bottom-sheet <Modal transparent> forms.
 * Uses an inner flex:1 View inside KeyboardAvoidingView(behavior="padding") so
 * child sheets with percentage maxHeight shrink cleanly above the soft keyboard
 * without pushing modal headers off-screen on Android Edge-to-Edge (SDK 35/36) or iOS.
 */
export default function KeyboardSafeModalWrapper({
  children,
  backdropColor = 'rgba(0, 0, 0, 0.62)',
  keyboardVerticalOffset = 0,
}) {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? keyboardVerticalOffset : keyboardVerticalOffset
      }
      style={[styles.outer, { backgroundColor: backdropColor }]}
    >
      <View style={styles.inner}>{children}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

