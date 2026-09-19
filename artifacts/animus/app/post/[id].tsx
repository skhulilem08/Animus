import React from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, IconButton, PostCard, Avatar } from '@/components/GimmiUI';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostComments() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title="Comments"
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={styles.postShrink}>
          {/* We'd fetch the single post, for now just a placeholder container */}
          <View style={[styles.placeholderPost, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.foreground }}>Post ID: {id} Content</Text>
          </View>
        </View>

        <Text style={[styles.commentCount, { color: colors.foreground }]}>Comments (24)</Text>

        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.commentRow}>
            <Avatar size={40} />
            <View style={styles.commentText}>
              <Text style={[styles.commentAuthor, { color: colors.foreground }]}>User {i}</Text>
              <Text style={[styles.commentBody, { color: colors.mutedForeground }]}>This is a comment {i}</Text>
            </View>
            <IconButton name="heart" size={16} color={colors.mutedForeground} />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Avatar size={36} />
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
        />
        <IconButton name="send" size={24} color={colors.tint} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  postShrink: { transform: [{ scale: 0.95 }], marginBottom: 16 },
  placeholderPost: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, height: 100, justifyContent: 'center' },
  commentCount: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  commentRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  commentText: { flex: 1, marginLeft: 12 },
  commentAuthor: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  commentBody: { fontSize: 15, lineHeight: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, fontSize: 15 },
});