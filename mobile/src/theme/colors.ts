import { useColorScheme } from 'react-native';

export interface ThemeColors {
  isDark: boolean;
  canvas: string;
  surface: string;
  surfaceSubtle: string;
  cardContainer: string;
  cardContainerBorder: string;
  borderSubtle: string;
  borderDelicate: string;

  // Typography
  textMain: string;
  textMuted: string;
  textDim: string;

  // Brand Accents
  brand: string;
  brandLight: string;
  brandDark: string;

  // Metallic & Card Finishes
  goldChampagneStart: string;
  goldChampagneEnd: string;
  primaryCardGradient: [string, string, string];
  addCardBg: string;
  addCardBorder: string;
  addCardIconBg: string;
  addCardIconColor: string;
  addCardTextColor: string;

  // Header & Controls
  iconButtonBg: string;
  iconButtonBorder: string;
  iconColor: string;
  avatarInnerBg: string;

  // Action Pills
  actionPillBg: string;
  actionPillBorder: string;
  actionPillLip: string;
  actionPillLabel: string;

  // Expense Ledger
  expenseIconCircleBg: string;
  expenseIconColor: string;

  // Bottom Capsule Dock
  dockShellBg: string;
  dockShellBorder: string;
  dockActivePillBg: string;
  dockActivePillText: string;
  dockInactiveTabBg: string;
  dockInactiveIconColor: string;
}

export const LIGHT_THEME: ThemeColors = {
  isDark: false,
  canvas: '#F4F3EE', // Warm Stone canvas
  surface: '#FFFFFF',
  surfaceSubtle: '#FAFAF7',
  cardContainer: '#FFFFFF',
  cardContainerBorder: '#EAE9E2',
  borderSubtle: '#E7E6DF',
  borderDelicate: '#EAE9E4',

  textMain: '#141414',
  textMuted: '#8E8D88',
  textDim: '#9E9D97',

  brand: '#E74D28',
  brandLight: '#FDECE8',
  brandDark: '#D43E1B',

  goldChampagneStart: '#F9D678',
  goldChampagneEnd: '#E6B84F',
  // Royal purple gradient in both modes matching Johannes Solhaug reference
  primaryCardGradient: ['#A244E3', '#8328D4', '#5916A8'],
  addCardBg: '#0C0C0D',
  addCardBorder: 'rgba(255,255,255,0.1)',
  addCardIconBg: '#FFFFFF',
  addCardIconColor: '#000000',
  addCardTextColor: '#FFFFFF',

  iconButtonBg: '#FFFFFF',
  iconButtonBorder: '#E7E6DF',
  iconColor: '#141414',
  avatarInnerBg: '#1E1E22',

  // Soft circular disc matching reference (flat, no 3D bevels)
  actionPillBg: '#F0EFEA',
  actionPillBorder: '#ECEAE2',
  actionPillLip: '#F0EFEA',
  actionPillLabel: '#141414',

  // Expense circular disc matching action pill
  expenseIconCircleBg: '#F0EFEA',
  expenseIconColor: '#141414',

  dockShellBg: '#0C0C0D',
  dockShellBorder: '#1E1E22',
  dockActivePillBg: '#FFFFFF',
  dockActivePillText: '#0C0C0D',
  dockInactiveTabBg: 'rgba(255, 255, 255, 0.08)',
  dockInactiveIconColor: '#FFFFFF',
};

export const DARK_THEME: ThemeColors = {
  isDark: true,
  canvas: '#010101', // Pitch Black OLED
  surface: '#161616',
  surfaceSubtle: '#1C1C1E',
  cardContainer: '#161616', // Sampled directly from reference #161616
  cardContainerBorder: '#262628',
  borderSubtle: '#27272A',
  borderDelicate: '#1F1F23',

  textMain: '#FFFFFF', // Pure luminous white
  textMuted: '#A1A1AA', // Clean zinc gray
  textDim: '#71717A',

  brand: '#E74D28',
  brandLight: '#FDECE8',
  brandDark: '#D43E1B',

  goldChampagneStart: '#F5C544',
  goldChampagneEnd: '#DDA326',
  // Royal purple gradient in both modes matching Johannes Solhaug reference
  primaryCardGradient: ['#A244E3', '#8328D4', '#5916A8'],
  addCardBg: '#0C0C0D',
  addCardBorder: 'rgba(255,255,255,0.14)',
  addCardIconBg: '#FFFFFF',
  addCardIconColor: '#000000',
  addCardTextColor: '#FFFFFF',

  iconButtonBg: '#161616',
  iconButtonBorder: '#27272A',
  iconColor: '#FFFFFF',
  avatarInnerBg: '#27272A',

  // Soft dark circular disc matching reference (flat, no 3D bevels)
  actionPillBg: '#08080A',
  actionPillBorder: '#1E1E22',
  actionPillLip: '#08080A',
  actionPillLabel: '#FFFFFF',

  // Expense circular disc matching action pill
  expenseIconCircleBg: '#08080A',
  expenseIconColor: '#FFFFFF',

  dockShellBg: '#0C0C0D',
  dockShellBorder: '#242426',
  dockActivePillBg: '#FFFFFF',
  dockActivePillText: '#0C0C0D',
  dockInactiveTabBg: 'rgba(255, 255, 255, 0.09)',
  dockInactiveIconColor: '#FFFFFF',
};

/**
 * Reactive theme hook that detects device/OS color scheme
 */
export function useAppTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

// Static default export for compatibility
export const SINANCE_COLORS = LIGHT_THEME;
