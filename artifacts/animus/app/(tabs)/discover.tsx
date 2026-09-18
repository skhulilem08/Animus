import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGetDiscover } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, CommunityPill, EmptyState, ErrorState, Header, LoadingState, Screen, SearchField, SectionLabel } from '@/components/AnimusUI';

export default function DiscoverScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const discover = useGetDiscover(query ? { query } : undefined);
  if (discover.isLoading) return <Screen><LoadingState label="Looking around" /></Screen>;
  if (discover.isError) return <Screen><ErrorState onRetry={() => discover.refetch()} /></Screen>;
  const data = discover.data;
  return (
    <Screen>
      <Header title="Discover" subtitle="Find a room that feels like yours." />
      <SearchField value={query} onChangeText={setQuery} placeholder="Search people, communities, topics" />
      <SectionLabel action="See all">Live now</SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveRow}>
        {(data?.people ?? []).filter((person) => person.isLive).map((person) => <Pressable key={person.id} onPress={() => router.push('/messages')} style={styles.liveItem}><View><Avatar author={person} size={56} /><View style={[styles.liveRing, { borderColor: colors.primary }]} /></View><Text numberOfLines={1} style={[styles.liveName, { color: colors.foreground }]}>{person.displayName}</Text></Pressable>)}
        {!data?.people?.some((person) => person.isLive) ? <Text style={[styles.quietText, { color: colors.mutedForeground }]}>No live rooms right now. That is okay.</Text> : null}
      </ScrollView>
      <SectionLabel>Communities worth a look</SectionLabel>
      <View style={styles.communityGrid}>
        {(data?.communities ?? []).map((community) => <Pressable key={community.id} onPress={() => router.push({ pathname: '/community/[id]', params: { id: String(community.id) } })} style={[styles.communityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.communityMark, { backgroundColor: community.color }]}><Feather name="hash" size={17} color={colors.accentForeground} /></View><CommunityPill community={community} /><Text style={[styles.communityName, { color: colors.foreground }]}>{community.name}</Text><Text numberOfLines={2} style={[styles.communityDescription, { color: colors.mutedForeground }]}>{community.description}</Text><Text style={[styles.memberCount, { color: colors.mutedForeground }]}>{community.memberCount.toLocaleString()} members</Text>
        </Pressable>)}
      </View>
      <SectionLabel>People to know</SectionLabel>
      {(data?.people ?? []).map((person) => <Pressable key={person.id} onPress={() => router.push('/messages')} style={[styles.personRow, { borderBottomColor: colors.border }]}><Avatar author={person} size={44} /><View style={{ flex: 1 }}><Text style={[styles.personName, { color: colors.foreground }]}>{person.displayName}</Text><Text style={[styles.personMeta, { color: colors.mutedForeground }]}>@{person.username} · {person.communityName}</Text></View><Feather name="user-plus" size={19} color={colors.primary} /></Pressable>)}
      {!data?.communities?.length && !data?.people?.length ? <EmptyState icon="compass" title="Nothing here yet" body="Try a wider search, or come back when the room gets lively." /> : null}
      {!!data?.topics?.length && <><SectionLabel>Topics in motion</SectionLabel><View style={styles.topicWrap}>{data.topics.map((topic) => <Pressable key={topic} onPress={() => setQuery(topic)} style={[styles.topic, { backgroundColor: colors.secondary }]}><Text style={[styles.topicText, { color: colors.secondaryForeground }]}>#{topic}</Text></Pressable>)}</View></>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  liveRow: { gap: 17, paddingBottom: 23 },
  liveItem: { alignItems: 'center', width: 68, gap: 7 },
  liveRing: { position: 'absolute', inset: -3, borderWidth: 2, borderRadius: 34 },
  liveName: { fontSize: 11, fontWeight: '600' },
  quietText: { fontSize: 13, paddingVertical: 17 },
  communityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  communityCard: { width: '48%', minHeight: 178, borderRadius: 17, borderWidth: 1, padding: 13 },
  communityMark: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  communityName: { fontSize: 16, fontWeight: '700', marginTop: 9 },
  communityDescription: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  memberCount: { fontSize: 11, marginTop: 'auto', paddingTop: 10 },
  personRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1 },
  personName: { fontSize: 15, fontWeight: '700' },
  personMeta: { fontSize: 12, marginTop: 3 },
  topicWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topic: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 },
  topicText: { fontSize: 13, fontWeight: '600' },
});