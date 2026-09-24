import { useGetMessages, Author } from '@workspace/api-client-react';

/**
 * The conversation-messages endpoint only returns raw Message rows
 * (senderId/recipientId), not participant info — so the other person's
 * name/avatar has to come from the conversations list instead, matched by
 * conversation id. Same approach used in app/profile/[id].tsx.
 */
export function useConversationPerson(conversationId: number): Author | null {
  const { data } = useGetMessages();
  return data?.conversations.find((c) => c.id === conversationId)?.person ?? null;
}
