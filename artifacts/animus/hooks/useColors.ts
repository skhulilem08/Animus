import colors from '@/constants/colors';

/**
 * Gimmi currently uses the light Apple system palette shown in the
 * approved visual reference on every supported platform.
 */
export function useColors() {
  return { ...colors.light, radius: colors.radius };
}
