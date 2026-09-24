import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar, Icon } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType } from 'expo-camera';
import { useConversationPerson } from '@/hooks/useConversationPerson';
import * as Haptics from 'expo-haptics';

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCall() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const person = useConversationPerson(Number(id));

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  useEffect(() => {
    if (!camPermission?.granted) requestCamPermission();
    if (!micPermission?.granted) requestMicPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same honest caveat as the voice call: no real signaling/media server, so
  // the "remote" side is always just waiting. What's real: your own camera
  // preview below, the timer, and the toggle state.
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [facing, setFacing] = useState<CameraType>('front');

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
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* "Remote" side — honestly just a waiting state, no signaling server exists to connect to */}
      <View style={styles.videoBg}>
        <Avatar author={person} size={96} />
        <Text style={styles.waitingName}>{person?.displayName ?? `Conversation ${id}`}</Text>
        <Text style={styles.waitingLabel}>Call preview · Not connected</Text>
      </View>

      <View style={[styles.localPip, { top: insets.top + 16 }]}>
        {cameraOff ? (
          <View style={styles.pipPlaceholder}>
            <Icon name="video-off" size={20} color="#8E8E93" />
          </View>
        ) : camPermission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing={facing} />
        ) : (
          <Pressable style={styles.pipPlaceholder} onPress={requestCamPermission}>
            <Text style={{ color: '#8E8E93', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 }}>Tap to allow camera</Text>
          </Pressable>
        )}
        {!cameraOff && camPermission?.granted && (
          <Pressable
            style={styles.flipBtn}
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
          >
            <Icon name="video" size={14} color="#fff" />
          </Pressable>
        )}
      </View>

      <View style={[styles.controlsOverlay, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.controls}>
          <View style={styles.controlBtn}>
            <Pressable onPress={() => toggle(setMuted)} style={[styles.iconBox, muted && styles.iconBoxActive]} accessibilityRole="button" accessibilityLabel="Toggle mute">
              <Icon name={muted ? 'mic-off' : 'mic'} size={28} color="#fff" />
            </Pressable>
            <Text style={styles.controlLabel}>Mute</Text>
          </View>
          <View style={styles.controlBtn}>
            <Pressable onPress={() => toggle(setCameraOff)} style={[styles.iconBox, cameraOff && styles.iconBoxActive]} accessibilityRole="button" accessibilityLabel="Toggle camera">
              <Icon name={cameraOff ? 'video-off' : 'video'} size={28} color="#fff" />
            </Pressable>
            <Text style={styles.controlLabel}>Camera</Text>
          </View>
          <View style={styles.controlBtn}>
            <Pressable onPress={() => toggle(setSpeakerOn)} style={[styles.iconBox, speakerOn && styles.iconBoxActive]} accessibilityRole="button" accessibilityLabel="Toggle speaker">
              <Icon name={speakerOn ? 'phone' : 'phone-off'} size={28} color="#fff" />
            </Pressable>
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
          <View style={styles.controlBtn}>
            <Pressable onPress={handleEnd} style={[styles.iconBox, { backgroundColor: '#FF3B30' }]} accessibilityRole="button" accessibilityLabel="End call">
              <Icon name="phone-off" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.controlLabel}>End</Text>
          </View>
        </View>
        <Text style={styles.timer}>Preview {formatDuration(seconds)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E', gap: 8 },
  waitingName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 12 },
  waitingLabel: { color: '#8E8E93', fontSize: 14 },
  localPip: { position: 'absolute', right: 16, width: 100, height: 150, borderRadius: 12, backgroundColor: '#2C2C2E', overflow: 'hidden' },
  pipPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flipBtn: { position: 'absolute', bottom: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  controlsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  controlBtn: { alignItems: 'center', gap: 8 },
  iconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: '#FFFFFF33', borderWidth: 1.5, borderColor: '#FFFFFF' },
  controlLabel: { color: '#fff', fontSize: 13 },
  timer: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 16 },
});
