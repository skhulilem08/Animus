import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetProfile } from '@workspace/api-client-react';
import { Screen, Header, Avatar, LoadingState, ErrorState, PostCard, Button, IconButton, CommunityPill } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const { data, isLoading, isError, refetch } = useGetProfile(1);
  const colors = useColors();

  if (isLoading) return <Screen><Header title="Profile" /><LoadingState label="Loading profile" /></Screen>;
  if (isError) return <Screen><Header title="Profile" /><ErrorState onRetry={refetch} /></Screen>;
  if (!data) return <Screen><Header title="Profile" /><Text>Not found</Text></Screen>;

  const { user, followerCount, followingCount, posts } = data;

  return (
    <Screen scroll={false}>
      <Header
        title={user.displayName}
        right={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <IconButton name="settings" size={24} onPress={() => router.push('/settings')} />
          </View>
        }
      />
      
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar author={user} size={96} />
          <Text style={[styles.name, { color: colors.foreground }]}>{user.displayName}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>
          
          <View style={{ marginTop: 12 }}>
            <CommunityPill name={user.communityName} color={user.communityColor} />
          </View>

          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{followerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button label="Edit Profile" variant="secondary" shape="pill" style={{ flex: 1 }} />
            <Button label="Share Profile" variant="secondary" shape="pill" style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.postsSection}>
          <Text style={[styles.postsLabel, { color: colors.foreground }]}>Posts</Text>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={() => {}} onComment={() => router.push(`/post/${post.id}`)} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
  name: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  username: { fontSize: 16, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 40, marginTop: 24, marginBottom: 24 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 14, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  postsSection: { marginTop: 8 },
  postsLabel: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
});