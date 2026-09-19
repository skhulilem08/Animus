import React from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { Screen, Header, IconButton, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function SettingsPage() {
  const colors = useColors();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'user', label: 'Account Information' },
        { icon: 'bell', label: 'Notifications' },
        { icon: 'settings', label: 'Privacy & Security' },
      ],
    },
    {
      title: 'Help',
      items: [
        { icon: 'info', label: 'Help Center' },
        { icon: 'info', label: 'About Gimmi', action: () => router.push('/about') },
      ],
    },
    {
      title: 'Log out',
      items: [
        { icon: 'logout', label: 'Log out', color: colors.destructive },
      ],
    }
  ];

  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Settings" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <Pressable
                  key={i}
                  style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: i === section.items.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                  onPress={(item as any).action}
                >
                  <Icon name={item.icon as any} size={24} color={(item as any).color || colors.foreground} />
                  <Text style={[styles.rowLabel, { color: (item as any).color || colors.foreground }]}>{item.label}</Text>
                  {!(item as any).color && (
                    <View style={{ transform: [{ rotate: '180deg' }] }}>
                      <Icon name="arrow-left" size={20} color={colors.mutedForeground} />
                    </View>
                  )}
                </Pressable>
              ))}
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