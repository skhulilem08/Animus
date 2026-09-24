import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { Screen, Header, IconButton, Icon, Text, IconName } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

type SettingsItem = { icon: IconName; label: string; action: () => void; destructive?: boolean };

export default function SettingsPage() {
  const colors = useColors();

  const handleLogOut = () => {
    // There's no authentication system in this app yet (the whole app runs
    // as a single hardcoded viewer — profile id 1). A real "log out" needs
    // an actual auth/session layer first; until then, being honest about
    // that beats a button that silently does nothing.
    Alert.alert(
      "Can't log out yet",
      "Gimmi doesn't have accounts or sign-in yet, so there's nothing to log out of — every session is the same demo profile.",
    );
  };

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'user', label: 'Account Information', action: () => router.push('/settings/account') },
        { icon: 'bell', label: 'Notifications', action: () => router.push('/settings/notifications') },
        { icon: 'settings', label: 'Privacy & Security', action: () => router.push('/settings/privacy') },
      ],
    },
    {
      title: 'Help',
      items: [
        { icon: 'info', label: 'Help Center', action: () => router.push('/settings/help') },
        { icon: 'info', label: 'About Gimmi', action: () => router.push('/about') },
      ],
    },
    {
      title: 'Log out',
      items: [
        { icon: 'logout', label: 'Log out', action: handleLogOut, destructive: true },
      ],
    },
  ];

  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Settings" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => {
                const tint = item.destructive ? colors.destructive : colors.foreground;
                return (
                  <Pressable
                    key={i}
                    style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: i === section.items.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                    onPress={item.action}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    <Icon name={item.icon} size={24} color={tint} />
                    <Text style={[styles.rowLabel, { color: tint }]}>{item.label}</Text>
                    {!item.destructive && <Icon name="chevron" size={20} color={colors.mutedForeground} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', fontWeight: '600', marginBottom: 8, paddingLeft: 16 },
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowLabel: { flex: 1, fontSize: 17, marginLeft: 16 },
});
