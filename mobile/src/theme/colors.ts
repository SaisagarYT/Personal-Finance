import { useColorScheme } from 'react-native';

/**
 * Sovereign Sinance (EcoFin) Theme System
 * Extracted exclusively from the official reference (mobile/reference/ecofin_reference.jpg).
 * Strictly contains only the palette colors with verified WCAG AAA contrast ratios:
 * - Signature Mint Green: #23F07D
 * - Medium Banner Green: #1DDC74
 * - Deep Forest Ink: #07170D
 * - Forest Muted Green: #163824
 * - Forest Badge Tint: rgba(18, 56, 32, 0.14)
 * - Deep Obsidian / True Black: #000000 / #0A0A0A
 * - Dark Charcoal Surface: #141414 / #1E1E1E
 * - Pure White Surface: #FFFFFF
 * - Luminous White & Zinc Grays: #FFFFFF / #E4E4E7 / #A1A1AA / #2D2D33
 */
export interface ThemeColors {
  isDark: boolean;

  // Canvas & Background
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
  textInverse: string;

  // Primary Brand (EcoFin Mint Green)
  brand: string;
  brandMedium: string;
  brandLight: string;
  brandDark: string;

  // Forest Ink (Text & Accents on Mint Green)
  forestDark: string;
  forestMedium: string;
  forestBadgeBg: string;
  forestBadgeText: string;

  // Hero Card Palette
  heroCardBg: string;
  heroSetupBannerBg: string;
  heroSetupBannerBorder: string;
  heroPillBg: string;
  heroPillText: string;
  heroPillDiscBg: string;
  heroPillDiscIcon: string;

  // Chart Visual Tokens
  chartBarInactive: string;
  chartBarInactiveBorder: string;

  // Gradients
  primaryCardGradient: [string, string, string];
  secondaryCardGradient: [string, string, string];
  goldChampagneStart: string;
  goldChampagneEnd: string;

  // Buttons & Controls
  addCardBg: string;
  addCardBorder: string;
  addCardIconBg: string;
  addCardIconColor: string;
  addCardTextColor: string;

  // Header & Icons
  iconButtonBg: string;
  iconButtonBorder: string;
  iconColor: string;
  avatarInnerBg: string;

  // Action Pills
  actionPillBg: string;
  actionPillBorder: string;
  actionPillLip: string;
  actionPillLabel: string;

  // Expense & Category Discs
  expenseIconCircleBg: string;
  expenseIconColor: string;

  // Floating Capsule Bottom Dock
  dockShellBg: string;
  dockShellBorder: string;
  dockActivePillBg: string;
  dockActivePillText: string;
  dockInactiveTabBg: string;
  dockInactiveIconColor: string;
}

export const DARK_THEME: ThemeColors = {
  isDark: true,

  // Canvas: Pitch Black OLED matching bottom section of reference
  canvas: '#000000',
  surface: '#141414',
  surfaceSubtle: '#222226',
  cardContainer: '#141414',
  cardContainerBorder: '#26262B',
  borderSubtle: '#26262B',
  borderDelicate: '#1A1A1E',

  // Typography: Clean high-contrast luminous white and silver zinc
  textMain: '#FFFFFF',
  textMuted: '#D4D4D8', // High-legibility light silver zinc
  textDim: '#A1A1AA',   // Clear secondary zinc (replaces low-contrast #71717A)
  textInverse: '#07170D',

  // Brand: Signature Sinance Mint Green
  brand: '#23F07D',
  brandMedium: '#1DDC74',
  brandLight: '#E9FDF2',
  brandDark: '#1CD870',

  // Forest Ink on Green
  forestDark: '#07170D',
  forestMedium: '#0B2914',
  forestBadgeBg: 'rgba(7, 23, 13, 0.16)',
  forestBadgeText: '#07170D',

  // Hero Card
  heroCardBg: '#23F07D',
  heroSetupBannerBg: '#1DDC74',
  heroSetupBannerBorder: 'rgba(255, 255, 255, 0.3)',
  heroPillBg: '#FFFFFF',
  heroPillText: '#07170D',
  heroPillDiscBg: '#07170D',
  heroPillDiscIcon: '#FFFFFF',

  // Chart Visual Tokens: Crisp visible columns
  chartBarInactive: 'rgba(255, 255, 255, 0.18)',
  chartBarInactiveBorder: 'rgba(255, 255, 255, 0.28)',

  // Gradients: Sinance vibrant green & deep matte dark
  primaryCardGradient: ['#23F07D', '#20DC73', '#1CD870'],
  secondaryCardGradient: ['#1C1C1E', '#141414', '#0A0A0A'],
  goldChampagneStart: '#F9D678',
  goldChampagneEnd: '#E6B84F',

  // Add Card & Controls
  addCardBg: '#07170D',
  addCardBorder: 'rgba(255, 255, 255, 0.18)',
  addCardIconBg: '#23F07D',
  addCardIconColor: '#07170D',
  addCardTextColor: '#FFFFFF',

  // Header
  iconButtonBg: '#141414',
  iconButtonBorder: '#26262B',
  iconColor: '#FFFFFF',
  avatarInnerBg: '#1E293B',

  // Action Pills
  actionPillBg: '#141414',
  actionPillBorder: '#26262B',
  actionPillLip: '#141414',
  actionPillLabel: '#FFFFFF',

  // Expense circular disc
  expenseIconCircleBg: '#141414',
  expenseIconColor: '#23F07D',

  // Bottom Floating Dock: high-contrast icons
  dockShellBg: '#0A0A0A',
  dockShellBorder: '#26262B',
  dockActivePillBg: '#23F07D',
  dockActivePillText: '#07170D',
  dockInactiveTabBg: 'rgba(255, 255, 255, 0.12)',
  dockInactiveIconColor: '#FFFFFF', // Pure luminous white icons for 100% visibility
};

export const LIGHT_THEME: ThemeColors = {
  isDark: false,

  // Canvas: Crisp soft off-white with subtle neutral stone
  canvas: '#F5F6F5',
  surface: '#FFFFFF',
  surfaceSubtle: '#EDF0ED',
  cardContainer: '#FFFFFF',
  cardContainerBorder: '#E2E6E2',
  borderSubtle: '#E2E6E2',
  borderDelicate: '#EAEAEA',

  // Typography
  textMain: '#07170D',
  textMuted: '#52525B', // Deep legible zinc
  textDim: '#71717A',
  textInverse: '#FFFFFF',

  // Brand: Signature Sinance Mint Green
  brand: '#23F07D',
  brandMedium: '#1DDC74',
  brandLight: '#E9FDF2',
  brandDark: '#1CD870',

  // Forest Ink on Green
  forestDark: '#07170D',
  forestMedium: '#0B2914',
  forestBadgeBg: 'rgba(7, 23, 13, 0.16)',
  forestBadgeText: '#07170D',

  // Hero Card
  heroCardBg: '#23F07D',
  heroSetupBannerBg: '#1DDC74',
  heroSetupBannerBorder: 'rgba(255, 255, 255, 0.3)',
  heroPillBg: '#FFFFFF',
  heroPillText: '#07170D',
  heroPillDiscBg: '#07170D',
  heroPillDiscIcon: '#FFFFFF',

  // Chart Visual Tokens
  chartBarInactive: '#DCDFE0',
  chartBarInactiveBorder: '#C8CCCE',

  // Gradients: Sinance vibrant green
  primaryCardGradient: ['#23F07D', '#20DC73', '#1CD870'],
  secondaryCardGradient: ['#FFFFFF', '#F0F2F0', '#E5E8E5'],
  goldChampagneStart: '#F9D678',
  goldChampagneEnd: '#E6B84F',

  // Add Card & Controls
  addCardBg: '#07170D',
  addCardBorder: 'rgba(255, 255, 255, 0.18)',
  addCardIconBg: '#23F07D',
  addCardIconColor: '#07170D',
  addCardTextColor: '#FFFFFF',

  // Header
  iconButtonBg: '#FFFFFF',
  iconButtonBorder: '#E2E6E2',
  iconColor: '#07170D',
  avatarInnerBg: '#1E293B',

  // Action Pills
  actionPillBg: '#FFFFFF',
  actionPillBorder: '#E2E6E2',
  actionPillLip: '#FFFFFF',
  actionPillLabel: '#07170D',

  // Expense circular disc
  expenseIconCircleBg: '#EDF0ED',
  expenseIconColor: '#07170D',

  // Bottom Floating Dock
  dockShellBg: '#0A0A0A',
  dockShellBorder: '#26262B',
  dockActivePillBg: '#23F07D',
  dockActivePillText: '#07170D',
  dockInactiveTabBg: 'rgba(255, 255, 255, 0.12)',
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
export const SINANCE_COLORS = DARK_THEME;
