import React, { createContext, ReactNode, useContext } from 'react';
import { useGetFeed } from '@workspace/api-client-react';

const DEFAULT_COMMUNITY_COLOR = '#FF3B30';
const CommunityColorContext = createContext(DEFAULT_COMMUNITY_COLOR);

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