import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { Screen, Header, IconButton } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function AboutPage() {
  const colors = useColors();

  return (
    <Screen>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="About Gimmi" />
      <View style={styles.container}>
        <View style={styles.logoBox}>
          {/* Using a text logo since we don't have the real logo asset */}
          <Text style={[styles.logo, { color: colors.tint }]}>✦ Gimmi</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>From Fiction to Reality</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          This platform was inspired by the fictional Zoo app featured in Miraculous. 
          We loved the idea of a connected social platform built around communities and wanted 
          to explore what that concept could look like as a real-world product.
        </Text>
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Not affiliated with or endorsed by Miraculous or its rights holders.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center' },
  logoBox: { marginBottom: 32, alignItems: 'center' },
  logo: { fontSize: 40, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  disclaimer: { fontSize: 12, textAlign: 'center', opacity: 0.6 },
});