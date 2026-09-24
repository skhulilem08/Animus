import { useGetMessages, useGetProfile, Author } from '@workspace/api-client-react';

/**
 * The conversation-messages endpoint only returns raw Message rows
 * (senderId/recipientId), not participant info — so the other person's
 * name/avatar comes from the conversations list when available. A newly opened
 * conversation can have no messages yet, so fall back to the recipient profile.
 */
export function useConversationPerson(conversationId: number): Author | null {
  const { data } = useGetMessages();
  const { data: profile } = useGetProfile(conversationId);
  return data?.conversations.find((c) => c.id === conversationId)?.person ?? profile?.user ?? null;
}
