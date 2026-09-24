import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text, Screen, Header, IconButton, Button, CommunityPill, Icon } from '@/components/GimmiUI';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useCreatePost, useGetFeed } from '@workspace/api-client-react';
import { getCommunityTheme } from '@/constants/communityThemes';

export default function CreateTextPost() {
  const colors = useColors();
  const [text, setText] = useState('');
  const createPost = useCreatePost();
  const { data: feed } = useGetFeed();
  const theme = getCommunityTheme({ color: feed?.viewer.communityColor });
  const communityName = feed?.viewer.communityName ?? 'Your community';

  const handlePost = () => {
    if (!text.trim() || !feed?.viewer.id) return;
    createPost.mutate({
      data: { authorId: feed.viewer.id, type: 'text', text: text.trim() }
    }, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkMatch = text.match(urlRegex);
  const extractedLink = linkMatch ? linkMatch[0] : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        left={<IconButton name="arrow-left" onPress={() => router.back()} />}
        title="Create Text Post"
        right={<Button label="Post" onPress={handlePost} shape="pill" style={{ minHeight: 32, paddingHorizontal: 16 }} />}
      />
      
      <View style={styles.communitySelector}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.soft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: theme.foreground, fontWeight: '600', fontSize: 13 }}>{communityName}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Share your thoughts..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          autoFocus
          maxLength={500}
          style={[styles.input, { color: colors.foreground }]}
        />
        
        {extractedLink && (
          <View style={styles.linkWrapper}>
            <View style={[styles.linkButton, { borderColor: theme.primary }]}>
              <Icon name="compass" size={16} color={theme.primary} />
              <Text style={[styles.linkButtonText, { color: theme.primary }]} numberOfLines={1}>
                {extractedLink.replace(/^https?:\/\//, '')}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={{ color: text.length > 450 ? colors.destructive : colors.mutedForeground, fontSize: 13, fontWeight: '500' }}>{text.length}/500</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  communitySelector: { paddingHorizontal: 16, paddingBottom: 16 },
  content: { flex: 1, paddingHorizontal: 16 },
  input: { fontSize: 17, paddingTop: 0, textAlignVertical: 'top', lineHeight: 22 },
  linkWrapper: { marginTop: 16 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999, borderWidth: 1 },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  footer: { padding: 16, alignItems: 'flex-end' },
});