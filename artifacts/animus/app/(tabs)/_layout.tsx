import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Icon } from '@/components/GimmiUI';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          ...(isWeb ? { height: 56, paddingBottom: 2 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 12,
          fontWeight: '500',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 1,
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