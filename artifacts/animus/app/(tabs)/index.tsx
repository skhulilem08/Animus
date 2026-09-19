import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetFeed, useTogglePostLike, useGetDiscover } from '@workspace/api-client-react';
import { Screen, PostCard, LoadingState, ErrorState, EmptyState, IconButton, Avatar, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function HomeFeed() {
  const { data, isLoading, isError, refetch } = useGetFeed();
  const { data: discoverData } = useGetDiscover();
  const toggleLike = useTogglePostLike();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLike = (postId: number) => {
    toggleLike.mutate({ postId, data: { viewerId: 1 } });
  };

  const Header = () => (
    <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.headerLeft}>
        <View style={{ width: 28, height: 28, backgroundColor: colors.tint, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>G</Text>
        </View>
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
          <View style={styles.storyItem}>
            <View style={styles.storyRing}>
              <View style={[styles.addStory, { backgroundColor: colors.secondary }]}>
                <Icon name="plus" size={24} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>Your story</Text>
          </View>
          {people.map(person => (
            <View key={person.id} style={styles.storyItem}>
              <View style={[styles.storyRing, { borderColor: person.isLive ? colors.destructive : colors.border }]}>
                <Avatar author={person} size={58} />
              </View>
              <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>{person.displayName.split(' ')[0]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) return <Screen><Header /><LoadingState label="Loading your feed" /></Screen>;
  if (isError) return <Screen><Header /><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen scroll={false} style={{ paddingTop: 0 }} useSafeArea={false}>
      <View style={{ height: 44 }} />
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
        contentContainerStyle={{ paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="wind" title="It's quiet here" body="Follow people or join communities to see posts." action={() => router.push('/discover')} actionLabel="Discover People" />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  storiesContainer: { paddingVertical: 16 },
  storiesContent: { paddingHorizontal: 16, gap: 16 },
  storyItem: { alignItems: 'center', gap: 6, width: 68 },
  addStory: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  storyRing: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  storyName: { fontSize: 13, fontWeight: '500' }
});