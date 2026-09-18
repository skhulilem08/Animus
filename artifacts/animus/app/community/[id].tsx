import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGetCommunity } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, CommunityPill, EmptyState, ErrorState, Header, LoadingState, PostCard, Screen, SectionLabel } from '@/components/AnimusUI';

export default function CommunityScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [joined, setJoined] = React.useState(false);
  const community = useGetCommunity(Number(id));
  if (community.isLoading) return <Screen><LoadingState label="Opening the room" /></Screen>;
  if (community.isError) return <Screen><ErrorState onRetry={() => community.refetch()} /></Screen>;
  const data = community.data;
  if (!data) return <Screen><EmptyState title="This room moved" body="Try discovering another community." /></Screen>;
  return (
    <Screen>
      <Header title={data.community.name} subtitle={`/${data.community.slug}`} right={<Pressable onPress={() => router.back()}><Feather name="x" size={22} color={colors.foreground} /></Pressable>} />
      <View style={[styles.hero, { backgroundColor: data.community.color }]}>
        <View style={[styles.hash, { backgroundColor: colors.card }]}><Feather name="hash" size={27} color={colors.foreground} /></View><CommunityPill community={data.community} /><Text style={[styles.heroTitle, { color: colors.accentForeground }]}>{data.community.description}</Text><Text style={[styles.memberCount, { color: colors.accentForeground }]}>{data.community.memberCount.toLocaleString()} members sharing the same wavelength</Text><Pressable onPress={() => setJoined((current) => !current)} style={({ pressed }) => [styles.joinButton, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.joinText, { color: colors.foreground }]}>{joined ? 'Joined' : 'Join community'}</Text></Pressable>
      </View>
      <SectionLabel>People in the room</SectionLabel>
      <View style={styles.members}>{data.members.slice(0, 6).map((member) => <View key={member.id} style={styles.member}><Avatar author={member} size={38} /><Text numberOfLines={1} style={[styles.memberName, { color: colors.foreground }]}>{member.displayName}</Text></View>)}</View>
      <SectionLabel>Recent signals</SectionLabel>
      {data.posts.length ? data.posts.map((post) => <PostCard key={post.id} post={post} onComment={() => router.push({ pathname: '/post/[id]', params: { id: String(post.id) } })} />) : <EmptyState icon="message-square" title="The room is waiting" body="Be the first to share something here." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, padding: 18, marginBottom: 23, minHeight: 203 },
  hash: { width: 53, height: 53, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  heroTitle: { fontSize: 21, lineHeight: 26, fontWeight: '700', marginTop: 12, maxWidth: 320 },
  memberCount: { fontSize: 12, marginTop: 8 },
  joinButton: { alignSelf: 'flex-start', marginTop: 16, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 },
  joinText: { fontSize: 13, fontWeight: '700' },
  members: { flexDirection: 'row', gap: 16, marginBottom: 23 },
  member: { width: 50, alignItems: 'center', gap: 5 },
  memberName: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});