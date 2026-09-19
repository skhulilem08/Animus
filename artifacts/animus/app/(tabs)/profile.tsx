import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetProfile } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, EmptyState, ErrorState, Header, Icon, LoadingState, PostCard, Screen, SectionLabel } from '@/components/AnimusUI';

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const profile = useGetProfile(1);
  if (profile.isLoading) return <Screen><LoadingState label="Finding your profile" /></Screen>;
  if (profile.isError) return <Screen><ErrorState onRetry={() => profile.refetch()} /></Screen>;
  const data = profile.data;
  if (!data) return <Screen><EmptyState title="No profile yet" body="Your Animus profile will appear here." /></Screen>;
  return (
    <Screen>
      <Header title="Your profile" right={<Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => router.push('/notifications')}><Icon name="bell" size={21} color={colors.foreground} /></Pressable>} />
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Avatar author={data.user} size={76} /><Text style={[styles.displayName, { color: colors.foreground }]}>{data.user.displayName}</Text><Text style={[styles.username, { color: colors.mutedForeground }]}>@{data.user.username}</Text><View style={styles.communityLine}><View style={[styles.colorDot, { backgroundColor: data.user.communityColor }]} /><Text style={[styles.communityText, { color: colors.mutedForeground }]}>{data.user.communityName}</Text>{data.user.isPremium ? <View style={[styles.premium, { backgroundColor: colors.secondary }]}><Text style={[styles.premiumText, { color: colors.secondaryForeground }]}>PREMIUM</Text></View> : null}</View><View style={[styles.stats, { borderTopColor: colors.border }]}><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.foreground }]}>{data.followerCount}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text></View><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.foreground }]}>{data.followingCount}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text></View><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.foreground }]}>{data.posts.length}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text></View></View></View>
      <SectionLabel>Recent posts</SectionLabel>
      {data.posts.length ? data.posts.map((post) => <PostCard key={post.id} post={post} onComment={() => router.push({ pathname: '/post/[id]', params: { id: String(post.id) } })} />) : <EmptyState icon="pen-tool" title="Your first signal is waiting" body="Share a thought with your people." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderWidth: 1, borderRadius: 20, alignItems: 'center', padding: 19, marginBottom: 24 },
  displayName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  username: { fontSize: 13, marginTop: 3 },
  communityLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  colorDot: { width: 9, height: 9, borderRadius: 5 },
  communityText: { fontSize: 12 },
  premium: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, marginLeft: 2 },
  premiumText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  stats: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, marginTop: 19, paddingTop: 15 },
  stat: { alignItems: 'center', minWidth: 70 },
  statNumber: { fontSize: 17, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 3 },
});