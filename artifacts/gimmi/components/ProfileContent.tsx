import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { Author, Post } from '@workspace/api-client-react';
import { router } from 'expo-router';
import { Avatar, Button, CommunityPill, Icon, Text } from '@/components/GimmiUI';
import { UnderlineTabs } from '@/components/UnderlineTabs';
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

function PostTile({ post, index }: { post: Post; index: number }) {
  const colors = useColors();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const isRemote = /^https?:\/\//i.test(post.mediaUrl);
  const hasMedia = post.type !== 'text' && (isRemote || post.mediaUrl.includes('images.local'));
  const source: ImageSourcePropType = isRemote
    ? { uri: post.mediaUrl }
    : post.mediaUrl.includes('saffron') ? saffronMedia : blueMedia;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
      previewOpacity.stopAnimation();
    };
  }, [previewOpacity]);

  const showPreview = (visible: boolean) => {
    if (post.type !== 'text') return;
    if (visible) setPreviewVisible(true);
    Animated.timing(previewOpacity, {
      toValue: visible ? 1 : 0,
      duration: reduceMotion || (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
        ? 0 : visible ? 180 : 130,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => { if (finished && !visible) setPreviewVisible(false); });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${post.type} post`}
      onPress={() => router.push(`/post/${post.id}`)}
      onHoverIn={() => showPreview(true)}
      onHoverOut={() => showPreview(false)}
      style={({ pressed }) => [styles.tile, { zIndex: previewVisible ? 10 : 0, opacity: pressed ? 0.72 : 1 }]}
    >
      <View style={[styles.tileVisual, { backgroundColor: colors.secondary }]}>
        {hasMedia ? (
          <Image source={source} resizeMode="cover" style={styles.tileImage} />
        ) : (
          <Icon name={post.type === 'video' ? 'video' : post.type === 'text' ? 'text' : 'image'} size={27} color={colors.mutedForeground} />
        )}
        {post.type === 'video' && hasMedia ? (
          <View style={[styles.playBadge, { backgroundColor: colors.foreground }]}><Icon name="play" size={16} color={colors.background} /></View>
        ) : null}
      </View>
      {previewVisible && post.type === 'text' ? (
        <Animated.View style={[styles.preview, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          left: index % 3 === 2 ? undefined : 0,
          right: index % 3 === 2 ? 0 : undefined,
          opacity: previewOpacity,
          transform: [{ translateY: previewOpacity.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
        }]}>
          <ScrollView style={styles.previewScroll} nestedScrollEnabled>
            <Text selectable style={[styles.previewText, { color: colors.foreground }]}>{post.text || post.caption}</Text>
          </ScrollView>
          <Text style={[styles.previewHint, { color: colors.mutedForeground }]}>Open post to read more</Text>
        </Animated.View>
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
        <Button label="Create a post" variant="secondary" shape="pill" compact style={styles.emptyAction} onPress={() => router.push('/(tabs)/create')} />
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
        <View style={styles.avatarColumn}>
          <Avatar author={user} size={88} fallback="initials" />
          <View style={styles.community}><CommunityPill name={user.communityName} color={user.communityColor} maxWidth={110} /></View>
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{user.displayName}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]} numberOfLines={1}>@{user.username}</Text>
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
            <Button label="Edit Profile" shape="pill" compact style={styles.action} onPress={props.onEdit} />
            <Button label="Share Profile" variant="secondary" shape="pill" compact style={styles.action} onPress={props.onShare} />
          </>
        ) : (
          <>
            <Button label={props.isFollowing ? 'Following' : 'Follow'} variant={props.isFollowing ? 'secondary' : 'primary'} tone="system" shape="pill" compact style={styles.action} onPress={props.onFollow} />
            <Button label="Message" variant="secondary" shape="pill" compact style={styles.action} onPress={props.onMessage} />
          </>
        )}
      </View>

      <UnderlineTabs
        labels={['Posts', 'Media']}
        selectedIndex={section === 'posts' ? 0 : 1}
        onChange={(index) => setSection(index === 0 ? 'posts' : 'media')}
        style={styles.tabs}
      />

      {visiblePosts.length > 0 ? (
        <View style={styles.grid}>{visiblePosts.map((post, index) => <PostTile key={post.id} post={post} index={index} />)}</View>
      ) : (
        <EmptyPosts kind={kind} name={user.displayName} section={section} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 112 },
  summary: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingTop: 20 },
  avatarColumn: { width: 104, alignItems: 'center' },
  details: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  username: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  community: { marginTop: 11 },
  stats: { flexDirection: 'row', gap: 24, marginTop: 23 },
  statValue: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  statLabel: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  action: { flex: 1 },
  tabs: { marginTop: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingTop: 14 },
  tile: { width: '32.5%', aspectRatio: 1, position: 'relative' },
  tileVisual: { flex: 1, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileImage: { width: '100%', height: '100%' },
  preview: { position: 'absolute', top: '100%', marginTop: 8, width: 278, maxWidth: 278, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 15 },
  previewScroll: { maxHeight: 210 },
  previewText: { fontSize: 14, lineHeight: 20 },
  previewHint: { fontSize: 11, lineHeight: 16, marginTop: 11 },
  playBadge: { position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 74, paddingHorizontal: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 275 },
  emptyAction: { marginTop: 20 },
});