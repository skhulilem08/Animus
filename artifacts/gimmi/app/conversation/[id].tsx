import React, { useState } from 'react';
import { View, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/GimmiUI';
import { Screen, Header, IconButton, Avatar } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Conversation() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState('');

  // Mock messages
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello!', isMe: false },
    { id: 2, text: 'Hi! How are you?', isMe: true },
    { id: 3, text: 'Doing great, thanks!', isMe: false },
  ].reverse());

  const handleSend = () => {
    if (!msg.trim()) return;
    setMessages([{ id: Date.now(), text: msg, isMe: true }, ...messages]);
    setMsg('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title="Chat"
        right={<View style={{ flexDirection: 'row', gap: 8 }}><IconButton name="phone" onPress={() => router.push(`/calls/voice/${id}`)} /><IconButton name="video" onPress={() => router.push(`/calls/video/${id}`)} /></View>}
      />
      
      <FlatList
        data={messages}
        keyExtractor={item => String(item.id)}
        inverted
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, { alignSelf: item.isMe ? 'flex-end' : 'flex-start', backgroundColor: item.isMe ? colors.tint : colors.card, borderColor: item.isMe ? colors.tint : colors.border }]}>
            <Text style={[styles.bubbleText, { color: item.isMe ? '#fff' : colors.foreground }]}>{item.text}</Text>
          </View>
        )}
      />

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <IconButton name="plus" size={24} color={colors.tint} />
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
        />
        <IconButton name="send" size={24} color={colors.tint} onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16 },
});