import React, { ReactNode } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Post, Author, Community } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

const blueMedia = require('../assets/images/feed-blue.png') as ImageSourcePropType;
const saffronMedia = require('../assets/images/feed-saffron.png') as ImageSourcePropType;

export function Screen({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: object }) {
  const colors = useColors();
  return scroll ? (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }, style]} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : <View style={[styles.screen, { backgroundColor: colors.background }, style]}>{children}</View>;
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>ANIMUS</Text>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({ name, onPress, badge }: { name: keyof typeof Feather.glyphMap; onPress?: () => void; badge?: boolean }) {
  const colors = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}>
      <Feather name={name} size={20} color={colors.foreground} />
      {badge ? <View style={[styles.badgeDot, { backgroundColor: colors.primary, borderColor: colors.card }]} /> : null}
    </Pressable>
  );
}

export function Avatar({ author, size = 44 }: { author?: Author | null; size?: number }) {
  const colors = useColors();
  const initials = (author?.displayName || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: author?.communityColor || colors.accent }]}>
      {author?.avatar ? <Image source={{ uri: author.avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Text style={[styles.avatarText, { color: colors.accentForeground, fontSize: size * 0.32 }]}>{initials}</Text>}
      {author?.isLive ? <View style={[styles.liveDot, { backgroundColor: colors.primary, borderColor: colors.card }]} /> : null}
    </View>
  );
}

export function CommunityPill({ community, name, color }: { community?: Community; name?: string; color?: string }) {
  const colors = useColors();
  return <View style={[styles.pill, { backgroundColor: color || community?.color || colors.accent }]}><Text style={[styles.pillText, { color: colors.accentForeground }]}>{name || community?.name || 'Community'}</Text></View>;
}

export function SectionLabel({ children, action, onPress }: { children: ReactNode; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionRow}><Text style={[styles.sectionLabel, { color: colors.foreground }]}>{children}</Text>{action ? <Pressable onPress={onPress}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable> : null}</View>;
}

export function SearchField({ value, onChangeText, placeholder = 'Search Animus' }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" /></View>;
}

export function PostCard({ post, onLike, onComment }: { post: Post; onLike?: () => void; onComment?: () => void }) {
  const colors = useColors();
  const localMedia = post.id % 2 === 0 ? blueMedia : saffronMedia;
  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <Avatar author={post.author} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.authorName, { color: colors.foreground }]}>{post.author.displayName}</Text>
          <View style={styles.metaLine}><Text style={[styles.meta, { color: colors.mutedForeground }]}>@{post.author.username} · {relativeTime(post.createdAt)}</Text><CommunityPill name={post.author.communityName} color={post.author.communityColor} /></View>
        </View>
        <Pressable hitSlop={8}><Feather name="more-horizontal" size={21} color={colors.mutedForeground} /></Pressable>
      </View>
      {post.text ? <Text style={[styles.postText, { color: colors.foreground }]}>{post.text}</Text> : null}
      {post.caption ? <Text style={[styles.caption, { color: colors.mutedForeground }]}>{post.caption}</Text> : null}
      {post.type !== 'text' ? <View style={[styles.mediaFrame, { backgroundColor: colors.muted }]}><Image source={post.mediaUrl ? { uri: post.mediaUrl } : localMedia} resizeMode="contain" style={styles.media} /><View style={[styles.mediaType, { backgroundColor: colors.card }]}><Feather name={post.type === 'video' ? 'play' : 'image'} size={13} color={colors.foreground} /><Text style={[styles.mediaTypeText, { color: colors.foreground }]}>{post.type === 'video' ? 'Clip' : 'Image'}</Text></View></View> : null}
      <View style={styles.postActions}>
        <Pressable accessibilityRole="button" onPress={onLike} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]}><Feather name="heart" size={19} color={post.likedByViewer ? colors.primary : colors.mutedForeground} /><Text style={[styles.actionText, { color: post.likedByViewer ? colors.primary : colors.mutedForeground }]}>{post.likes}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onComment} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]}><Feather name="message-circle" size={18} color={colors.mutedForeground} /><Text style={[styles.actionText, { color: colors.mutedForeground }]}>{post.comments}</Text></Pressable>
        <Pressable style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]}><Feather name="send" size={17} color={colors.mutedForeground} /><Text style={[styles.actionText, { color: colors.mutedForeground }]}>{post.shares}</Text></Pressable>
        <View style={{ flex: 1 }} /><Feather name="bookmark" size={18} color={colors.mutedForeground} />
      </View>
    </View>
  );
}

export function LoadingState({ label = 'Finding your people' }: { label?: string }) {
  const colors = useColors();
  return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={[styles.stateTitle, { color: colors.foreground }]}>{label}</Text><Text style={[styles.stateBody, { color: colors.mutedForeground }]}>Taking a quiet second to bring it together.</Text></View>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return <View style={styles.state}><Feather name="cloud-off" size={26} color={colors.primary} /><Text style={[styles.stateTitle, { color: colors.foreground }]}>A small pause</Text><Text style={[styles.stateBody, { color: colors.mutedForeground }]}>We couldn't reach Animus right now.</Text><Pressable onPress={onRetry} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Try again</Text></Pressable></View>;
}

export function EmptyState({ icon = 'wind', title, body }: { icon?: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useColors();
  return <View style={styles.state}><View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name={icon} size={24} color={colors.accentForeground} /></View><Text style={[styles.stateTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.stateBody, { color: colors.mutedForeground }]}>{body}</Text></View>;
}

export function relativeTime(date: string) {
  const delta = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 112 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 12 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2.1, marginBottom: 5 },
  headerTitle: { fontSize: 32, lineHeight: 36, fontWeight: '700', letterSpacing: -1.1 },
  headerSubtitle: { fontSize: 14, lineHeight: 19, marginTop: 4 },
  iconButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  avatar: { alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  avatarText: { fontWeight: '700' },
  liveDot: { position: 'absolute', right: -1, bottom: 0, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  pill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.1 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  sectionLabel: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  search: { minHeight: 46, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  postCard: { borderRadius: 19, borderWidth: 1, padding: 15, marginBottom: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  authorName: { fontSize: 15, fontWeight: '700' },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  meta: { fontSize: 12 },
  postText: { fontSize: 17, lineHeight: 24, fontWeight: '500', letterSpacing: -0.15, marginBottom: 10 },
  caption: { fontSize: 13, lineHeight: 18, marginBottom: 11 },
  mediaFrame: { width: '100%', aspectRatio: 1.42, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  media: { width: '100%', height: '100%' },
  mediaType: { position: 'absolute', top: 10, left: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  mediaTypeText: { fontSize: 11, fontWeight: '600' },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '600' },
  state: { alignItems: 'center', justifyContent: 'center', minHeight: 290, paddingHorizontal: 28, gap: 10 },
  stateTitle: { fontSize: 18, fontWeight: '700', marginTop: 5 },
  stateBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  primaryButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  primaryButtonText: { fontSize: 14, fontWeight: '700' },
});