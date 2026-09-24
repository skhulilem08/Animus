import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useColors } from '@/hooks/useColors';

type Props = {
  labels: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

/** The stationary, full-width underline tabs used on Profile and Messages. */
export function UnderlineTabs({ labels, selectedIndex, onChange, style }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.tabs, style]}>
      {labels.map((label, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => { if (!selected) onChange(index); }}
            style={styles.tab}
          >
            <Text style={[styles.tabText, { color: selected ? colors.foreground : colors.mutedForeground, fontWeight: selected ? '600' : '500' }]}>
              {label}
            </Text>
            <View style={[styles.underline, { backgroundColor: selected ? colors.foreground : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, gap: 11 },
  tabText: { fontSize: 15, lineHeight: 20 },
  underline: { width: '100%', height: 2, borderRadius: 999 },
});