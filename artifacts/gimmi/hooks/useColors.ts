import colors from '@/constants/colors';
import { useCommunityColor } from '@/context/CommunityColorContext';
import { readableCommunityForeground } from '@/constants/communityThemes';

/**
 * Gimmi currently uses the light Apple system palette shown in the
 * approved visual reference on every supported platform.
 */
export function useColors() {
  const communityColor = useCommunityColor();
  const onCommunityColor = readableCommunityForeground(communityColor);

  return {
    ...colors.light,
    tint: communityColor,
    primary: communityColor,
    accent: communityColor,
    primaryForeground: onCommunityColor,
    accentForeground: onCommunityColor,
    radius: colors.radius,
  };
}
