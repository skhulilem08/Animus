import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetCommunity, useGetFeed, useTogglePostLike } from '@workspace/api-client-react';
import { Screen, Header, IconButton, LoadingState, ErrorState, PostCard, Button, Avatar } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useQueryClient } from '@tanstack/react-query';

export default function CommunityPage() {
  const { id } = useLocalSearchParams();
  const { data, isLoading, isError, refetch } = useGetCommunity(Number(id));
  const { data: feed } = useGetFeed();
  const toggleLike = useTogglePostLike();
  const queryClient = useQueryClient();
  const colors = useColors();

  if (isLoading) return <Screen><Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Community" /><LoadingState /></Screen>;
  if (isError) return <Screen><Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Community" /><ErrorState onRetry={refetch} /></Screen>;
  if (!data) return null;

  const { community, posts, members } = data;

  const handleLike = (postId: number) => {
    if (!feed?.viewer.id) return;
    toggleLike.mutate(
      { postId, data: { viewerId: feed.viewer.id } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] }) },
    );
  };

  const handleJoin = () => {
    // No join/leave-community endpoint exists on the backend yet.
    Alert.alert("Can't join yet", "Joining communities isn't available in this version of Gimmi yet.");
  };

  return (
    <Screen scroll={false}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title={community.name}
        right={<IconButton name="more-horizontal" onPress={() => Alert.alert('Nothing here yet', 'Community options are not available in this version of Gimmi.')} label="More options" />}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: community.color }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{community.name}</Text>
            <Text style={styles.heroStats}>{community.memberCount} members</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.desc, { color: colors.foreground }]}>{community.description}</Text>
          
          <Button label="Join Community" style={{ marginVertical: 24 }} onPress={handleJoin} />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Members</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            {members.map(m => (
              <View key={m.id} style={styles.memberAvatar}>
                <Avatar author={m} size={48} />
              </View>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Posts</Text>
          {posts.map(p => (
            <PostCard key={p.id} post={p} onLike={() => handleLike(p.id)} onComment={() => router.push(`/post/${p.id}`)} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 200, width: '100%', justifyContent: 'flex-end', padding: 24 },
  heroContent: {},
  heroTitle: { fontSize: 32, fontWeight: '700', color: '#fff' },
  heroStats: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: 16 },
  desc: { fontSize: 16, lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  memberAvatar: { width: 48, height: 48 },
});