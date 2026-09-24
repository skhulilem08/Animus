import React, { useState } from 'react';
import { View, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Screen, Header, IconButton, Avatar, LoadingState, ErrorState, relativeTime } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetConversationMessages, useSendMessage, useLogCallAttempt, useGetFeed, Message } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useConversationPerson } from '@/hooks/useConversationPerson';

export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');

  const { data: feed } = useGetFeed();
  const viewerId = feed?.viewer.id;
  const person = useConversationPerson(conversationId);
  const { data, isLoading, isError, refetch } = useGetConversationMessages(conversationId, { viewerId });
  const sendMessage = useSendMessage();
  const logCallAttempt = useLogCallAttempt();

  const messages = data?.messages ?? [];
  const inverted = [...messages].reverse();

  const handleSend = () => {
    const body = msg.trim();
    if (!body || !viewerId || !person) return;
    setMsg('');
    sendMessage.mutate(
      { data: { senderId: viewerId, recipientId: person.id, body } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
          queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
        },
      },
    );
  };

  const startCallPreview = (type: 'voice' | 'video') => {
    if (!viewerId || !person) {
      Alert.alert('Not ready yet', 'Wait for the conversation to load before starting a call preview.');
      return;
    }
    if (logCallAttempt.isPending) return;
    logCallAttempt.mutate(
      { data: { viewerId, recipientId: person.id, type } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/call-log'] });
          router.push(`/calls/${type}/${id}`);
        },
        onError: () => Alert.alert('Could not start preview', 'Your call attempt could not be logged. Please try again.'),
      },
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title={person?.displayName ?? 'Chat'}
        onTitlePress={person ? () => router.push(`/profile/${person.id}`) : undefined}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton name="phone" onPress={() => startCallPreview('voice')} label="Voice call preview" />
            <IconButton name="video" onPress={() => startCallPreview('video')} label="Video call preview" />
          </View>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading conversation" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <FlatList
          data={inverted}
          keyExtractor={(item: Message) => String(item.id)}
          inverted
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ListEmptyComponent={
            <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingVertical: 24 }}>
              Say hi to {person?.displayName ?? 'them'} 👋
            </Text>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === viewerId;
            return (
              <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', marginBottom: 12 }}>
                <View style={[styles.bubble, { backgroundColor: isMe ? colors.tint : colors.card, borderColor: isMe ? colors.tint : colors.border }]}>
                  <Text style={[styles.bubbleText, { color: isMe ? '#fff' : colors.foreground }]}>{item.body}</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 3, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                  {relativeTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
        />
      )}

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Avatar author={person} size={32} />
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <IconButton name="send" size={24} color={msg.trim() ? colors.tint : colors.mutedForeground} onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16 },
});
