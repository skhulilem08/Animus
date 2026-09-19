/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // iOS system-color semantics keep controls predictable; communities add
    // their own primary/soft colors at the component level.
    text: '#1C1C1E',
    tint: '#007AFF',
    background: '#F2F2F7',
    foreground: '#1C1C1E',
    card: '#FFFFFF',
    cardForeground: '#1C1C1E',
    primary: '#007AFF',
    primaryForeground: '#FFFFFF',
    secondary: '#E5E5EA',
    secondaryForeground: '#1C1C1E',
    muted: '#E5E5EA',
    mutedForeground: '#6C6C70',
    accent: '#D1D1D6',
    accentForeground: '#1C1C1E',
    destructive: '#FF3B30',
    destructiveForeground: '#FFFFFF',
    border: '#C6C6C8',
    input: '#D1D1D6',
  },
  dark: {
    text: '#F2F2F7',
    tint: '#0A84FF',
    background: '#000000',
    foreground: '#F2F2F7',
    card: '#1C1C1E',
    cardForeground: '#F2F2F7',
    primary: '#0A84FF',
    primaryForeground: '#FFFFFF',
    secondary: '#2C2C2E',
    secondaryForeground: '#F2F2F7',
    muted: '#2C2C2E',
    mutedForeground: '#98989D',
    accent: '#48484A',
    accentForeground: '#F2F2F7',
    destructive: '#FF453A',
    destructiveForeground: '#FFFFFF',
    border: '#38383A',
    input: '#48484A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 12,
};

export default colors;
