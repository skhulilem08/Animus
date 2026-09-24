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

const themes: Record<string, CommunityTheme> = {
  ladybug: { primary: '#FF3B30', soft: '#FFE5E3', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  turtle: { primary: '#34C759', soft: '#E1F7E7', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  cat: { primary: '#18251E', soft: '#E5ECE7', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  dragon: { primary: '#FF453A', soft: '#FFE6E4', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  fox: { primary: '#FF9500', soft: '#FFF0D6', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  pig: { primary: '#FF2D55', soft: '#FFE4EA', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  horse: { primary: '#8E5A3C', soft: '#F0E5DE', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  ox: { primary: '#007AFF', soft: '#E1F0FF', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  tiger: { primary: '#AF52DE', soft: '#F2E5FA', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  snake: { primary: '#14B8A6', soft: '#DDF7F3', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  rooster: { primary: '#D70015', soft: '#FFE1E4', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  ghost: { primary: '#1C1C1E', soft: '#F2F2F7', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  bunny: { primary: '#64D2FF', soft: '#E3F7FF', foreground: '#1C1C1E', onPrimary: '#1C1C1E' },
  dog: { primary: '#C56A2D', soft: '#F5E7DD', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  butterfly: { primary: '#BF5AF2', soft: '#F3E5FC', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
  peacock: { primary: '#0A3D62', soft: '#E0EBF3', foreground: '#1C1C1E', onPrimary: '#FFFFFF' },
};

const keyFor = (input: CommunityThemeInput) => {
  const source = `${input.slug || ''} ${input.name || ''}`.toLowerCase();
  return Object.keys(themes).find((key) => source.includes(key));
};

function blendWith(color: string, target: number, colorWeight: number): string {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(color.slice(offset, offset + 2), 16);
    return Math.round(channel * colorWeight + target * (1 - colorWeight))
      .toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

export function getCommunityTheme(input: CommunityThemeInput = {}): CommunityTheme {
  const key = keyFor(input);
  if (key) return themes[key];

  const primary = input.color && /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#007AFF';
  return {
    primary,
    soft: blendWith(primary, 255, 0.16),
    foreground: blendWith(primary, 0, 0.52),
    onPrimary: '#FFFFFF',
  };
}