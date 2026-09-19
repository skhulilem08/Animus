import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Avatar, IconButton } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VideoCall() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Mock video background */}
      <View style={[styles.videoBg, { backgroundColor: '#1C1C1E' }]}>
         <Text style={{ color: '#666' }}>Remote Video Stream {id}</Text>
      </View>
      
      {/* Local video PIP */}
      <View style={[styles.localPip, { top: insets.top + 16 }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#666', fontSize: 10 }}>Local</Text>
        </View>
      </View>

      <View style={[styles.controlsOverlay, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.controls}>
          <View style={styles.controlBtn}>
            <IconButton name="mic-off" size={28} color="#fff" style={styles.iconBox} />
            <Text style={styles.controlLabel}>Mute</Text>
          </View>
          <View style={styles.controlBtn}>
            <IconButton name="video-off" size={28} color="#fff" style={styles.iconBox} />
            <Text style={styles.controlLabel}>Camera</Text>
          </View>
          <View style={styles.controlBtn}>
            <IconButton name="phone-off" size={28} color="#fff" style={styles.iconBox} />
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
          <View style={styles.controlBtn}>
            <IconButton name="phone" size={28} color="#fff" style={[styles.iconBox, { backgroundColor: '#FF3B30' }]} onPress={() => router.back()} />
            <Text style={styles.controlLabel}>End</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  localPip: { position: 'absolute', right: 16, width: 100, height: 150, borderRadius: 12, backgroundColor: '#2C2C2E', overflow: 'hidden' },
  controlsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.4)' },
  controls: { flexDirection: 'row', justifyContent: 'space-between' },
  controlBtn: { alignItems: 'center', gap: 8 },
  iconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  controlLabel: { color: '#fff', fontSize: 13 },
});