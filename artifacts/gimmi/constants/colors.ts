/**
 * Semantic design tokens for the Gimmi mobile app, targeting strict Apple HIG style.
 */

const colors = {
  light: {
    text: '#000000',
    // Default/fallback tint only — components read the viewer's live community
    // color via useColors()/useCommunityColor(), not this value directly.
    // Kept as systemBlue (Apple's default tint) so it never collides with
    // `destructive`/`like`, which are reserved for systemRed semantics.
    tint: '#007AFF',
    background: '#FFFFFF',
    foreground: '#000000',
    card: '#FFFFFF',
    cardForeground: '#000000',
    primary: '#007AFF',
    primaryForeground: '#FFFFFF',
    secondary: '#F2F2F7',
    secondaryForeground: '#000000',
    muted: '#F2F2F7',
    mutedForeground: '#63636A',
    accent: '#007AFF',
    accentForeground: '#FFFFFF',
    like: '#FF3B30',
    destructive: '#FF3B30',
    destructiveForeground: '#FFFFFF',
    border: '#C6C6C8',
    input: '#F2F2F7',
    groupedBackground: '#F2F2F7',
  },
  dark: {
    text: '#FFFFFF',
    tint: '#0A84FF',
    background: '#000000',
    foreground: '#FFFFFF',
    card: '#1C1C1E',
    cardForeground: '#FFFFFF',
    primary: '#0A84FF',
    primaryForeground: '#FFFFFF',
    secondary: '#1C1C1E',
    secondaryForeground: '#FFFFFF',
    muted: '#1C1C1E',
    mutedForeground: '#98989D',
    accent: '#0A84FF',
    accentForeground: '#FFFFFF',
    like: '#FF453A',
    destructive: '#FF453A',
    destructiveForeground: '#FFFFFF',
    border: '#38383A',
    input: '#1C1C1E',
    groupedBackground: '#000000',
  },
  radius: 12,
};

export default colors;