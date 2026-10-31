import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  Keyboard,
  TextInput,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';

/**
 * Drop-in ScrollView replacement that:
 * 1. Keeps taps responsive while keyboard is open (keyboardShouldPersistTaps="handled")
 * 2. Adds dynamic bottom breathing space when keyboard is open so bottom inputs & submit
 *    buttons can always be scrolled completely above the keyboard
 * 3. Automatically scrolls any focused TextInput into clear view above the soft keyboard
 */
export default function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  extraScrollHeight = 44,
  onScroll,
  ...rest
}) {
  const scrollRef = useRef(null);
  const scrollYRef = useRef(0);
  const keyboardTopRef = useRef(0);
  const [keyboardPad, setKeyboardPad] = useState(0);

  const ensureFocusedInputVisible = useCallback(
    (kbScreenY) => {
      const targetKbTop =
        kbScreenY || keyboardTopRef.current || Dimensions.get('window').height * 0.58;
      const focusedInput = TextInput.State?.currentlyFocusedInput?.();
      if (!focusedInput || !scrollRef.current || typeof focusedInput.measureInWindow !== 'function') {
        return;
      }

      const runMeasureAndScroll = () => {
        try {
          const currentFocused = TextInput.State?.currentlyFocusedInput?.();
          if (!currentFocused || !scrollRef.current || typeof currentFocused.measureInWindow !== 'function') {
            return;
          }
          currentFocused.measureInWindow((ix, iy, iw, ih) => {
            if (!ih) return;
            scrollRef.current?.measureInWindow?.((sx, sy, sw, sh) => {
              const visibleBottom = Math.min(sy + sh, targetKbTop) - 20;
              const inputBottom = iy + ih;
              if (inputBottom > visibleBottom) {
                const delta = inputBottom - visibleBottom + extraScrollHeight;
                scrollRef.current?.scrollTo?.({
                  y: Math.max(0, scrollYRef.current + delta),
                  animated: true,
                });
              }
            });
          });
        } catch (e) {}
      };

      setTimeout(runMeasureAndScroll, 80);
      setTimeout(runMeasureAndScroll, 240);
    },
    [extraScrollHeight]
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e?.endCoordinates?.height || 280;
      const kbScreenY =
        e?.endCoordinates?.screenY || Dimensions.get('window').height - kbHeight;
      keyboardTopRef.current = kbScreenY;
      setKeyboardPad(Math.min(kbHeight * 0.55 + 48, 220));
      ensureFocusedInputVisible(kbScreenY);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = 0;
      setKeyboardPad(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [ensureFocusedInputVisible]);

  const flattenedContent = StyleSheet.flatten(contentContainerStyle) || {};
  const basePaddingBottom =
    typeof flattenedContent.paddingBottom === 'number'
      ? flattenedContent.paddingBottom
      : typeof flattenedContent.padding === 'number'
        ? flattenedContent.padding
        : 28;

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      scrollEventThrottle={16}
      onScroll={(e) => {
        scrollYRef.current = e?.nativeEvent?.contentOffset?.y || 0;
        if (onScroll) onScroll(e);
      }}
      onTouchEnd={() => {
        if (keyboardTopRef.current > 0) {
          ensureFocusedInputVisible(keyboardTopRef.current);
        }
      }}
      contentContainerStyle={[
        contentContainerStyle,
        keyboardPad > 0 && { paddingBottom: basePaddingBottom + keyboardPad },
      ]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
