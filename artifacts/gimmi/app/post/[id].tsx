import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, IconButton, PostCard, Avatar, LoadingState, ErrorState } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetPost, useGetPostComments, useGetFeed, useCreatePostComment } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export default function PostComments() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');

  const { data: feed } = useGetFeed();
  const { data: post, isLoading: postLoading, isError: postError, refetch: refetchPost } = useGetPost(postId);
  const { data: commentsData, isLoading: commentsLoading, isError: commentsError, refetch: refetchComments } = useGetPostComments(postId);
  const addComment = useCreatePostComment();

  const comments = commentsData?.comments ?? [];
  const viewerId = feed?.viewer.id;

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !viewerId) return;
    setDraft('');
    addComment.mutate(
      { postId, data: { authorId: viewerId, body } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
          queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
        },
      },
    );
  };

  if (postLoading || commentsLoading) {
    return (
      <Screen>
        <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Comments" />
        <LoadingState label="Loading comments…" />
      </Screen>
    );
  }

  if (postError || !post) {
    return (
      <Screen>
        <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Comments" />
        <ErrorState onRetry={refetchPost} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header left={<IconButton name="arrow-left" onPress={() => router.back()} />} title="Comments" />
      <FlatList
        data={comments}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={styles.postShrink}>
            <PostCard post={post} />
            <Text style={[styles.commentCount, { color: colors.foreground }]}>
              Comments ({comments.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          commentsError ? (
            <ErrorState onRetry={refetchComments} />
          ) : (
            <Text style={{ color: colors.mutedForeground, paddingVertical: 24, textAlign: 'center' }}>
              No comments yet — be the first to say something.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Avatar author={item.author} size={40} />
            <View style={styles.commentText}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={[styles.commentAuthor, { color: colors.foreground }]}>{item.author.displayName}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{relativeTime(item.createdAt)}</Text>
              </View>
              <Text style={[styles.commentBody, { color: colors.foreground }]}>{item.body}</Text>
            </View>
            <IconButton name="heart" size={16} color={colors.mutedForeground} label="Like comment" />
          </View>
        )}
      />

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Avatar author={post.author} size={36} />
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <IconButton
          name="send"
          size={24}
          color={draft.trim() ? colors.tint : colors.mutedForeground}
          onPress={handleSend}
          label="Send comment"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  postShrink: { marginBottom: 8 },
  commentCount: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  commentRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  commentText: { flex: 1, marginLeft: 12 },
  commentAuthor: { fontSize: 14, fontWeight: '600' },
  commentBody: { fontSize: 15, lineHeight: 20, marginTop: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, fontSize: 15 },
});