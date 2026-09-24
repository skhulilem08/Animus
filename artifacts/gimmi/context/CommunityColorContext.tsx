import React, { createContext, ReactNode, useContext } from 'react';
import { useGetFeed } from '@workspace/api-client-react';

// Fallback shown before the viewer's feed/community data has loaded.
// Deliberately systemBlue, not systemRed — several community colors
// (Ladybug, Dragon, Rooster) ARE systemRed, and destructive/like are
// reserved for systemRed, so a red default here would make the app's
// primary accent indistinguishable from destructive actions on first paint.
const DEFAULT_COMMUNITY_COLOR = '#007AFF';
const CommunityColorContext = createContext(DEFAULT_COMMUNITY_COLOR);

/**
 * Intentional design: the app's global primary/accent tint (useColors().primary)
 * is the VIEWER's own community color, not a fixed brand color. This is scoped
 * strictly to the logged-in viewer — a post's own community identity (e.g. the
 * text-post link button) is themed separately via getCommunityTheme(post.author),
 * independent of this context. Don't merge the two.
 */
export function CommunityColorProvider({ children }: { children: ReactNode }) {
  const { data } = useGetFeed();
  const communityColor = data?.viewer.communityColor || DEFAULT_COMMUNITY_COLOR;

  return (
    <CommunityColorContext.Provider value={communityColor}>
      {children}
    </CommunityColorContext.Provider>
  );
}

export function useCommunityColor() {
  return useContext(CommunityColorContext);
}