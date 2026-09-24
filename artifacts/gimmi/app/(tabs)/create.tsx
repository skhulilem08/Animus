import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Icon, IconName, Screen, Text } from '@/components/GimmiUI';
import { TopHeader } from '@/components/TopHeader';
import { useColors } from '@/hooks/useColors';

type CreateOption = {
  label: string;
  description: string;
  icon: IconName;
  route: '/create/text' | '/create/image' | '/create/video' | '/create/live';
  testID: string;
};

const options: CreateOption[] = [
  { label: 'Text Post', description: 'Share your thoughts', icon: 'text', route: '/create/text', testID: 'create-text' },
  { label: 'Image Post', description: 'Add a photo', icon: 'image', route: '/create/image', testID: 'create-image' },
  { label: 'Video / Clip', description: 'Share a video', icon: 'video', route: '/create/video', testID: 'create-video' },
  { label: 'Start Live', description: 'Go live now', icon: 'play', route: '/create/live', testID: 'create-live' },
];

export default function CreateMenu() {
  const colors = useColors();

  const open = (route: CreateOption['route']) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <TopHeader
        title="Create"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close create"
            testID="create-close"
            hitSlop={8}
            onPress={close}
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.45 : 1 }]}
          >
            <Icon name="x" size={22} color={colors.foreground} strokeWidth={1.9} />
          </Pressable>
        }
      />

      <View style={styles.menu} accessibilityLabel="Choose what to create">
        {options.map((option) => {
          const isLive = option.route === '/create/live';
          const accent = isLive ? colors.destructive : colors.primary;
          return (
            <Pressable
              key={option.route}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              testID={option.testID}
              onPress={() => open(option.route)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: pressed ? colors.secondary : colors.background, borderColor: colors.secondary },
              ]}
            >
              <View style={[styles.iconWell, { backgroundColor: isLive ? colors.destructive + '14' : colors.primary + '14' }]}>
                <Icon name={option.icon} size={24} color={accent} strokeWidth={1.9} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: colors.foreground }]}>{option.label}</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>{option.description}</Text>
              </View>
              <Icon name="chevron" size={18} color={colors.mutedForeground} strokeWidth={1.7} />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  menu: { paddingHorizontal: 16, paddingTop: 18, gap: 12 },
  option: {
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWell: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, justifyContent: 'center', gap: 3 },
  title: { fontSize: 16, lineHeight: 21, fontWeight: '600', letterSpacing: -0.3 },
  description: { fontSize: 13, lineHeight: 18, letterSpacing: -0.1 },
});