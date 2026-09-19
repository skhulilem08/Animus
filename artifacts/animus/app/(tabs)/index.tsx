import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { getGetFeedQueryKey, useGetFeed, useTogglePostLike } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, EmptyState, ErrorState, Header, Icon, LoadingState, PostCard, Screen, SectionLabel } from '@/components/AnimusUI';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const feed = useGetFeed({ viewerId: 1 });
  const likeMutation = useTogglePostLike();
  const posts = feed.data?.posts ?? [];
  const viewer = feed.data?.viewer;

  const toggleLike = (postId: number) => {
    likeMutation.mutate({ postId, data: { viewerId: 1 } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey({ viewerId: 1 }) }),
    });
  };

  if (feed.isLoading) return <Screen><LoadingState label="Tuning your corner of Animus" /></Screen>;
  if (feed.isError) return <Screen><ErrorState onRetry={() => feed.refetch()} /></Screen>;

  return (
    <Screen>
      <Header title="Good morning" subtitle="A slower, better kind of feed." right={<Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => router.push('/notifications')}><View><Icon name="bell" size={22} color={colors.foreground} /><View style={[styles.notificationDot, { backgroundColor: colors.primary }]} /></View></Pressable>} />
      <View style={[styles.introCard, { backgroundColor: colors.primary }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.introKicker, { color: colors.primaryForeground }]}>YOUR PEOPLE, TODAY</Text>
          <Text style={[styles.introTitle, { color: colors.primaryForeground }]}>Make room for the good stuff.</Text>
        </View>
        <Avatar author={viewer} size={50} />
      </View>
      <SectionLabel action="Discover" onPress={() => router.push('/discover')}>For your attention</SectionLabel>
      {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} onComment={() => router.push({ pathname: '/post/[id]', params: { id: String(post.id) } })} />) : <EmptyState icon="wind" title="Your feed is quiet" body="Follow a room or share something to start your rhythm." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notificationDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, top: -1, right: -3 },
  introCard: { minHeight: 128, borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
  introKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: 10 },
  introTitle: { fontSize: 22, lineHeight: 27, fontWeight: '700', maxWidth: 230, letterSpacing: -0.5 },
});
