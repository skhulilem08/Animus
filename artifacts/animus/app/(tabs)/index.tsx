import React, { useCallback, useState } from 'react';
import { FlatList, Platform, RefreshControl, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetDiscover, useGetFeed, useTogglePostLike } from '@workspace/api-client-react';
import { Screen, PostCard, LoadingState, ErrorState, EmptyState, IconButton, Avatar, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

export default function HomeFeed() {
  const { data, isLoading, isError, refetch } = useGetFeed();
  const { data: discoverData } = useGetDiscover();
  const toggleLike = useTogglePostLike();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLike = (postId: number) => {
    if (!data?.viewer.id) return;
    toggleLike.mutate(
      { postId, data: { viewerId: data.viewer.id } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/feed'] }) },
    );
  };

  const HeaderContent = () => (
    <>
      <View style={styles.headerLeft}>
        <Icon name="spark" size={23} color={colors.primary} strokeWidth={2.2} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gimmi</Text>
      </View>
      <View style={styles.headerRight}>
        <IconButton name="search" size={24} onPress={() => router.push('/discover')} />
        <IconButton name="bell" size={24} badge={true} onPress={() => router.push('/notifications')} />
      </View>
    </>
  );

  const Header = () => {
    const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
    const headerStyle = [
      styles.header,
      { top: insets.top },
      !hasLiquidGlass && {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        borderBottomWidth: StyleSheet.hairlineWidth,
      },
    ];

    if (hasLiquidGlass) {
      return (
        <GlassView
          glassEffectStyle="regular"
          tintColor={colors.background}
          colorScheme="light"
          isInteractive={false}
          style={headerStyle}
        >
          <HeaderContent />
        </GlassView>
      );
    }

    return <View style={headerStyle}><HeaderContent /></View>;
  };

  const ClipsRail = () => {
    const clips = (data?.posts || [])
      .filter((post) => (
        post.type === 'video'
        && post.author.communityName === data?.viewer.communityName
      ))
      .slice(0, 10);
    if (clips.length === 0) return null;

    return (
      <View style={[styles.clipsSection, { borderBottomColor: colors.border }]}>
        <View style={styles.clipsHeading}>
          <Text style={[styles.clipsTitle, { color: colors.foreground }]}>Clips</Text>
          <Text style={[styles.clipsHint, { color: colors.mutedForeground }]}>Swipe to browse</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clipsContent}>
          {clips.map((clip) => (
            <Pressable
              key={clip.id}
              accessibilityRole="button"
              accessibilityLabel={`Open clip by ${clip.author.displayName}`}
              style={({ pressed }) => [styles.clipCard, { backgroundColor: '#1C1C1E', opacity: pressed ? 0.72 : 1 }]}
              onPress={() => router.push({ pathname: '/clips', params: { initialId: String(clip.id) } })}
            >
              <View style={styles.clipPlay}>
                <Icon name="play" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.clipMeta}>
                <Text style={styles.clipAuthor} numberOfLines={1}>{clip.author.displayName}</Text>
                <Text style={styles.clipCommunity} numberOfLines={1}>{clip.author.communityName}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const Stories = () => {
    const people = discoverData?.people?.slice(0, 6) || [];
    return (
      <View style={[styles.storiesSection, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContent}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create your story"
            style={styles.storyItem}
            onPress={() => router.push('/create')}
          >
            <View style={[styles.storyAvatarFrame, { borderColor: colors.border }]}>
              <View style={[styles.addStory, { backgroundColor: colors.secondary }]}>
                <Icon name="plus" size={19} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>Your story</Text>
          </Pressable>
          {people.map((person) => (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityLabel={`${person.displayName} story`}
              style={styles.storyItem}
            >
              <View style={[styles.storyAvatarFrame, { borderColor: colors.border }]}>
                <Avatar author={person} size={48} showLive={false} />
              </View>
              <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>
                {person.displayName.split(' ')[0]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const feedPosts = data?.posts || [];

  if (isLoading) return <Screen useSafeArea={false}><View style={{ height: insets.top, backgroundColor: colors.background }} /><View style={styles.stateWithHeader}><LoadingState label="Loading your feed" /></View><Header /></Screen>;
  if (isError) return <Screen useSafeArea={false}><View style={{ height: insets.top, backgroundColor: colors.background }} /><View style={styles.stateWithHeader}><ErrorState onRetry={refetch} /></View><Header /></Screen>;

  return (
    <Screen scroll={false} style={{ paddingTop: 0 }} useSafeArea={false}>
      <View style={{ height: insets.top, backgroundColor: colors.background }} />
      <Header />
      <FlatList
        data={feedPosts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<><Stories /><ClipsRail /></>}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => router.push(`/post/${item.id}`)}
            onOpenClip={() => router.push({ pathname: '/clips', params: { initialId: String(item.id) } })}
          />
        )}
        contentContainerStyle={{ paddingTop: 44, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="wind" title="It's quiet here" body="Follow people or join communities to see posts." action={() => router.push('/discover')} actionLabel="Discover People" />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', left: 0, right: 0, zIndex: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  storiesSection: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  storiesContent: { paddingHorizontal: 12, gap: 10 },
  storyItem: { width: 56, alignItems: 'center', gap: 4 },
  storyAvatarFrame: { width: 52, height: 52, borderRadius: 26, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  addStory: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  storyName: { width: 56, fontSize: 10, lineHeight: 13, fontWeight: '500', textAlign: 'center' },
  clipsSection: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  clipsHeading: { paddingHorizontal: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clipsTitle: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  clipsHint: { fontSize: 12, lineHeight: 16 },
  clipsContent: { paddingHorizontal: 12, gap: 8 },
  clipCard: { width: 104, height: 148, borderRadius: 10, overflow: 'hidden', justifyContent: 'space-between', padding: 10 },
  clipPlay: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 28 },
  clipMeta: { gap: 1 },
  clipAuthor: { color: '#FFFFFF', fontSize: 12, lineHeight: 15, fontWeight: '600' },
  clipCommunity: { color: '#C7C7CC', fontSize: 10, lineHeight: 13 },
  stateWithHeader: { flex: 1, paddingTop: 44 },
});