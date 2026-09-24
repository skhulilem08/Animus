import colors from '@/constants/colors';
import { useCommunityColor } from '@/context/CommunityColorContext';

function readableForeground(hex: string) {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return '#FFFFFF';
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.66 ? '#1C1C1E' : '#FFFFFF';
}

/**
 * Gimmi currently uses the light Apple system palette shown in the
 * approved visual reference on every supported platform.
 */
export function useColors() {
  const communityColor = useCommunityColor();
  const onCommunityColor = readableForeground(communityColor);

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
