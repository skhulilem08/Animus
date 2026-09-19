import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetFeed, useTogglePostLike, useGetDiscover } from '@workspace/api-client-react';
import { Screen, PostCard, LoadingState, ErrorState, EmptyState, IconButton, Avatar, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

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
    toggleLike.mutate(
      { postId, data: { viewerId: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/feed'] }) },
    );
  };

  const Header = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.headerLeft}>
        <Icon name="spark" size={23} color={colors.primary} strokeWidth={2.2} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gimmi</Text>
      </View>
      <View style={styles.headerRight}>
        <IconButton name="search" size={24} onPress={() => router.push('/discover')} />
        <IconButton name="bell" size={24} badge={true} onPress={() => router.push('/notifications')} />
      </View>
    </View>
  );

  const Stories = () => {
    const people = discoverData?.people?.slice(0, 5) || [];
    return (
      <View style={[styles.storiesContainer, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContent}>
          <Pressable accessibilityRole="button" accessibilityLabel="Create your story" style={styles.storyItem} onPress={() => router.push('/create')}>
            <View style={[styles.storyRing, { borderColor: colors.border }]}>
              <View style={[styles.addStory, { backgroundColor: colors.secondary }]}>
                <Icon name="plus" size={20} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>Your story</Text>
          </Pressable>
          {people.map(person => (
            <Pressable key={person.id} accessibilityRole="button" accessibilityLabel={`${person.displayName}${person.isLive ? ', live now' : ''}`} style={styles.storyItem}>
              <View style={[styles.storyRing, { borderColor: person.isLive ? colors.destructive : colors.border }]}>
                <Avatar author={person} size={46} />
              </View>
              <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>{person.displayName.split(' ')[0]}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) return <Screen><Header /><LoadingState label="Loading your feed" /></Screen>;
  if (isError) return <Screen><Header /><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen scroll={false} style={{ paddingTop: 0 }} useSafeArea={false}>
      <View style={{ height: insets.top, backgroundColor: colors.background }} />
      <Header />
      <FlatList
        data={data?.posts || []}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<Stories />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => router.push(`/post/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="wind" title="It's quiet here" body="Follow people or join communities to see posts." action={() => router.push('/discover')} actionLabel="Discover People" />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  storiesContainer: { paddingVertical: 10 },
  storiesContent: { paddingHorizontal: 12, gap: 10 },
  storyItem: { alignItems: 'center', gap: 4, width: 54 },
  addStory: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  storyRing: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  storyName: { fontSize: 10, lineHeight: 13, fontWeight: '500' }
});