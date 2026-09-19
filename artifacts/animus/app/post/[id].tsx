import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetFeed } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, EmptyState, ErrorState, Header, Icon, LoadingState, PostCard, Screen } from '@/components/AnimusUI';

export default function PostDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const feed = useGetFeed({ viewerId: 1 });
  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const post = feed.data?.posts.find((item) => String(item.id) === String(id));
  if (feed.isLoading) return <Screen><LoadingState label="Opening the conversation" /></Screen>;
  if (feed.isError) return <Screen><ErrorState onRetry={() => feed.refetch()} /></Screen>;
  if (!post) return <Screen><EmptyState icon="message-circle" title="Post not found" body="It may have been moved or is only visible in its room." /></Screen>;
  return (
    <Screen>
      <Header title="Conversation" subtitle={`${post.comments} replies`} right={<Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()}><Icon name="x" size={22} color={colors.foreground} /></Pressable>} />
      <PostCard post={post} />
      <Text style={[styles.replyLabel, { color: colors.foreground }]}>Replies</Text>
      <View style={[styles.reply, { backgroundColor: colors.card, borderColor: colors.border }]}><Avatar author={post.author} size={36} /><View style={{ flex: 1 }}><Text style={[styles.replyName, { color: colors.foreground }]}>{post.author.displayName}</Text><Text style={[styles.replyText, { color: colors.mutedForeground }]}>A thoughtful way to put it. Thanks for sharing this here.</Text></View></View>
      {replies.map((reply, index) => <View key={`${reply}-${index}`} style={[styles.reply, { backgroundColor: colors.secondary, borderColor: colors.border }]}><Avatar size={36} /><View style={{ flex: 1 }}><Text style={[styles.replyName, { color: colors.foreground }]}>You</Text><Text style={[styles.replyText, { color: colors.secondaryForeground }]}>{reply}</Text></View></View>)}
      <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}><TextInput value={comment} onChangeText={setComment} placeholder="Add to the conversation" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} /><Pressable accessibilityRole="button" accessibilityLabel="Send comment" onPress={() => { if (comment.trim()) { setReplies((current) => [...current, comment.trim()]); setComment(''); } }} disabled={!comment.trim()} style={[styles.send, { backgroundColor: comment.trim() ? colors.primary : colors.muted }]}><Icon name="arrow-up" size={18} color={comment.trim() ? colors.primaryForeground : colors.mutedForeground} /></Pressable></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  replyLabel: { fontSize: 18, fontWeight: '700', marginBottom: 11, marginTop: 6 },
  reply: { borderRadius: 16, borderWidth: 1, padding: 13, flexDirection: 'row', gap: 10, marginBottom: 14 },
  replyName: { fontSize: 13, fontWeight: '700', marginBottom: 5 },
  replyText: { fontSize: 13, lineHeight: 19 },
  composer: { minHeight: 52, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 6, marginBottom: 12 },
  input: { flex: 1, fontSize: 14, paddingVertical: 10 },
  send: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});