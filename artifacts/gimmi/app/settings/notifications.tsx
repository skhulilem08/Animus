import React from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { Screen, Header, IconButton, Text } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useLocalToggle } from '@/hooks/useLocalToggle';

function ToggleRow({ label, storageKey, defaultValue = true, last = false }: { label: string; storageKey: string; defaultValue?: boolean; last?: boolean }) {
  const colors = useColors();
  const [value, setValue] = useLocalToggle(storageKey, defaultValue);
  return (
    <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
      <Text style={{ color: colors.foreground, fontSize: 17, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={setValue} trackColor={{ true: colors.tint }} />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const colors = useColors();
  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Notifications" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, marginBottom: 8, paddingHorizontal: 4, textTransform: 'uppercase' }}>Push notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow label="Likes" storageKey="notif-likes" />
          <ToggleRow label="Comments" storageKey="notif-comments" />
          <ToggleRow label="New followers" storageKey="notif-follows" />
          <ToggleRow label="Messages" storageKey="notif-messages" />
          <ToggleRow label="Live streams" storageKey="notif-live" last />
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 16, paddingHorizontal: 4 }}>
          These are saved on this device only — there's no server-side notification preference sync yet.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
});
