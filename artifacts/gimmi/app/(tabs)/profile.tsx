import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
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

  const handleEditProfile = () => {
    // No PATCH /profiles/:id endpoint exists yet — being upfront beats a
    // silent no-op. Account Information (Settings) is the closest thing,
    // and it's read-only for the same reason.
    Alert.alert("Can't edit yet", "Profile editing isn't available in this version of Gimmi yet.");
  };

  const handleShareProfile = () => {
    Share.share({
      message: `Check out ${user.displayName} (@${user.username}) on Gimmi`,
      url: `gimmi://profile/${user.id}`,
    }).catch(() => {});
  };

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
          <View style={styles.profileSummary}>
            <Avatar author={user} size={96} />
            <View style={styles.profileDetails}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{user.displayName}</Text>
              <Text style={[styles.username, { color: colors.mutedForeground }]} numberOfLines={1}>@{user.username}</Text>
              <View style={styles.community}>
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
            </View>
          </View>
          <View style={styles.actions}>
            <Button label="Edit Profile" variant="secondary" shape="pill" style={{ flex: 1 }} onPress={handleEditProfile} />
            <Button label="Share Profile" variant="secondary" shape="pill" style={{ flex: 1 }} onPress={handleShareProfile} />
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
  profileHeader: { marginBottom: 24, paddingTop: 12 },
  profileSummary: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  profileDetails: { flex: 1, minWidth: 0 },
  name: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  username: { fontSize: 14, marginTop: 2 },
  community: { marginTop: 8 },
  stats: { flexDirection: 'row', gap: 24, marginTop: 14 },
  statBox: { alignItems: 'flex-start' },
  statValue: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 20 },
  postsSection: { marginTop: 8 },
  postsLabel: { fontSize: 17, lineHeight: 22, fontWeight: '600', marginBottom: 16 },
});