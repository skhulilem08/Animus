import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar, Icon } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversationPerson } from '@/hooks/useConversationPerson';
import * as Haptics from 'expo-haptics';

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceCall() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const person = useConversationPerson(Number(id));

  // There's no real signaling/media server behind this call — see
  // Help Center → "Are voice and video calls real?". What IS real here:
  // the participant identity, the elapsed-time timer, and the mute/speaker
  // toggle state (which has nothing to actually route audio to yet).
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setter((v) => !v);
  };

  const handleEnd = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#1C1C1E', paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Avatar author={person} size={120} />
        <Text style={styles.name}>{person?.displayName ?? `Conversation ${id}`}</Text>
        <Text style={styles.status}>{formatDuration(seconds)}</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlBtn}>
          <Pressable onPress={() => toggle(setSpeakerOn)} style={[styles.iconBox, speakerOn && styles.iconBoxActive]} accessibilityRole="button" accessibilityLabel="Toggle speaker">
            <Icon name={speakerOn ? 'phone' : 'phone-off'} size={32} color="#fff" />
          </Pressable>
          <Text style={styles.controlLabel}>Speaker</Text>
        </View>
        <View style={styles.controlBtn}>
          <Pressable onPress={() => toggle(setMuted)} style={[styles.iconBox, muted && styles.iconBoxActive]} accessibilityRole="button" accessibilityLabel="Toggle mute">
            <Icon name={muted ? 'mic-off' : 'mic'} size={32} color="#fff" />
          </Pressable>
          <Text style={styles.controlLabel}>Mute</Text>
        </View>
        <View style={styles.controlBtn}>
          <Pressable onPress={handleEnd} style={[styles.iconBox, { backgroundColor: '#FF3B30' }]} accessibilityRole="button" accessibilityLabel="End call">
            <Icon name="phone-off" size={32} color="#fff" />
          </Pressable>
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
  iconBoxActive: { backgroundColor: '#FFFFFF33', borderWidth: 1.5, borderColor: '#FFFFFF' },
  controlLabel: { color: '#fff', fontSize: 13 },
});
