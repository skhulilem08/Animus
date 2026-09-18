import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getGetFeedQueryKey, useCreatePost } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { Screen, Header } from '@/components/AnimusUI';

type PostKind = 'text' | 'image' | 'video';

export default function CreateScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<PostKind>('text');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const createPost = useCreatePost();
  const canPost = text.trim().length > 0 || caption.trim().length > 0;

  const publish = () => {
    if (!canPost || createPost.isPending) return;
    createPost.mutate({ data: { authorId: 1, type: kind, text: text.trim(), caption: caption.trim() } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey({ viewerId: 1 }) }); setText(''); setCaption(''); router.replace('/'); } });
  };
  return (
    <Screen>
      <Header title="Make something" subtitle="Leave a little signal for your people." right={<Pressable onPress={() => router.back()}><Feather name="x" size={22} color={colors.foreground} /></Pressable>} />
      <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput autoFocus value={text} onChangeText={setText} multiline placeholder="What has your attention?" placeholderTextColor={colors.mutedForeground} style={[styles.textInput, { color: colors.foreground }]} />
        {kind !== 'text' ? <View style={[styles.mediaSlot, { backgroundColor: colors.muted }]}><Feather name={kind === 'video' ? 'video' : 'image'} size={28} color={colors.mutedForeground} /><Text style={[styles.mediaSlotText, { color: colors.mutedForeground }]}>{kind === 'video' ? 'Add a clip' : 'Add an image'}</Text><Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>Media selection will open here</Text></View> : null}
        <TextInput value={caption} onChangeText={setCaption} placeholder="Add a quiet caption (optional)" placeholderTextColor={colors.mutedForeground} style={[styles.captionInput, { color: colors.foreground, borderTopColor: colors.border }]} />
      </View>
      <View style={styles.kindRow}>{(['text', 'image', 'video'] as PostKind[]).map((option) => <Pressable key={option} onPress={() => setKind(option)} style={[styles.kind, { backgroundColor: kind === option ? colors.secondary : colors.card, borderColor: kind === option ? colors.primary : colors.border }]}><Feather name={option === 'text' ? 'type' : option === 'image' ? 'image' : 'video'} size={16} color={kind === option ? colors.primary : colors.mutedForeground} /><Text style={[styles.kindText, { color: kind === option ? colors.secondaryForeground : colors.mutedForeground }]}>{option[0].toUpperCase() + option.slice(1)}</Text></Pressable>)}</View>
      <Pressable onPress={publish} disabled={!canPost || createPost.isPending} style={({ pressed }) => [styles.publish, { backgroundColor: canPost ? colors.primary : colors.muted, opacity: pressed ? 0.75 : 1 }]}><Text style={[styles.publishText, { color: canPost ? colors.primaryForeground : colors.mutedForeground }]}>{createPost.isPending ? 'Sharing…' : 'Share with your people'}</Text><Feather name="arrow-up-right" size={18} color={canPost ? colors.primaryForeground : colors.mutedForeground} /></Pressable>
      {createPost.isError ? <Text style={[styles.error, { color: colors.destructive }]}>That did not send. Check your connection and try again.</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  composer: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 15 },
  textInput: { minHeight: 180, padding: 17, textAlignVertical: 'top', fontSize: 19, lineHeight: 27 },
  mediaSlot: { height: 165, marginHorizontal: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 7 },
  mediaSlotText: { fontSize: 14, fontWeight: '600' },
  mediaHint: { fontSize: 11 },
  captionInput: { minHeight: 52, borderTopWidth: 1, paddingHorizontal: 17, fontSize: 14 },
  kindRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kind: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  kindText: { fontSize: 12, fontWeight: '600' },
  publish: { minHeight: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishText: { fontSize: 15, fontWeight: '700' },
  error: { textAlign: 'center', fontSize: 13, marginTop: 12 },
});