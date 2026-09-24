import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Author } from '@workspace/api-client-react';
import { Avatar, Icon, IconName, Text, relativeTime } from '@/components/GimmiUI';
import { useColors } from '@/hooks/useColors';

type Props = {
  person: Author;
  subtitle: string;
  timestamp: string;
  onPress: () => void;
  accessibilityLabel: string;
  unreadCount?: number;
  trailingIcon?: IconName;
};

/** One identity-first row used by both conversations and call attempts. */
export function InboxRow({ person, subtitle, timestamp, onPress, accessibilityLabel, unreadCount = 0, trailingIcon }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondary }]}
    >
      <Avatar author={person} size={52} fallback="initials" />
      <View style={styles.details}>
        <View style={styles.heading}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{person.displayName}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{relativeTime(timestamp)}</Text>
        </View>
        <Text
          style={[styles.subtitle, { color: unreadCount > 0 ? colors.foreground : colors.mutedForeground, fontWeight: unreadCount > 0 ? '600' : '400' }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.tint }]}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      ) : trailingIcon ? (
        <Icon name={trailingIcon} size={19} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 80, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 22, marginBottom: 4 },
  details: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  name: { fontSize: 17, lineHeight: 22, fontWeight: '600', flex: 1, paddingRight: 8 },
  time: { fontSize: 13, lineHeight: 18 },
  subtitle: { fontSize: 15, lineHeight: 20 },
  badge: { minWidth: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginLeft: 10, paddingHorizontal: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});