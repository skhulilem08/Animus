import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useGetMessages, useGetCallLog } from '@workspace/api-client-react';
import { Screen, Icon, IconName, LoadingState, ErrorState, SearchField, Text } from '@/components/GimmiUI';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { TopHeader } from '@/components/TopHeader';
import { InboxRow } from '@/components/InboxRow';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

function InboxEmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const colors = useColors();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Icon name={icon} size={26} color={colors.foreground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export default function Messages() {
  const messages = useGetMessages({ viewerId: 1 });
  const calls = useGetCallLog({ viewerId: 1 });
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'messages' | 'calls'>('messages');
  const activeRequest = tab === 'messages' ? messages : calls;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await activeRequest.refetch();
    setRefreshing(false);
  }, [activeRequest.refetch]);

  const search = query.trim().toLowerCase();
  const filteredMessages = messages.data?.conversations.filter(
    (conversation) => conversation.person.displayName.toLowerCase().includes(search),
  ) ?? [];
  const filteredCalls = calls.data?.attempts.filter(
    (attempt) => attempt.recipient.displayName.toLowerCase().includes(search) || attempt.type.includes(search),
  ) ?? [];
  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />;

  return (
    <Screen scroll={false}>
      <TopHeader title="Messages" />
      <View style={styles.controls}>
        <SegmentedTabs
          labels={['Messages', 'Call Log']}
          selectedIndex={tab === 'messages' ? 0 : 1}
          onChange={(index) => { setTab(index === 0 ? 'messages' : 'calls'); setQuery(''); }}
        />
        <SearchField
          value={query}
          onChangeText={setQuery}
          shape="pill"
          placeholder={tab === 'messages' ? 'Search messages' : 'Search call log'}
        />
      </View>
      {activeRequest.isLoading ? (
        <LoadingState label={tab === 'messages' ? 'Loading messages' : 'Loading call log'} />
      ) : activeRequest.isError ? (
        <ErrorState onRetry={activeRequest.refetch} />
      ) : tab === 'messages' ? (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <InboxRow
              person={item.person}
              subtitle={item.lastMessage}
              timestamp={item.updatedAt}
              unreadCount={item.unreadCount}
              accessibilityLabel={`Open conversation with ${item.person.displayName}`}
              onPress={() => router.push(`/conversation/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          ListEmptyComponent={
            <InboxEmptyState icon="message-circle" title={search ? 'No matching messages' : 'No messages'} body={search ? 'Try another name.' : 'Conversations will appear here when you exchange messages.'} />
          }
        />
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <InboxRow
              person={item.recipient}
              subtitle={`Outgoing ${item.type} preview · Not connected`}
              timestamp={item.startedAt}
              trailingIcon={item.type === 'video' ? 'video' : 'phone'}
              accessibilityLabel={`View ${item.recipient.displayName}'s profile`}
              onPress={() => router.push(`/profile/${item.recipient.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          ListEmptyComponent={
            <InboxEmptyState icon="phone" title={search ? 'No matching calls' : 'No call attempts'} body={search ? 'Try another name or call type.' : 'Voice and video previews you start will appear here. Calling is not connected yet.'} />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 112, flexGrow: 1 },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 96 },
  emptyIcon: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 290 },
});