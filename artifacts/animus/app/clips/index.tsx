import React, { useMemo, useRef } from 'react';
import { FlatList, Pressable, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetFeed } from '@workspace/api-client-react';
import { Icon, LoadingState, ErrorState, Text } from '@/components/GimmiUI';

export default function ClipsPage() {
  const { initialId } = useLocalSearchParams<{ initialId?: string }>();
  const { data, isLoading, isError, refetch } = useGetFeed();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const clips = useMemo(() => {
    const items = (data?.posts || []).filter((post) => post.type === 'video').slice(0, 10);
    const selected = items.findIndex((post) => String(post.id) === initialId);
    return selected > 0 ? [...items.slice(selected), ...items.slice(0, selected)] : items;
  }, [data?.posts, initialId]);

  if (isLoading) return <View style={styles.state}><LoadingState label="Loading clips" /></View>;
  if (isError) return <View style={styles.state}><ErrorState onRetry={refetch} /></View>;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} hidden={false} />
      <FlatList
        ref={listRef}
        data={clips}
        keyExtractor={(item) => String(item.id)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={height}
        renderItem={({ item }) => (
          <View style={[styles.clip, { height }]}>
            <View style={styles.center}>
              <View style={styles.playButton}>
                <Icon name="play" size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.unavailable}>Clip preview unavailable</Text>
            </View>
            <View style={[styles.details, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Text style={styles.author}>{item.author.displayName}</Text>
              <Text style={styles.community}>{item.author.communityName}</Text>
              {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
            </View>
          </View>
        )}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close clips"
        onPress={() => router.back()}
        style={[styles.close, { top: insets.top + 6 }]}
      >
        <Icon name="x" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  state: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  clip: { backgroundColor: '#000000', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  playButton: { width: 64, height: 64, borderRadius: 32, borderWidth: StyleSheet.hairlineWidth, borderColor: '#8E8E93', alignItems: 'center', justifyContent: 'center' },
  unavailable: { color: '#AEAEB2', fontSize: 14 },
  details: { paddingHorizontal: 16, gap: 3 },
  author: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, fontWeight: '600' },
  community: { color: '#AEAEB2', fontSize: 13, lineHeight: 18 },
  caption: { color: '#FFFFFF', fontSize: 14, lineHeight: 19, marginTop: 6 },
  close: { position: 'absolute', left: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.48)', alignItems: 'center', justifyContent: 'center' },
});