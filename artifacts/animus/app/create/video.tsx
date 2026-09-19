import React from 'react';
import { View } from 'react-native';
import { Screen, Header, IconButton, EmptyState } from '@/components/GimmiUI';
import { router } from 'expo-router';

export default function CreateVideoPost() {
  return (
    <Screen>
      <Header left={<IconButton name="x" onPress={() => router.back()} />} title="New Clip" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState 
          icon="video" 
          title="Coming Soon" 
          body="Video uploading and editing is not yet available in this version of Gimmi."
          action={() => router.back()}
          actionLabel="Go Back"
        />
      </View>
    </Screen>
  );
}