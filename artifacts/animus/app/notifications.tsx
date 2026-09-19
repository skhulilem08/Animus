import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { useGetNotifications } from '@workspace/api-client-react';
import { Screen, Header, IconButton, LoadingState, ErrorState, EmptyState, Icon, relativeTime } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function Notifications() {
  const { data, isLoading, isError, refetch } = useGetNotifications(1);
  const colors = useColors();
  const [filter, setFilter] = useState('All');

  if (isLoading) return <Screen><Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Notifications" /><LoadingState /></Screen>;
  if (isError) return <Screen><Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Notifications" /><ErrorState onRetry={refetch} /></Screen>;

  const filters = ['All', 'Social', 'Community', 'Live', 'Messages'];

  return (
    <Screen scroll={false}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title="Notifications"
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.filterPill, { backgroundColor: filter === item ? colors.primary : colors.secondary }]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, { color: filter === item ? colors.primaryForeground : colors.foreground }]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={data?.notifications || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
        renderItem={({ item }) => (
          <View style={styles.notifRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
              <Icon name={item.kind === 'like' ? 'heart' : item.kind === 'message' ? 'message-circle' : item.kind === 'follow' ? 'user-plus' : 'bell'} size={24} color={colors.foreground} />
            </View>
            <View style={styles.notifText}>
              <Text style={[styles.notifTitle, { color: colors.foreground }]}><Text style={{ fontWeight: '700' }}>{item.title}</Text> {item.detail}</Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{relativeTime(item.createdAt)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="bell" title="All caught up" body="You don't have any notifications right now." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 14, fontWeight: '600' },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notifText: { flex: 1, marginLeft: 16 },
  notifTitle: { fontSize: 15, lineHeight: 20 },
  notifTime: { fontSize: 13, marginTop: 4 },
});