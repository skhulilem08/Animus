import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Header, IconButton, Text, Avatar, LoadingState, ErrorState, CommunityPill } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useGetProfile } from '@workspace/api-client-react';

function Field({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={{ color: colors.mutedForeground, fontSize: 13, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontSize: 17 }}>{value}</Text>
    </View>
  );
}

export default function AccountInfoScreen() {
  const colors = useColors();
  // Profile id 1 is the logged-in viewer throughout this app (there's no
  // auth system yet — see the Log out row in settings.tsx).
  const { data, isLoading, isError, refetch } = useGetProfile(1);

  return (
    <Screen scroll={false}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Account Information" />
      {isLoading ? (
        <LoadingState label="Loading account" />
      ) : isError || !data ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Avatar author={data.user} size={88} />
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Field label="Display name" value={data.user.displayName} />
            <Field label="Username" value={`@${data.user.username}`} />
            <View style={styles.field}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, marginBottom: 4 }}>Community</Text>
              <CommunityPill name={data.user.communityName} color={data.user.communityColor} />
            </View>
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 16, paddingHorizontal: 4 }}>
            Editing your profile isn't available yet — this is a read-only view of your account.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  field: { marginBottom: 16 },
});
