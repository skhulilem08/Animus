import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { Screen, Header, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function CreateMenu() {
  const colors = useColors();

  return (
    <Screen>
      <Header title="Create" />
      
      <View style={styles.menu}>
        <Pressable style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/create/text')}>
          <View style={[styles.iconBox, { backgroundColor: colors.tint + '20' }]}>
            <Icon name="text" size={28} color={colors.tint} />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.title, { color: colors.foreground }]}>Text Post</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Share your thoughts</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/create/image')}>
          <View style={[styles.iconBox, { backgroundColor: '#34C75920' }]}>
            <Icon name="image" size={28} color="#34C759" />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.title, { color: colors.foreground }]}>Image Post</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Add a photo</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/create/video')}>
          <View style={[styles.iconBox, { backgroundColor: '#FF3B3020' }]}>
            <Icon name="video" size={28} color="#FF3B30" />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.title, { color: colors.foreground }]}>Video / Clip</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Share a video</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/create/live')}>
          <View style={[styles.iconBox, { backgroundColor: '#FF3B3020' }]}>
            <Icon name="play" size={28} color="#FF3B30" />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.title, { color: colors.foreground }]}>Start Live</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Go live now</Text>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  menu: { gap: 16, marginTop: 12 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  textBox: { marginLeft: 16, flex: 1 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 14 },
});