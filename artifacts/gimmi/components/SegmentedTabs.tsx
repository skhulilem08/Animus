import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/GimmiUI';
import { useColors } from '@/hooks/useColors';

type Props = {
  labels: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

/** Two stationary, independently fading selection pills — no travelling indicator. */
export function SegmentedTabs({ labels, selectedIndex, onChange }: Props) {
  const colors = useColors();
  const opacity = useRef(labels.map((_, index) => new Animated.Value(index === selectedIndex ? 1 : 0))).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const glassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable();

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    const animation = Animated.parallel(opacity.map((value, index) => Animated.timing(value, {
      toValue: index === selectedIndex ? 1 : 0,
      duration: reduceMotion ? 0 : 170,
      useNativeDriver: Platform.OS !== 'web',
    })));
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion, selectedIndex]);

  const segments = labels.map((label, index) => (
    <Pressable
      key={label}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: index === selectedIndex }}
      onPress={() => {
        if (index === selectedIndex) return;
        if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        onChange(index);
      }}
      style={({ pressed }) => [styles.segment, pressed && { opacity: 0.72 }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.selectedFill, { backgroundColor: colors.card, opacity: opacity[index] }]}
      />
      <Text style={[styles.label, { color: index === selectedIndex ? colors.foreground : colors.mutedForeground, fontWeight: index === selectedIndex ? '600' : '500' }]}>
        {label}
      </Text>
    </Pressable>
  ));

  return (
    glassAvailable ? (
      <GlassView glassEffectStyle="regular" isInteractive={false} style={styles.track}>{segments}</GlassView>
    ) : (
      <View style={[styles.track, { backgroundColor: colors.secondary }]}>{segments}</View>
    )
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 999, padding: 4, minHeight: 48, overflow: 'hidden' },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  selectedFill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 999 },
  label: { fontSize: 15, lineHeight: 20 },
});