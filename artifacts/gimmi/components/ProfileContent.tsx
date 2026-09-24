import React, { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { Author, Post } from '@workspace/api-client-react';
import { router } from 'expo-router';
import { Avatar, Button, CommunityPill, Icon, Text } from '@/components/GimmiUI';
import { useColors } from '@/hooks/useColors';

const blueMedia = require('../assets/images/feed-blue.png') as ImageSourcePropType;
const saffronMedia = require('../assets/images/feed-saffron.png') as ImageSourcePropType;

type BaseProps = {
  user: Author;
  followerCount: number;
  followingCount: number;
  posts: Post[];
};

type Props = BaseProps & (
  | { kind: 'own'; onEdit: () => void; onShare: () => void }
  | { kind: 'other'; isFollowing: boolean; onFollow: () => void; onMessage: () => void }
);

function PostTile({ post }: { post: Post }) {
  const colors = useColors();
  const isRemote = /^https?:\/\//i.test(post.mediaUrl);
  const hasMedia = post.type !== 'text' && (isRemote || post.mediaUrl.includes('images.local'));
  const source: ImageSourcePropType = isRemote
    ? { uri: post.mediaUrl }
    : post.mediaUrl.includes('saffron') ? saffronMedia : blueMedia;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${post.type} post`}
      onPress={() => router.push(`/post/${post.id}`)}
      style={({ pressed }) => [styles.tile, { backgroundColor: colors.secondary, opacity: pressed ? 0.72 : 1 }]}
    >
      {hasMedia ? (
        <Image source={source} resizeMode="cover" style={styles.tileImage} />
      ) : post.type === 'text' ? (
        <Text style={[styles.tileText, { color: colors.foreground }]} numberOfLines={5}>
          {post.text || post.caption}
        </Text>
      ) : (
        <Icon name={post.type === 'video' ? 'video' : 'image'} size={27} color={colors.mutedForeground} />
      )}
      {post.type === 'video' && hasMedia ? (
        <View style={[styles.playBadge, { backgroundColor: colors.foreground }]}><Icon name="play" size={16} color={colors.background} /></View>
      ) : null}
    </Pressable>
  );
}

function EmptyPosts({ kind, name, section }: { kind: 'own' | 'other'; name: string; section: 'posts' | 'media' }) {
  const colors = useColors();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Icon name={section === 'media' ? 'image' : 'text'} size={25} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        {section === 'media' ? 'No media yet' : 'No posts yet'}
      </Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
        {kind === 'own'
          ? section === 'media' ? 'Photos and videos you share will appear here.' : 'Your posts will appear here when you share something.'
          : section === 'media' ? `${name} hasn’t shared any media yet.` : `${name} hasn’t shared a post yet.`}
      </Text>
      {kind === 'own' && section === 'posts' ? (
        <Button label="Create a post" variant="secondary" shape="pill" style={styles.emptyAction} onPress={() => router.push('/(tabs)/create')} />
      ) : null}
    </View>
  );
}

/** Shared profile layout for your own page and another person's page. */
export function ProfileContent(props: Props) {
  const { user, followerCount, followingCount, posts, kind } = props;
  const colors = useColors();
  const [section, setSection] = useState<'posts' | 'media'>('posts');
  const visiblePosts = section === 'posts' ? posts : posts.filter((post) => post.type === 'image' || post.type === 'video');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.summary}>
        <Avatar author={user} size={88} fallback="initials" />
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{user.displayName}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]} numberOfLines={1}>@{user.username}</Text>
          <View style={styles.community}><CommunityPill name={user.communityName} color={user.communityColor} /></View>
          <View style={styles.stats}>
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{followerCount.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{followingCount.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {kind === 'own' ? (
          <>
            <Button label="Edit Profile" variant="secondary" shape="pill" style={styles.action} onPress={props.onEdit} />
            <Button label="Share Profile" variant="secondary" shape="pill" style={styles.action} onPress={props.onShare} />
          </>
        ) : (
          <>
            <Button label={props.isFollowing ? 'Following' : 'Follow'} variant={props.isFollowing ? 'secondary' : 'primary'} tone="system" shape="pill" style={styles.action} onPress={props.onFollow} />
            <Button label="Message" variant="secondary" shape="pill" style={styles.action} onPress={props.onMessage} />
          </>
        )}
      </View>

      <View style={styles.tabs}>
        {(['posts', 'media'] as const).map((tab) => {
          const selected = section === tab;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityLabel={tab === 'posts' ? 'Posts' : 'Media'}
              accessibilityState={{ selected }}
              onPress={() => setSection(tab)}
              style={styles.tab}
            >
              <Text style={[styles.tabText, { color: selected ? colors.foreground : colors.mutedForeground, fontWeight: selected ? '600' : '500' }]}>
                {tab === 'posts' ? 'Posts' : 'Media'}
              </Text>
              <View style={[styles.underline, { backgroundColor: selected ? colors.foreground : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {visiblePosts.length > 0 ? (
        <View style={styles.grid}>{visiblePosts.map((post) => <PostTile key={post.id} post={post} />)}</View>
      ) : (
        <EmptyPosts kind={kind} name={user.displayName} section={section} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 112 },
  summary: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingTop: 20 },
  details: { flex: 1, minWidth: 0 },
  name: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.4 },
  username: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  community: { marginTop: 8 },
  stats: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statValue: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  statLabel: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  action: { flex: 1 },
  tabs: { flexDirection: 'row', marginTop: 30 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, gap: 11 },
  tabText: { fontSize: 15, lineHeight: 20 },
  underline: { width: '100%', height: 2, borderRadius: 999 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingTop: 14 },
  tile: { width: '32.5%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileImage: { width: '100%', height: '100%' },
  tileText: { fontSize: 13, lineHeight: 18, paddingHorizontal: 11, paddingVertical: 9 },
  playBadge: { position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 74, paddingHorizontal: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 275 },
  emptyAction: { marginTop: 20 },
});