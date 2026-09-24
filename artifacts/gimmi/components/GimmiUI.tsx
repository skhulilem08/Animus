import React, { ReactNode, useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, Share, StyleSheet, Text as RNText, TextInput, View, Platform, StyleProp, ViewStyle, TextProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ArrowUp,
  Bell,
  Bookmark,
  ChatBubble,
  Compass,
  CloudXmark,
  EditPencil,
  Hashtag,
  Heart,
  Home,
  MediaImage as ImageIcon,
  Message,
  MoreHoriz,
  Plus,
  Search,
  SendDiagonal,
  Text as TextIcon,
  UserPlus,
  User,
  VideoCamera,
  Wind,
  Xmark,
  Play,
  NavArrowLeft,
  Settings,
  InfoCircle,
  LogOut,
  Phone,
  VideoCameraOff,
  Microphone,
  MicrophoneMute,
  Spark,
  SunLight,
  Palette,
  HalfMoon,
  NavArrowRight,
  MailOut,
} from 'iconoir-react-native';
import { Bookmark as BookmarkSolid, Heart as HeartSolid } from 'iconoir-react-native/solid';
import { Post, Author, Community } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import systemColors from '@/constants/colors';
import { getCommunityTheme } from '@/constants/communityThemes';
import { openInAppBrowser } from '@/utils/openInAppBrowser';
import { router } from 'expo-router';

const blueMedia = require('../assets/images/feed-blue.png') as ImageSourcePropType;
const saffronMedia = require('../assets/images/feed-saffron.png') as ImageSourcePropType;
const defaultProfile = require('../assets/images/default-profile.png') as ImageSourcePropType;

const iconMap = {
  'arrow-up': ArrowUp,
  'arrow-left': NavArrowLeft,
  bell: Bell,
  bookmark: Bookmark,
  'bookmark-solid': BookmarkSolid,
  compass: Compass,
  'cloud-off': CloudXmark,
  'pen-tool': EditPencil,
  hash: Hashtag,
  heart: Heart,
  'heart-solid': HeartSolid,
  home: Home,
  image: ImageIcon,
  'message-circle': ChatBubble,
  'message-square': Message,
  'more-horizontal': MoreHoriz,
  play: Play,
  plus: Plus,
  search: Search,
  send: SendDiagonal,
  settings: Settings,
  text: TextIcon,
  'user-plus': UserPlus,
  user: User,
  video: VideoCamera,
  wind: Wind,
  x: Xmark,
  info: InfoCircle,
  logout: LogOut,
  phone: Phone,
  'video-off': VideoCameraOff,
  mic: Microphone,
  'mic-off': MicrophoneMute,
  'phone-off': Xmark,
  spark: Spark,
  adjust: SunLight,
  filters: Palette,
  bw: HalfMoon,
  chevron: NavArrowRight,
  mail: MailOut,
} as const;

export type IconName = keyof typeof iconMap;

export function Text(props: TextProps) {
  const { style, ...rest } = props;
  
  // Extract font weight to determine which Plus Jakarta Sans font to use on Android
  let fontFamily: string | undefined;
  
  if (Platform.OS === 'android') {
    const flatStyle = StyleSheet.flatten(style || {});
    const weight = flatStyle?.fontWeight;
    
    if (weight === '700' || weight === 'bold') {
      fontFamily = 'PlusJakartaSans_700Bold';
    } else if (weight === '600') {
      fontFamily = 'PlusJakartaSans_600SemiBold';
    } else if (weight === '500') {
      fontFamily = 'PlusJakartaSans_500Medium';
    } else {
      fontFamily = 'PlusJakartaSans_400Regular';
    }
  } else if (Platform.OS === 'web') {
    fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }

  return (
    <RNText 
      {...rest} 
      style={[
        fontFamily ? { fontFamily } : undefined,
        style,
        Platform.OS === 'android' && fontFamily ? { fontWeight: undefined } : undefined
      ]} 
    />
  );
}

export function Icon({ name, size = 20, color, strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const Component = iconMap[name];
  if (!Component) return null;
  return <Component width={size} height={size} color={color} strokeWidth={strokeWidth} />;
}

export function Screen({ children, scroll = true, style, useSafeArea = true }: { children: ReactNode; scroll?: boolean; style?: StyleProp<ViewStyle>; useSafeArea?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const contentStyle = [
    styles.screen, 
    { backgroundColor: colors.background }, 
    useSafeArea ? { paddingTop: insets.top } : {},
    style
  ];
  
  return scroll ? (
    <View style={contentStyle}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 112 + insets.bottom }} 
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  ) : <View style={contentStyle}>{children}</View>;
}

export function Header({ title, subtitle, right, left, showBorder = true, centerTitle = true, onTitlePress }: { title: string; subtitle?: string; right?: ReactNode; left?: ReactNode; showBorder?: boolean; centerTitle?: boolean; onTitlePress?: () => void }) {
  const colors = useColors();
  const titleContent = <>
    <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
    {subtitle ? <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>{subtitle}</Text> : null}
  </>;
  return (
    <View style={[styles.header, { borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0, borderBottomColor: colors.border, paddingHorizontal: 16 }]}>
      <View style={styles.headerLeftContainer}>
        {left && <View style={styles.headerLeft}>{left}</View>}
      </View>
      <View style={{ flex: 1, alignItems: centerTitle ? 'center' : 'flex-start', justifyContent: 'center' }}>
        {onTitlePress ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${title}'s profile`} onPress={onTitlePress} style={{ minHeight: 44, justifyContent: 'center', alignItems: centerTitle ? 'center' : 'flex-start' }}>
            {titleContent}
          </Pressable>
        ) : titleContent}
      </View>
      <View style={styles.headerRightContainer}>
        {right && <View style={styles.headerRight}>{right}</View>}
      </View>
    </View>
  );
}

export function IconButton({ name, onPress, badge, label, size = 24, color, style }: { name: IconName; onPress?: () => void; badge?: boolean; label?: string; size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={handlePress} style={({ pressed }) => [styles.iconButton, style, { opacity: pressed ? 0.45 : 1 }]}>
      <Icon name={name} size={size} color={color || colors.foreground} />
      {badge ? <View style={[styles.badgeDot, { backgroundColor: colors.destructive, borderColor: colors.card }]} /> : null}
    </Pressable>
  );
}

export function Button({ label, onPress, variant = 'primary', style, shape = 'squircle', tone = 'brand', compact = false }: { label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'destructive'; style?: StyleProp<ViewStyle>; shape?: 'squircle' | 'pill'; tone?: 'brand' | 'system'; compact?: boolean }) {
  const colors = useColors();
  
  let bg = tone === 'system' ? systemColors.light.primary : colors.primary;
  let textCol = tone === 'system' ? systemColors.light.primaryForeground : colors.primaryForeground;
  
  if (variant === 'secondary') {
    bg = colors.secondary;
    textCol = colors.secondaryForeground;
  } else if (variant === 'destructive') {
    bg = colors.destructive;
    textCol = colors.destructiveForeground;
  }
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };
  
  return (
    <Pressable accessibilityRole="button" onPress={handlePress} hitSlop={compact ? { top: 4, bottom: 4 } : undefined} style={({ pressed }) => [styles.button, { backgroundColor: bg, borderRadius: shape === 'pill' ? 9999 : colors.radius, minHeight: compact ? 36 : 44, height: compact ? 36 : undefined, opacity: pressed ? 0.7 : 1 }, style]}>
      <Text style={[styles.buttonText, { color: textCol }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ author, size = 44, showLive = false, fallback = 'image' }: { author?: Author | null; size?: number; showLive?: boolean; fallback?: 'image' | 'initials' }) {
  const colors = useColors();
  const hasUploadedAvatar = Boolean(
    author?.avatar && /^https?:\/\//i.test(author.avatar),
  );
  const initials = author?.displayName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondary }]}>
      {!hasUploadedAvatar && fallback === 'initials' ? (
        <Text style={{ fontSize: size * 0.33, fontWeight: '600', color: colors.foreground }}>{initials}</Text>
      ) : (
        <Image
          accessibilityLabel={hasUploadedAvatar ? `${author?.displayName} profile photo` : 'Default profile photo'}
          source={hasUploadedAvatar ? { uri: author!.avatar } : defaultProfile}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      )}
      {showLive && author?.isLive ? <View style={[styles.liveDot, { backgroundColor: colors.destructive, borderColor: colors.card }]} /> : null}
    </View>
  );
}

export function CommunityPill({ community, name, color, maxWidth }: { community?: Community; name?: string; color?: string; maxWidth?: number }) {
  const colors = useColors();
  const theme = getCommunityTheme({ name: name || community?.name, slug: community?.slug, color: color || community?.color });
  return <View style={[styles.pill, { backgroundColor: theme.soft, maxWidth }]}><Text numberOfLines={maxWidth ? 2 : undefined} style={[styles.pillText, { color: theme.foreground, textAlign: maxWidth ? 'center' : 'left' }]}>{name || community?.name || 'Community'}</Text></View>;
}

export function SectionLabel({ children, action, onPress }: { children: ReactNode; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionRow}><Text style={[styles.sectionLabel, { color: colors.foreground }]}>{children}</Text>{action ? <Pressable onPress={onPress}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable> : null}</View>;
}

export function SearchField({ value, onChangeText, placeholder = 'Search Gimmi', shape = 'rounded' }: { value: string; onChangeText: (value: string) => void; placeholder?: string; shape?: 'rounded' | 'pill' }) {
  const colors = useColors();
  return <View style={[styles.search, shape === 'pill' && styles.searchPill, { backgroundColor: colors.input }]}><Icon name="search" size={18} color={colors.mutedForeground} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" /></View>;
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

// Clamp how tall/wide a post's media frame can go so one extreme image
// doesn't blow out the feed. Square media (ratio 1) renders exactly as
// captured; anything outside this band letterboxes at the clamp edge.
const MIN_MEDIA_RATIO = 4 / 5;   // tallest: portrait, matches Instagram's own clamp
const MAX_MEDIA_RATIO = 1.91;    // widest: landscape

export function PostCard({ post, onLike, onComment, onOpenClip }: { post: Post; onLike?: () => void; onComment?: () => void; onOpenClip?: () => void }) {
  const colors = useColors();
  const theme = getCommunityTheme({ name: post.author.communityName, slug: '', color: post.author.communityColor });
  const [saved, setSaved] = useState(false);
  const openAuthorProfile = () => router.push(`/profile/${post.author.id}`);
  const localMedia = post.mediaUrl?.includes('saffron') ? saffronMedia : blueMedia;
  const isRemoteMedia = !!post.mediaUrl && !post.mediaUrl.includes('images.local');
  const mediaSource: ImageSourcePropType = isRemoteMedia ? { uri: post.mediaUrl } : localMedia;

  // Non-square images should render at their natural aspect ratio (per the
  // "Post with Non-Square Media" reference), not be squeezed into a fixed
  // square frame. We don't have width/height from the API, so measure it
  // client-side once the source resolves. Falls back to square while loading.
  const [mediaRatio, setMediaRatio] = useState(1);
  React.useEffect(() => {
    if (post.type !== 'image') return;
    let cancelled = false;
    const applyRatio = (w: number, h: number) => {
      if (cancelled || !w || !h) return;
      setMediaRatio(Math.min(MAX_MEDIA_RATIO, Math.max(MIN_MEDIA_RATIO, w / h)));
    };
    if (isRemoteMedia) {
      Image.getSize(post.mediaUrl!, applyRatio, () => {});
    } else {
      const resolved = Image.resolveAssetSource(localMedia);
      applyRatio(resolved.width, resolved.height);
    }
    return () => { cancelled = true; };
  }, [post.type, post.mediaUrl, isRemoteMedia]);
  
  let textContent = post.text || '';
  const linksInText = textContent.match(urlRegex) || [];
  const extractedLink = post.link || linksInText[0] || null;
  textContent = textContent.replace(urlRegex, '').replace(/\s{2,}/g, ' ').trim();

  const validLink = extractedLink && /^https?:\/\/[^\s]+$/i.test(extractedLink) ? extractedLink : null;
  const openLink = async () => {
    if (validLink) await openInAppBrowser(validLink, theme.primary);
  };
  const sharePost = () => Share.share({
    message: [post.text || post.caption, validLink].filter(Boolean).join('\n'),
  });

  const textLength = Math.min(textContent.length, 500);
  const textScale =
    textLength <= 60 ? { fontSize: 28, lineHeight: 35 } :
    textLength <= 120 ? { fontSize: 24, lineHeight: 31 } :
    textLength <= 200 ? { fontSize: 21, lineHeight: 27 } :
    textLength <= 300 ? { fontSize: 18, lineHeight: 24 } :
    textLength <= 400 ? { fontSize: 16, lineHeight: 21 } :
    { fontSize: 14, lineHeight: 18 };

  return (
    <View style={[styles.postCard, { borderBottomColor: colors.border }]}>
      <View style={styles.postHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${post.author.displayName}'s profile`} onPress={openAuthorProfile}>
          <Avatar author={post.author} size={36} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
             <Pressable onPress={openAuthorProfile} style={{ flexShrink: 1 }}>
               <Text style={[styles.authorName, { color: colors.foreground }]} numberOfLines={1}>{post.author.displayName}</Text>
             </Pressable>
             <Pressable accessibilityRole="button" accessibilityLabel="More options" hitSlop={12}>
                <Icon name="more-horizontal" size={18} color={colors.mutedForeground} />
             </Pressable>
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {post.author.communityName} · {relativeTime(post.createdAt)}
          </Text>
        </View>
      </View>
      
      {post.type === 'text' ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Open text post comments" onPress={onComment} style={[styles.textPostFrame, { backgroundColor: colors.groupedBackground, borderColor: colors.border }]}>
          <Text 
            style={[styles.textPostText, { color: colors.foreground, ...textScale }]}
            selectable
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {textContent.slice(0, 500)}
          </Text>
          {validLink && (
            <Pressable accessibilityRole="link" accessibilityLabel={`Open ${new URL(validLink).hostname}`} style={[styles.linkButton, { borderColor: theme.primary }]} onPress={openLink}>
              <Icon name="compass" size={16} color={theme.primary} />
              <Text style={[styles.linkButtonText, { color: theme.primary }]}>Open link</Text>
            </Pressable>
          )}
        </Pressable>
      ) : (
        <>
          {post.text ? <Pressable onPress={onComment}><Text style={[styles.postText, { color: colors.foreground }]} selectable>{post.text}</Text></Pressable> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={post.type === 'video' ? 'Open full-screen clip' : 'Open post comments'}
            onPress={post.type === 'video' ? onOpenClip : onComment}
            style={[
              styles.mediaFrame,
              post.type === 'video' ? styles.clipFeedFrame : { aspectRatio: mediaRatio },
              { backgroundColor: colors.muted },
            ]}
          >
            {post.type === 'video' && !post.mediaUrl ? (
              <View style={styles.clipPlaceholder}>
                <Icon name="play" size={30} color="#FFFFFF" />
              </View>
            ) : (
              // contain, not cover: the spec is explicit that media is never
              // cropped, even at the clamp edges — "cover" would violate that.
              <Image source={mediaSource} resizeMode="contain" style={styles.media} />
            )}
          </Pressable>
          {post.caption ? <Pressable onPress={onComment}><Text style={[styles.caption, { color: colors.foreground }]} selectable>{post.caption}</Text></Pressable> : null}
        </>
      )}
      
      <View style={styles.postActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={post.likedByViewer ? 'Unlike post' : 'Like post'} onPress={onLike} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]} hitSlop={8}>
          <Icon name={post.likedByViewer ? 'heart-solid' : 'heart'} size={20} color={post.likedByViewer ? colors.like : colors.foreground} />
          <Text style={[styles.actionText, { color: post.likedByViewer ? colors.like : colors.mutedForeground }]}>{post.likes}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Comment on post" onPress={onComment} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]} hitSlop={8}>
          <Icon name="message-circle" size={20} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.mutedForeground }]}>{post.comments}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Share post" onPress={sharePost} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.55 : 1 }]} hitSlop={8}>
          <Icon name="send" size={20} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.mutedForeground }]}>{post.shares}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Remove saved post' : 'Save post'} accessibilityState={{ selected: saved }} onPress={() => setSaved((value) => !value)} style={styles.iconTouchTarget}>
          <Icon name={saved ? 'bookmark-solid' : 'bookmark'} size={20} color={saved ? colors.primary : colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  const colors = useColors();
  return <View style={styles.state}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.stateTitle, { color: colors.foreground }]}>{label}</Text></View>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return <View style={styles.state}><Icon name="cloud-off" size={32} color={colors.primary} /><Text style={[styles.stateTitle, { color: colors.foreground }]}>Something went wrong</Text><Text style={[styles.stateBody, { color: colors.mutedForeground }]}>We couldn't connect to Gimmi right now.</Text><Button label="Try again" onPress={onRetry} style={{ marginTop: 12 }} /></View>;
}

export function EmptyState({ icon = 'wind', title, body, action, actionLabel }: { icon?: IconName; title: string; body: string; action?: () => void; actionLabel?: string }) {
  const colors = useColors();
  return (
    <View style={styles.state}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Icon name={icon} size={28} color={colors.foreground} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>{body}</Text>
      {action && actionLabel && <Button label={actionLabel} onPress={action} style={{ marginTop: 16 }} />}
    </View>
  );
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
  screenContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 112 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  headerLeftContainer: { minWidth: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerRightContainer: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  headerLeft: { justifyContent: 'center', alignItems: 'center' },
  headerRight: { justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 1, letterSpacing: -0.08 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  buttonText: { fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  badgeDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  avatar: { alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  liveDot: { position: 'absolute', right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.06 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.24 },
  sectionAction: { fontSize: 14, fontWeight: '500' },
  search: { height: 40, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8, marginBottom: 12 },
  searchPill: { height: 44, borderRadius: 999, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 17, paddingVertical: 8, letterSpacing: -0.3 },
  postCard: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12, paddingHorizontal: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  authorName: { fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  metaLine: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  meta: { fontSize: 13, letterSpacing: -0.08 },
  postText: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24, marginBottom: 12 },
  textPostFrame: { width: '100%', aspectRatio: 1, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, padding: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  textPostText: { width: '100%', flexShrink: 1, fontWeight: '500', letterSpacing: -0.32, textAlign: 'center', marginBottom: 0 },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, minHeight: 44, paddingHorizontal: 16, marginTop: 16, width: '100%', justifyContent: 'center' },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 15, lineHeight: 20, letterSpacing: -0.24, marginBottom: 12 },
  mediaFrame: { width: '100%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  clipFeedFrame: { aspectRatio: 9 / 13 },
  media: { width: '100%', height: '100%' },
  clipPlaceholder: { width: '100%', height: '100%', backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 40 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 44, height: 40 },
  actionText: { fontSize: 14, fontWeight: '500' },
  iconTouchTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -12 },
  state: { alignItems: 'center', justifyContent: 'center', minHeight: 300, paddingHorizontal: 32, gap: 12 },
  stateTitle: { fontSize: 20, fontWeight: '700', marginTop: 8, letterSpacing: 0.35 },
  stateBody: { fontSize: 16, lineHeight: 21, textAlign: 'center', letterSpacing: -0.32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});