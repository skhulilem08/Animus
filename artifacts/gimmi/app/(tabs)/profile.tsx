import React from 'react';
import { Alert, Share } from 'react-native';
import { useGetProfile } from '@workspace/api-client-react';
import { Screen, LoadingState, ErrorState, IconButton, Text } from '@/components/GimmiUI';
import { TopHeader } from '@/components/TopHeader';
import { ProfileContent } from '@/components/ProfileContent';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { data, isLoading, isError, refetch } = useGetProfile(1, { viewerId: 1 });

  if (isLoading) return <Screen><TopHeader title="Profile" /><LoadingState label="Loading profile" /></Screen>;
  if (isError) return <Screen><TopHeader title="Profile" /><ErrorState onRetry={refetch} /></Screen>;
  if (!data) return <Screen><TopHeader title="Profile" /><Text>Profile not found</Text></Screen>;

  const { user, followerCount, followingCount, posts } = data;

  const handleEditProfile = () => {
    // No PATCH /profiles/:id endpoint exists yet — being upfront beats a
    // silent no-op. Account Information (Settings) is the closest thing,
    // and it's read-only for the same reason.
    Alert.alert("Can't edit yet", "Profile editing isn't available in this version of Gimmi yet.");
  };

  const handleShareProfile = () => {
    Share.share({
      message: `Check out ${user.displayName} (@${user.username}) on Gimmi`,
      url: `gimmi://profile/${user.id}`,
    }).catch(() => Alert.alert('Could not share profile', 'Please try again.'));
  };

  return (
    <Screen scroll={false}>
      <TopHeader
        title="Profile"
        right={<IconButton name="settings" size={24} label="Settings" onPress={() => router.push('/settings')} />}
      />
      <ProfileContent
        kind="own"
        user={user}
        followerCount={followerCount}
        followingCount={followingCount}
        posts={posts}
        onEdit={handleEditProfile}
        onShare={handleShareProfile}
      />
    </Screen>
  );
}