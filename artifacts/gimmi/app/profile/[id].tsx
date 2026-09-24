import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Screen, Header, Avatar, LoadingState, ErrorState, PostCard, Button, IconButton, CommunityPill } from '@/components/GimmiUI';
import { useGetProfile, useGetFeed, useToggleFollow, useGetMessages, FollowResponse, Conversation, Post } from '@workspace/api-client-react';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = Number(id);
  const colors = useColors();

  const { data: feed } = useGetFeed();
  const { data, isLoading, isError, refetch } = useGetProfile(profileId);
  const { data: messagesData } = useGetMessages();
  const toggleFollow = useToggleFollow();

  // The GET /profiles/:id response doesn't tell us whether the viewer already
  // follows this person (FollowResponse only comes back from the toggle
  // mutation) — that's a backend gap, not something we can derive client-side.
  // We default to "not following" on load and trust local state after that,
  // same as the like button trusts likedByViewer from the feed today.
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followerCountOverride, setFollowerCountOverride] = useState<number | null>(null);

  const viewerId = feed?.viewer.id;
  const isOwnProfile = viewerId != null && viewerId === profileId;

  // Own profile has a dedicated tab with Edit/Share — send there instead of
  // rendering a Follow/Message screen for yourself.
  React.useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile');
  }, [isOwnProfile]);

  if (isLoading || isOwnProfile) return <Screen><Header title="Profile" /><LoadingState label="Loading profile" /></Screen>;
  if (isError) return <Screen><Header title="Profile" /><ErrorState onRetry={refetch} /></Screen>;
  if (!data) return <Screen><Header title="Profile" /><Text>Not found</Text></Screen>;

  const { user, followerCount, followingCount, posts } = data;
  const isFollowing = following ?? false;
  const shownFollowerCount = followerCountOverride ?? followerCount;

  const handleFollow = () => {
    if (!viewerId) return;
    const nextFollowing = !isFollowing;
    setFollowing(nextFollowing);
    setFollowerCountOverride(followerCount + (nextFollowing ? 1 : -1));
    toggleFollow.mutate(
      { profileId, data: { viewerId } },
      {
        onSuccess: (res: FollowResponse) => {
          setFollowing(res.following);
          setFollowerCountOverride(res.followerCount);
        },
        onError: () => {
          // roll back the optimistic update
          setFollowing(isFollowing);
          setFollowerCountOverride(followerCount);
        },
      },
    );
  };

  const handleMessage = () => {
    // No "start new conversation" endpoint exists yet — only existing
    // conversations can be opened. Match by person id; fall back to the
    // Messages list if there's no conversation with this person yet.
    const existing = messagesData?.conversations.find((c: Conversation) => c.person.id === user.id);
    if (existing) {
      router.push(`/conversation/${existing.id}`);
    } else {
      router.push('/(tabs)/messages');
    }
  };

  return (
    <Screen scroll={false}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title={user.username}
        right={<IconButton name="more-horizontal" onPress={() => Alert.alert('Nothing here yet', 'Profile options are not available in this version of Gimmi.')} label="More options" />}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar author={user} size={96} showLive={user.isLive} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>{user.displayName}</Text>
            {user.isPremium ? <IconButton name="spark" size={16} color={colors.tint} style={{ padding: 0, width: 20, height: 20 }} /> : null}
          </View>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>

          <View style={{ marginTop: 12 }}>
            <CommunityPill name={user.communityName} color={user.communityColor} />
          </View>

          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{shownFollowerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'secondary' : 'primary'}
              shape="pill"
              style={{ flex: 1 }}
              onPress={handleFollow}
            />
            <Button label="Message" variant="secondary" shape="pill" style={{ flex: 1 }} onPress={handleMessage} />
          </View>
        </View>

        <View style={styles.postsSection}>
          <Text style={[styles.postsLabel, { color: colors.foreground }]}>Posts</Text>
          {posts.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingVertical: 24 }}>
              No posts yet.
            </Text>
          ) : (
            posts.map((post: Post) => (
              <PostCard key={post.id} post={post} onComment={() => router.push(`/post/${post.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
  name: { fontSize: 24, fontWeight: '700' },
  username: { fontSize: 16, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 40, marginTop: 24, marginBottom: 24 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 14, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  postsSection: { marginTop: 8 },
  postsLabel: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
});
