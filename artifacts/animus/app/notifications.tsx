import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetNotifications } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { EmptyState, ErrorState, Header, Icon, IconName, LoadingState, Screen, relativeTime } from '@/components/AnimusUI';

const iconFor = (kind: string): IconName => ({ like: 'heart', comment: 'message-circle', follow: 'user-plus', live: 'bell', message: 'message-circle', community: 'hash' }[kind] as IconName || 'bell');

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const notifications = useGetNotifications(1);
  if (notifications.isLoading) return <Screen><LoadingState label="Gathering your signals" /></Screen>;
  if (notifications.isError) return <Screen><ErrorState onRetry={() => notifications.refetch()} /></Screen>;
  const items = notifications.data?.notifications ?? [];
  const unread = items.filter((item) => !item.read);
  const earlier = items.filter((item) => item.read);
  const group = (title: string, values: typeof items) => values.length ? <View><Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>{title}</Text>{values.map((item) => <Pressable key={item.id} onPress={() => item.kind === 'message' ? router.push('/messages') : undefined} style={[styles.item, { borderBottomColor: colors.border, backgroundColor: item.read ? 'transparent' : colors.secondary }]}><View style={[styles.icon, { backgroundColor: item.read ? colors.muted : colors.accent }]}><Icon name={iconFor(item.kind)} size={17} color={colors.foreground} /></View><View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{item.detail}</Text></View><Text style={[styles.time, { color: colors.mutedForeground }]}>{relativeTime(item.createdAt)}</Text></Pressable>)}</View> : null;
  return <Screen><Header title="Notifications" subtitle="A gentle pulse from your communities." right={<Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()}><Icon name="x" size={22} color={colors.foreground} /></Pressable>} />{group('NEW', unread)}{group('EARLIER', earlier)}{!items.length ? <EmptyState icon="bell" title="All caught up" body="When something happens, you will see it here." /> : null}</Screen>;
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: 4, marginBottom: 8 },
  item: { minHeight: 70, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 9, borderRadius: 10 },
  icon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  detail: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 10, alignSelf: 'flex-start', paddingTop: 14 },
});