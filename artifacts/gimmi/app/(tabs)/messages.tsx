import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetMessages } from '@workspace/api-client-react';
import { Screen, Header, Avatar, LoadingState, ErrorState, EmptyState, Icon, relativeTime, SearchField } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function Messages() {
  const { data, isLoading, isError, refetch } = useGetMessages({ viewerId: 1 });
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <Screen><Header title="Messages" /><LoadingState label="Loading messages" /></Screen>;
  if (isError) return <Screen><Header title="Messages" /><ErrorState onRetry={refetch} /></Screen>;

  const filtered = data?.conversations.filter((c) => c.person.displayName.toLowerCase().includes(query.toLowerCase())) || [];

  return (
    <Screen scroll={false}>
      <Header
        title="Messages"
        right={
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Icon name="search" size={24} color={colors.foreground} />
            <Icon name="user-plus" size={24} color={colors.foreground} />
          </View>
        }
      />
      <View style={{ paddingHorizontal: 16 }}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search messages" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(`/conversation/${item.id}`)}
          >
            <Avatar author={item.person} size={56} />
            <View style={styles.textContainer}>
              <View style={styles.rowHeader}>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{item.person.displayName}</Text>
                <Text style={[styles.time, { color: colors.mutedForeground }]}>{relativeTime(item.updatedAt)}</Text>
              </View>
              <Text style={[styles.lastMessage, { color: item.unreadCount > 0 ? colors.foreground : colors.mutedForeground, fontWeight: item.unreadCount > 0 ? '600' : '400' }]} numberOfLines={2}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="message-circle" title="No messages" body="Start a conversation with someone." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  textContainer: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '600', flex: 1, paddingRight: 8 },
  time: { fontSize: 13 },
  lastMessage: { fontSize: 15, lineHeight: 20 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 12, paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});