import React from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { Screen, Header, IconButton, Text } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useLocalToggle } from '@/hooks/useLocalToggle';

function ToggleRow({ label, sublabel, storageKey, defaultValue = false, last = false }: { label: string; sublabel?: string; storageKey: string; defaultValue?: boolean; last?: boolean }) {
  const colors = useColors();
  const [value, setValue] = useLocalToggle(storageKey, defaultValue);
  return (
    <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: colors.foreground, fontSize: 17 }}>{label}</Text>
        {sublabel ? <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>{sublabel}</Text> : null}
      </View>
      <Switch value={value} onValueChange={setValue} trackColor={{ true: colors.tint }} />
    </View>
  );
}

export default function PrivacySettingsScreen() {
  const colors = useColors();
  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Privacy & Security" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow label="Private account" sublabel="Only approved followers can see your posts" storageKey="privacy-private-account" />
          <ToggleRow label="Show online status" storageKey="privacy-online-status" defaultValue />
          <ToggleRow label="Read receipts" sublabel="Let people see when you've read their messages" storageKey="privacy-read-receipts" defaultValue last />
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 16, paddingHorizontal: 4 }}>
          These are saved on this device only — there's no backend enforcement of these settings yet (e.g. a private account won't actually block non-followers from seeing posts).
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
});
