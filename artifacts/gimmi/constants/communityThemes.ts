export type CommunityThemeInput = {
  name?: string;
  slug?: string;
  color?: string;
};

export type CommunityTheme = {
  primary: string;
  soft: string;
  foreground: string;
  onPrimary: string;
};

function blendWith(color: string, target: number, colorWeight: number): string {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(color.slice(offset, offset + 2), 16);
    return Math.round(channel * colorWeight + target * (1 - colorWeight))
      .toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

export function readableCommunityForeground(color: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return '#FFFFFF';
  const channels = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(color.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.205 ? '#1C1C1E' : '#FFFFFF';
}

export function getCommunityTheme(input: CommunityThemeInput = {}): CommunityTheme {
  const primary = input.color && /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#007AFF';
  return {
    primary,
    soft: blendWith(primary, 255, 0.16),
    foreground: blendWith(primary, 0, 0.52),
    onPrimary: readableCommunityForeground(primary),
  };
}