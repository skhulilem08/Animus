import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text, Screen, LoadingState, ErrorState, IconButton } from '@/components/GimmiUI';
import { TopHeader } from '@/components/TopHeader';
import { ProfileContent } from '@/components/ProfileContent';
import { useGetProfile, useGetFeed, useToggleFollow } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = Number(id);
  const queryClient = useQueryClient();

  const { data: feed } = useGetFeed();
  const viewerId = feed?.viewer.id;
  const { data, isLoading, isError, refetch } = useGetProfile(profileId, { viewerId });
  const toggleFollow = useToggleFollow();
  const [override, setOverride] = useState<{ profileId: number; following: boolean; followerCount: number } | null>(null);
  const isOwnProfile = viewerId != null && viewerId === profileId;

  // Own profile has a dedicated tab with Edit/Share — send there instead of
  // rendering a Follow/Message screen for yourself.
  React.useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile');
  }, [isOwnProfile]);

  const backButton = <IconButton name="arrow-left" label="Back" onPress={() => router.back()} />;
  if (isLoading || isOwnProfile) return <Screen><TopHeader left={backButton} title="Profile" /><LoadingState label="Loading profile" /></Screen>;
  if (isError) return <Screen><TopHeader left={backButton} title="Profile" /><ErrorState onRetry={refetch} /></Screen>;
  if (!data) return <Screen><TopHeader left={backButton} title="Profile" /><Text>Profile not found</Text></Screen>;

  const { user, followerCount, followingCount, posts } = data;
  const activeOverride = override?.profileId === profileId ? override : null;
  const isFollowing = activeOverride?.following ?? data.followedByViewer;
  const shownFollowerCount = activeOverride?.followerCount ?? followerCount;

  const handleFollow = () => {
    if (!viewerId) {
      Alert.alert('Please wait', 'Your profile is still loading.');
      return;
    }
    if (toggleFollow.isPending) return;
    const nextFollowing = !isFollowing;
    const previousOverride = override;
    setOverride({ profileId, following: nextFollowing, followerCount: shownFollowerCount + (nextFollowing ? 1 : -1) });
    toggleFollow.mutate(
      { profileId, data: { viewerId } },
      {
        onSuccess: (res) => {
          setOverride({ profileId, following: res.following, followerCount: res.followerCount });
          queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
        },
        onError: () => {
          setOverride(previousOverride);
          Alert.alert('Could not update follow', 'Please try again.');
        },
      },
    );
  };

  return (
    <Screen scroll={false}>
      <TopHeader left={backButton} title="Profile" />
      <ProfileContent
        kind="other"
        user={user}
        followerCount={shownFollowerCount}
        followingCount={followingCount}
        posts={posts}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onMessage={() => router.push(`/conversation/${user.id}`)}
      />
    </Screen>
  );
}
