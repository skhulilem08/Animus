import React from 'react';
import { View } from 'react-native';
import { Screen, Header, IconButton, EmptyState } from '@/components/GimmiUI';
import { router } from 'expo-router';

export default function CreateLive() {
  return (
    <Screen>
      <Header left={<IconButton name="x" onPress={() => router.back()} />} title="Start Live" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState 
          icon="play" 
          title="Coming Soon" 
          body="Live broadcasting infrastructure is currently under construction."
          action={() => router.back()}
          actionLabel="Go Back"
        />
      </View>
    </Screen>
  );
}