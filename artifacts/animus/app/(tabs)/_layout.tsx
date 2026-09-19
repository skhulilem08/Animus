import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Icon, IconName } from '@/components/GimmiUI';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
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

function LiquidFallbackTabBar({ state, navigation }: CustomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const outerInset = 10;
  const barWidth = width - outerInset * 2;
  const itemWidth = barWidth / state.routes.length;
  const translateX = useRef(new Animated.Value(state.index * itemWidth)).current;
  const dragStart = useRef(state.index * itemWidth);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * itemWidth,
      damping: 18,
      stiffness: 210,
      mass: 0.72,
      useNativeDriver: false,
    }).start();
  }, [itemWidth, state.index, translateX]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy)
    ),
    onPanResponderGrant: () => {
      translateX.stopAnimation((value) => {
        dragStart.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const maximum = itemWidth * (state.routes.length - 1);
      translateX.setValue(Math.max(0, Math.min(maximum, dragStart.current + gesture.dx)));
    },
    onPanResponderRelease: (_, gesture) => {
      const targetIndex = Math.max(
        0,
        Math.min(
          state.routes.length - 1,
          Math.round((dragStart.current + gesture.dx) / itemWidth),
        ),
      );
      const targetRoute = state.routes[targetIndex];

      Animated.spring(translateX, {
        toValue: targetIndex * itemWidth,
        damping: 18,
        stiffness: 210,
        mass: 0.72,
        useNativeDriver: false,
      }).start();

      if (targetIndex !== state.index) {
        const event = navigation.emit({
          type: 'tabPress',
          target: targetRoute.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) navigation.navigate(targetRoute.name, targetRoute.params);
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateX, {
        toValue: state.index * itemWidth,
        damping: 18,
        stiffness: 210,
        mass: 0.72,
        useNativeDriver: false,
      }).start();
    },
  }), [itemWidth, navigation, state.index, state.routes, translateX]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.fallbackLayer,
        { bottom: Math.max(insets.bottom, Platform.OS === 'web' ? 18 : 8) },
      ]}
    >
      <BlurView
        intensity={88}
        tint="light"
        style={[styles.fallbackBar, { width: barWidth }]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selectionPill,
            {
              width: itemWidth - 8,
              transform: [{ translateX }],
            },
          ]}
        >
          <BlurView
            intensity={100}
            tint="light"
            style={[StyleSheet.absoluteFill, styles.selectionGlass]}
          />
          <View style={styles.selectionHighlight} />
        </Animated.View>
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
              style={[styles.fallbackItem, { width: itemWidth }]}
            >
              <Icon
                name={fallbackIcons[route.name] || 'home'}
                size={24}
                color={selected ? colors.primary : colors.mutedForeground}
                strokeWidth={selected ? 2.35 : 1.8}
              />
            </Pressable>
          );
        })}
      </BlurView>
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
      tabBar={(props) => <LiquidFallbackTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
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
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  selectionPill: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.62)',
    overflow: 'hidden',
    zIndex: 1,
  },
  selectionGlass: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  selectionHighlight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  fallbackItem: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
});