import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen, Avatar, IconButton } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoiceCall() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: '#1C1C1E', paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Avatar size={120} />
        <Text style={styles.name}>User {id}</Text>
        <Text style={styles.status}>00:24</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlBtn}>
          <IconButton name="phone-off" size={32} color="#fff" style={styles.iconBox} />
          <Text style={styles.controlLabel}>Speaker</Text>
        </View>
        <View style={styles.controlBtn}>
          <IconButton name="mic-off" size={32} color="#fff" style={styles.iconBox} />
          <Text style={styles.controlLabel}>Mute</Text>
        </View>
        <View style={styles.controlBtn}>
          <IconButton name="phone" size={32} color="#fff" style={[styles.iconBox, { backgroundColor: '#FF3B30' }]} onPress={() => router.back()} />
          <Text style={styles.controlLabel}>End</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  top: { alignItems: 'center', marginTop: 80 },
  name: { fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 24 },
  status: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingBottom: 64 },
  controlBtn: { alignItems: 'center', gap: 8 },
  iconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  controlLabel: { color: '#fff', fontSize: 13 },
});