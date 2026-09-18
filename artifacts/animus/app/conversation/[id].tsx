import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGetMessages, useSendMessage } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Avatar, EmptyState, ErrorState, Header, LoadingState, relativeTime } from '@/components/AnimusUI';

export default function ConversationScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const messages = useGetMessages({ viewerId: 1 });
  const sendMessage = useSendMessage();
  const [body, setBody] = useState('');
  const conversation = messages.data?.conversations.find((item) => String(item.id) === String(id));
  const send = () => {
    if (!body.trim() || !conversation) return;
    sendMessage.mutate({ data: { senderId: 1, recipientId: conversation.person.id, body: body.trim() } }, { onSuccess: () => setBody('') });
  };
  if (messages.isLoading) return <View style={[styles.full, { backgroundColor: colors.background }]}><LoadingState label="Opening the conversation" /></View>;
  if (messages.isError) return <View style={[styles.full, { backgroundColor: colors.background }]}><ErrorState onRetry={() => messages.refetch()} /></View>;
  if (!conversation) return <View style={[styles.full, { backgroundColor: colors.background }]}><EmptyState icon="message-circle" title="Conversation not found" body="This conversation may have been archived." /></View>;
  return <KeyboardAvoidingView style={[styles.full, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.content}><Header title={conversation.person.displayName} subtitle={`@${conversation.person.username}`} right={<Pressable onPress={() => router.back()}><Feather name="x" size={22} color={colors.foreground} /></Pressable>} /><View style={styles.person}><Avatar author={conversation.person} size={58} /><Text style={[styles.personNote, { color: colors.mutedForeground }]}>You share a room in {conversation.person.communityName}</Text></View><View style={{ flex: 1, justifyContent: 'flex-end', gap: 10 }}><View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: 'flex-start' }]}><Text style={[styles.bubbleText, { color: colors.foreground }]}>{conversation.lastMessage}</Text><Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>{relativeTime(conversation.updatedAt)}</Text></View><View style={[styles.bubble, { backgroundColor: colors.primary, alignSelf: 'flex-end' }]}><Text style={[styles.bubbleText, { color: colors.primaryForeground }]}>Glad you found me here.</Text><Text style={[styles.bubbleTime, { color: colors.primaryForeground }]}>read</Text></View></View></View>
    <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}><TextInput value={body} onChangeText={setBody} placeholder="Write a message" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} multiline /><Pressable onPress={send} disabled={!body.trim() || sendMessage.isPending} style={[styles.send, { backgroundColor: body.trim() ? colors.primary : colors.muted }]}><Feather name="arrow-up" size={18} color={body.trim() ? colors.primaryForeground : colors.mutedForeground} /></Pressable></View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 },
  person: { alignItems: 'center', gap: 8, paddingBottom: 10 },
  personNote: { fontSize: 12 },
  bubble: { maxWidth: '78%', borderRadius: 17, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, opacity: 0.8, textAlign: 'right' },
  inputBar: { minHeight: 67, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, paddingTop: 8, gap: 9 },
  input: { flex: 1, maxHeight: 90, fontSize: 14, paddingHorizontal: 10 },
  send: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});