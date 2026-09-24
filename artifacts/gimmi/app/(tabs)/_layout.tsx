import React from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Icon, IconName } from '@/components/GimmiUI';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabsProps = React.ComponentProps<typeof Tabs>;
type CustomTabBarProps = Parameters<NonNullable<TabsProps['tabBar']>>[0];

const fallbackIcons: Record<string, IconName> = {
  index: 'home',
  discover: 'search',
  create: 'plus',
  messages: 'message-circle',
  profile: 'user',
};

function SolidFallbackTabBar({ state, navigation }: CustomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const outerInset = 10;
  const barWidth = width - outerInset * 2;
  const itemWidth = barWidth / state.routes.length;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.fallbackLayer,
        { bottom: Math.max(insets.bottom, Platform.OS === 'web' ? 18 : 8) },
      ]}
    >
      <View style={[styles.fallbackBar, { width: barWidth, backgroundColor: colors.background }]}>
        {state.routes.map((route, index) => {
          const selected = state.index === index;
          const label = route.name === 'index'
            ? 'Home'
            : route.name.charAt(0).toUpperCase() + route.name.slice(1);

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={({ pressed }) => [styles.fallbackItem, { width: itemWidth, opacity: pressed ? 0.65 : 1 }]}
            >
              <View style={[styles.fallbackItemInner, selected && { backgroundColor: colors.secondary }]}>
                <Icon
                  name={fallbackIcons[route.name] || 'home'}
                  size={24}
                  color={selected ? colors.primary : colors.mutedForeground}
                  strokeWidth={selected ? 2.35 : 1.8}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const hasLiquidGlassTabs = Platform.OS === 'ios' && isLiquidGlassAvailable();

  if (hasLiquidGlassTabs) {
    return (
      <NativeTabs
        tintColor={colors.primary}
        iconColor={{ default: colors.mutedForeground, selected: colors.primary }}
        minimizeBehavior="never"
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
          <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="discover">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
          <NativeTabs.Trigger.Label hidden>Discover</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="create">
          <NativeTabs.Trigger.Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
          <NativeTabs.Trigger.Label hidden>Create</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="messages">
          <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
          <NativeTabs.Trigger.Label hidden>Messages</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
          <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <SolidFallbackTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 56, paddingBottom: 2 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 12,
          fontWeight: '500',
          marginTop: -2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={23} color={String(color)} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Icon name="search" size={23} color={String(color)} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Icon name="plus" size={23} color={String(color)} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Icon name="message-circle" size={23} color={String(color)} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="user" size={23} color={String(color)} strokeWidth={1.9} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fallbackLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  fallbackBar: {
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
  },
  fallbackItem: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackItemInner: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
});