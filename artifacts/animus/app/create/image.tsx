import React from 'react';
import { View } from 'react-native';
import { Screen, Header, IconButton, EmptyState } from '@/components/GimmiUI';
import { router } from 'expo-router';

export default function CreateImagePost() {
  return (
    <Screen>
      <Header left={<IconButton name="x" onPress={() => router.back()} />} title="New Image" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState 
          icon="image" 
          title="Coming Soon" 
          body="Image uploading is not yet available in this version of Gimmi."
          action={() => router.back()}
          actionLabel="Go Back"
        />
      </View>
    </Screen>
  );
}