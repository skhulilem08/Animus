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
    // Animus is a warm paper + ink palette with a decisive saffron signal.
    text: '#17221f',
    tint: '#d78238',
    background: '#f7f2e9',
    foreground: '#17221f',
    card: '#fffaf1',
    cardForeground: '#17221f',
    primary: '#d78238',
    primaryForeground: '#fffaf1',
    secondary: '#e5eee8',
    secondaryForeground: '#29483f',
    muted: '#eee8dd',
    mutedForeground: '#6f7972',
    accent: '#b7d6c8',
    accentForeground: '#29483f',
    destructive: '#b9574f',
    destructiveForeground: '#fffaf1',
    border: '#ddd7ca',
    input: '#d3cec2',
  },
  dark: {
    text: '#f5f0e6',
    tint: '#e5a05c',
    background: '#17221f',
    foreground: '#f5f0e6',
    card: '#22312c',
    cardForeground: '#f5f0e6',
    primary: '#e5a05c',
    primaryForeground: '#17221f',
    secondary: '#2a4038',
    secondaryForeground: '#dcebe2',
    muted: '#26332f',
    mutedForeground: '#aebdb5',
    accent: '#39594d',
    accentForeground: '#e3f0e7',
    destructive: '#d27167',
    destructiveForeground: '#17221f',
    border: '#354740',
    input: '#44564d',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
