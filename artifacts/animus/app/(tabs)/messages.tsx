import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetMessages } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, EmptyState, ErrorState, Header, Icon, LoadingState, Screen, SearchField, relativeTime } from '@/components/AnimusUI';

export default function MessagesScreen() {
  const colors = useColors();
  const router = useRouter();
  const messages = useGetMessages({ viewerId: 1 });
  const [search, setSearch] = React.useState('');
  if (messages.isLoading) return <Screen><LoadingState label="Opening your conversations" /></Screen>;
  if (messages.isError) return <Screen><ErrorState onRetry={() => messages.refetch()} /></Screen>;
  const conversations = (messages.data?.conversations ?? []).filter((item) => item.person.displayName.toLowerCase().includes(search.toLowerCase()));
  return (
    <Screen>
      <Header title="Messages" subtitle="Private, human, and unhurried." right={<Pressable accessibilityRole="button" accessibilityLabel="New message" onPress={() => router.push('/discover')}><Icon name="text" size={21} color={colors.foreground} /></Pressable>} />
      <SearchField value={search} onChangeText={setSearch} placeholder="Search conversations" />
      {conversations.map((conversation) => <Pressable key={conversation.id} onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: String(conversation.id) } })} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
        <Avatar author={conversation.person} size={51} /><View style={{ flex: 1, gap: 5 }}><View style={styles.rowTop}><Text style={[styles.name, { color: colors.foreground }]}>{conversation.person.displayName}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{relativeTime(conversation.updatedAt)}</Text></View><Text numberOfLines={1} style={[styles.lastMessage, { color: colors.mutedForeground }]}>{conversation.lastMessage}</Text></View>{conversation.unreadCount > 0 ? <View style={[styles.unread, { backgroundColor: colors.primary }]}><Text style={[styles.unreadText, { color: colors.primaryForeground }]}>{conversation.unreadCount}</Text></View> : <Icon name="message-circle" size={17} color={colors.mutedForeground} />}
      </Pressable>)}
      {!conversations.length ? <EmptyState icon="message-circle" title={search ? 'No matches' : 'A quiet inbox'} body={search ? 'Try another name.' : 'When a conversation starts, it will live here.'} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 79, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700' },
  time: { fontSize: 11 },
  lastMessage: { fontSize: 13 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadText: { fontSize: 11, fontWeight: '700' },
});