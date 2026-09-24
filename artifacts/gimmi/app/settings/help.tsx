import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Screen, Header, IconButton, Icon, Text, SearchField } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

type FaqItem = { q: string; a: string };
type FaqSection = { title: string; items: FaqItem[] };

const SECTIONS: FaqSection[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is Gimmi?',
        a: "Gimmi is a community-centered social app — you post text, photos, and clips, join communities built around shared interests, and message people across those communities.",
      },
      {
        q: 'How do communities work?',
        a: "Every post belongs to a community. Joining a community lets you see its feed and gives your profile that community's accent color. You can browse and join communities from the Discover tab.",
      },
      {
        q: "Why can't I log out or switch accounts?",
        a: "Gimmi doesn't have accounts or sign-in yet — this build runs as a single demo profile for everyone. Account switching will need a real authentication system first.",
      },
    ],
  },
  {
    title: 'Posts & media',
    items: [
      {
        q: 'Why does my posted photo or video only show up on my device?',
        a: "Uploaded media is stored on the server and given a real URL, so it should be visible to everyone. If a post looks local-only, the upload likely failed silently and fell back to your device's local file — try posting again with a stronger connection.",
      },
      {
        q: 'Do filters, drawing, and text actually get saved onto my photo?',
        a: "Not yet — filters, drawings, and text you add in the editor are a live preview only. The original, unedited photo or video is what gets posted. Baking those edits into the file is planned but not built yet.",
      },
      {
        q: 'Can I edit or delete a post after sharing it?',
        a: "Not yet — there's no edit or delete flow for existing posts in this version.",
      },
    ],
  },
  {
    title: 'Messages & calls',
    items: [
      {
        q: 'Can I start a new conversation with someone from their profile?',
        a: "Only if you already have a conversation with them — there's no way to start a brand-new conversation from a profile yet. You can open existing conversations from the Messages tab.",
      },
      {
        q: 'Are voice and video calls real?',
        a: 'The call screens are fully interactive, but this build has no real signaling or media server behind them yet — think of them as a working interface without an actual live call.',
      },
    ],
  },
  {
    title: 'Privacy & notifications',
    items: [
      {
        q: 'Does turning on "Private account" actually restrict who sees my posts?',
        a: "Not yet. The Privacy & Security toggles are saved on your device, but there's no backend enforcement behind them yet — treat them as preferences, not protections, for now.",
      },
      {
        q: 'Will my notification settings follow me to another device?',
        a: "No — notification and privacy preferences are stored locally on this device only. There's no account system yet to sync them anywhere else.",
      },
    ],
  },
];

function FaqRow({ item, expanded, onToggle }: { item: FaqItem; expanded: boolean; onToggle: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onToggle} style={styles.faqRow} accessibilityRole="button" accessibilityLabel={item.q}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600', flex: 1 }}>{item.q}</Text>
        <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
          <Icon name="chevron" size={18} color={colors.mutedForeground} />
        </View>
      </View>
      {expanded && (
        <Text style={{ color: colors.mutedForeground, fontSize: 15, lineHeight: 21, marginTop: 8 }}>{item.a}</Text>
      )}
    </Pressable>
  );
}

export default function HelpCenterScreen() {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Help Center" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 20 }}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search help topics" />
        </View>

        {filteredSections.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingVertical: 24 }}>
            No results for "{query}".
          </Text>
        ) : (
          filteredSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.items.map((item, i) => {
                  const key = `${section.title}:${item.q}`;
                  return (
                    <View key={key} style={i === section.items.length - 1 ? undefined : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
                      <FaqRow item={item} expanded={expandedKey === key} onToggle={() => setExpandedKey((cur) => (cur === key ? null : key))} />
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <Pressable
          onPress={() => Linking.openURL('mailto:support@gimmi.app?subject=Gimmi%20support')}
          style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Email support"
        >
          <Icon name="mail" size={22} color={colors.tint} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>Still stuck?</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 14, marginTop: 2 }}>Email support@gimmi.app</Text>
          </View>
          <Icon name="chevron" size={18} color={colors.mutedForeground} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', fontWeight: '600', marginBottom: 8, paddingLeft: 4 },
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  faqRow: { padding: 16 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginTop: 8 },
});
