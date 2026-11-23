import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Animated,
  Share,
  TextInput,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  QrCode,
  ChevronDown,
  Search,
  KeyRound,
  Lock,
  CreditCard,
  Bell,
  Languages,
  IndianRupee,
  DollarSign,
  SunMoon,
  Eye,
  EyeOff,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Share2,
  LogOut,
  User,
  Sparkles,
  Check,
  CircleHelp,
  Database,
  Smartphone,
  Bot,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAppTheme } from '../theme/colors';
import { StatusSymbol } from '../components/StatusSymbol';
import { UserProfile } from '../services/profileService';
import { EditProfileScreen } from './EditProfileScreen';

export interface ProfileScreenProps {
  onBack: () => void;
  currency?: 'INR' | 'USD';
  onToggleCurrency?: (currency: 'INR' | 'USD') => void;
  isSetupDismissed?: boolean;
  onToggleSetupDismissed?: () => void;
  onOpenAuth?: () => void;
  animProgress?: Animated.Value;
  isAvatarHidden?: boolean;
  userProfile?: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  currency = 'INR',
  onToggleCurrency,
  isSetupDismissed = false,
  onToggleSetupDismissed,
  onOpenAuth,
  animProgress,
  isAvatarHidden = false,
  userProfile,
  onProfileUpdated,
}) => {
  const theme = useAppTheme();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  const handleExportCSV = () => {
    showToast({
      title: 'Ledger exported successfully!',
      description: 'Records saved to your device download storage (CSV)',
      type: 'success',
      actionLabel: 'Got It!',
    });
  };

  const handleInviteFriend = async () => {
    try {
      await Share.share({
        message: 'Join me on Sinance — the premium personal finance ledger app: https://sinance.app',
      });
    } catch {
      // User cancelled
    }
  };

  const displayName = userProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sagar';
  const displayEmail = userProfile?.email || user?.email || 'sagar@sinance.app';
  const displayAbout = userProfile?.bio || 'Personal finance enthusiast & investor';
  const avatarUri = userProfile?.avatarUri;
  const isCloudSynced = !!user;

  // Premium Hero Transition Interpolations (Shared Element)
  const avatarScale = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [44 / 58, 1],
      })
    : 1;

  const avatarTranslateX = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
      })
    : 0;

  const heroDetailsOpacity = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0, 0.6, 1],
      })
    : 1;

  const heroDetailsTranslateX = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 0],
      })
    : 0;

  // WhatsApp Sub-Screen: Full Edit Profile Screen
  if (isEditProfileOpen) {
    return (
      <EditProfileScreen
        onBack={() => setIsEditProfileOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={(updated) => onProfileUpdated?.(updated)}
        userId={user?.id}
      />
    );
  }

  // Filter helper for search bar
  const query = searchQuery.trim().toLowerCase();
  const matches = (text: string, subtitle?: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query) || (subtitle && subtitle.toLowerCase().includes(query));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      {/* ================= 1. WHATSAPP SETTINGS TOP APP BAR ================= */}
      <View style={[styles.topBar, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={22} color={theme.textMain} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.textMain }]}>Settings</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 2. WHATSAPP SEARCH BAR ================= */}
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Search size={18} color={theme.textDim} strokeWidth={2.2} />
          <TextInput
            placeholder="Search settings"
            placeholderTextColor={theme.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.textMain }]}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {/* ================= 3. WHATSAPP HERO PROFILE BANNER CARD ================= */}
        {(!query || matches(displayName, displayAbout)) && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsEditProfileOpen(true)}
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {/* 58px Circular Avatar with Subtle Ring */}
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  borderColor: theme.borderSubtle,
                  backgroundColor: theme.surfaceSubtle,
                  opacity: isAvatarHidden ? 0 : 1,
                  transform: [
                    { scale: avatarScale },
                    { translateX: avatarTranslateX },
                  ],
                },
              ]}
            >
              <Image
                source={avatarUri ? { uri: avatarUri } : require('../../assets/esther_avatar.png')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </Animated.View>

            {/* User Name & About Status */}
            <Animated.View
              style={[
                styles.heroTextContainer,
                {
                  opacity: heroDetailsOpacity,
                  transform: [{ translateX: heroDetailsTranslateX }],
                },
              ]}
            >
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.textMain }]} numberOfLines={1}>
                  {displayName}
                </Text>
              </View>
              <Text style={[styles.userAboutText, { color: theme.textDim }]} numberOfLines={1}>
                {displayAbout}
              </Text>
            </Animated.View>

            {/* WhatsApp Right Action Cluster: QR Code + Account Switcher Arrow */}
            <View style={styles.heroRightActions}>
              <View
                style={[
                  styles.qrBadge,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <QrCode
                  size={19}
                  color={theme.isDark ? theme.brand : theme.forestDark}
                  strokeWidth={2.2}
                />
              </View>
              <View
                style={[
                  styles.switchArrowBadge,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <ChevronDown size={17} color={theme.textDim} strokeWidth={2.2} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ================= 4. WHATSAPP AI ASSISTANT / SINANCE BRAIN CARD ================= */}
        {(!query || matches('Sinance Brain', 'AI Financial Copilot & Smart Insights')) && (
          <View
            style={[
              styles.aiCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.settingRow}
              onPress={() => {
                showToast({
                  title: 'Sinance Brain Copilot is active',
                  description: 'AI model is constantly analyzing anomalies and budget tips',
                  type: 'success',
                  actionLabel: 'Got It!',
                });
              }}
            >
              <View style={styles.settingRowLeft}>
                <View
                  style={[
                    styles.iconDisc,
                    {
                      backgroundColor: theme.surfaceSubtle,
                    },
                  ]}
                >
                  <Bot
                    size={19}
                    color={theme.textMain}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.textStack}>
                  <View style={styles.aiLabelRow}>
                    <Text style={[styles.settingTitle, { color: theme.textMain }]}>Sinance Brain</Text>
                    <View
                      style={[
                        styles.aiPillBadge,
                        {
                          backgroundColor: theme.isDark ? 'rgba(35, 240, 125, 0.2)' : 'rgba(16, 185, 129, 0.18)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.aiPillText,
                          { color: theme.isDark ? theme.brand : '#059669' },
                        ]}
                      >
                        AI
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                    Copilot insights, anomaly detection & smart tags
                  </Text>
                </View>
              </View>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 5. SECTION 1: ACCOUNT & SECURITY ================= */}
        {(matches('Account', 'Security, passkeys, cloud sync') ||
          matches('Privacy', 'Screen lock, biometric, hide balance') ||
          matches('Linked Wallets & Cards', 'Bank accounts, credit cards, UPI')) && (
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {/* Account */}
            {matches('Account', 'Security, passkeys, cloud sync') && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditProfileOpen(true)}
                style={styles.settingRow}
              >
                <View style={styles.settingRowLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <KeyRound size={18} color={theme.textMain} strokeWidth={2} />
                  </View>
                  <View style={styles.textStack}>
                    <Text style={[styles.settingTitle, { color: theme.textMain }]}>Account</Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                      Security notifications, passkeys, email
                    </Text>
                  </View>
                </View>
                <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
              </TouchableOpacity>
            )}

            {matches('Privacy', 'Screen lock, biometric, hide balance') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                {/* Privacy */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <Lock size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Privacy</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Biometric lock, hide net worth balance
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                </TouchableOpacity>
              </>
            )}

            {matches('Linked Wallets & Cards', 'Bank accounts, credit cards, UPI') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                {/* Linked Wallets & Cards */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <CreditCard size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Linked Wallets & Cards</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Payment methods, bank sync & UPI
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ================= 6. SECTION 2: PREFERENCES & CHATS ================= */}
        {(matches('Notifications', 'Budget alerts, transaction reminders') ||
          matches('Primary Currency', 'INR or USD currency') ||
          matches('Theme', 'Dark or Light appearance') ||
          matches('Home Checklist', 'Quickstart guide visibility') ||
          matches('Storage & Data', 'Network usage, CSV ledger export') ||
          matches('App Language', 'English')) && (
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {/* Notifications */}
            {matches('Notifications', 'Budget alerts, transaction reminders') && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.settingRow}
              >
                <View style={styles.settingRowLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Bell size={18} color={theme.textMain} strokeWidth={2} />
                  </View>
                  <View style={styles.textStack}>
                    <Text style={[styles.settingTitle, { color: theme.textMain }]}>Notifications</Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                      Budget alerts, bill tones & reminders
                    </Text>
                  </View>
                </View>
                <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
              </TouchableOpacity>
            )}

            {/* Primary Currency */}
            {matches('Primary Currency', 'INR or USD currency') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onToggleCurrency?.(currency === 'INR' ? 'USD' : 'INR')}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      {currency === 'INR' ? (
                        <IndianRupee size={18} color={theme.textMain} strokeWidth={2} />
                      ) : (
                        <DollarSign size={18} color={theme.textMain} strokeWidth={2} />
                      )}
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Currency</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Default ledger accounting unit
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRowRight}>
                    <Text style={[styles.settingValueText, { color: theme.textMain, fontWeight: '700' }]}>
                      {currency === 'INR' ? '₹ INR' : '$ USD'}
                    </Text>
                    <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Storage & Data */}
            {matches('Storage & Data', 'Network usage, CSV ledger export') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleExportCSV}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <Database size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Storage and Data</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Cache, export CSV & backup history
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRowRight}>
                    <Text style={[styles.settingValueText, { color: theme.textDim }]}>CSV</Text>
                    <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* App Language */}
            {matches('App Language', 'English') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <Languages size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>App Language</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Device default
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRowRight}>
                    <Text style={[styles.settingValueText, { color: theme.textDim }]}>English</Text>
                    <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Theme */}
            {matches('Theme', 'Dark or Light appearance') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <SunMoon size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Theme</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Display mode & contrast
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRowRight}>
                    <Text style={[styles.settingValueText, { color: theme.textDim }]}>
                      {theme.isDark ? 'Dark' : 'Light'}
                    </Text>
                    <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Home Setup Checklist */}
            {matches('Home Checklist', 'Quickstart guide visibility') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onToggleSetupDismissed}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      {isSetupDismissed ? (
                        <EyeOff size={18} color={theme.textDim} strokeWidth={2} />
                      ) : (
                        <Eye size={18} color={theme.textMain} strokeWidth={2} />
                      )}
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Home Checklist</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Quickstart onboarding widget
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRowRight}>
                    <Text
                      style={[
                        styles.settingValueText,
                        {
                          color: isSetupDismissed
                            ? theme.textDim
                            : (theme.isDark ? theme.brand : '#10B981'),
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {isSetupDismissed ? 'Hidden' : 'Visible'}
                    </Text>
                    <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ================= 7. SECTION 3: HELP & SUPPORT ================= */}
        {(matches('Help', 'Help center, contact us, privacy policy') ||
          matches('Encryption', 'End-to-end cloud protection') ||
          matches('Invite a Friend', 'Share Sinance with family or friends')) && (
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {/* Help Center */}
            {matches('Help', 'Help center, contact us, privacy policy') && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.settingRow}
              >
                <View style={styles.settingRowLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <CircleHelp size={18} color={theme.textMain} strokeWidth={2} />
                  </View>
                  <View style={styles.textStack}>
                    <Text style={[styles.settingTitle, { color: theme.textMain }]}>Help</Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                      Help center, contact us, privacy policy
                    </Text>
                  </View>
                </View>
                <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
              </TouchableOpacity>
            )}

            {/* Encryption Note */}
            {matches('Encryption', 'End-to-end cloud protection') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <ShieldCheck size={18} color={theme.isDark ? theme.brand : '#059669'} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Encryption</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        End-to-end protected with AES-256
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.settingValueText, { color: theme.textDim, fontWeight: '600' }]}>
                    AES-256
                  </Text>
                </View>
              </>
            )}

            {/* Invite a Friend */}
            {matches('Invite a Friend', 'Share Sinance with family or friends') && (
              <>
                <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleInviteFriend}
                  style={styles.settingRow}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                      <Share2 size={18} color={theme.textMain} strokeWidth={2} />
                    </View>
                    <View style={styles.textStack}>
                      <Text style={[styles.settingTitle, { color: theme.textMain }]}>Invite a Friend</Text>
                      <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                        Share Sinance with family or friends
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ================= 8. SECTION 4: AUTH & ACCOUNT ACTION ================= */}
        {(!query || matches('Sign Out') || matches('Sign In')) && (
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {user ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSignOut}
                style={styles.settingRow}
              >
                <View style={styles.settingRowLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.isDark ? '#3E1A1A' : '#FEE2E2' }]}>
                    <LogOut size={18} color="#EF4444" strokeWidth={2} />
                  </View>
                  <View style={styles.textStack}>
                    <Text style={[styles.settingTitle, { color: '#EF4444', fontWeight: '700' }]}>
                      Sign Out
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                      {displayEmail}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={17} color="#EF4444" strokeWidth={2.2} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onBack();
                  onOpenAuth?.();
                }}
                style={styles.settingRow}
              >
                <View style={styles.settingRowLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <User
                      size={18}
                      color={theme.isDark ? theme.brand : '#059669'}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.textStack}>
                    <Text
                      style={[
                        styles.settingTitle,
                        {
                          color: theme.isDark ? theme.brand : '#059669',
                          fontWeight: '700',
                        },
                      ]}
                    >
                      Sign In / Connect Supabase
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>
                      Sync your ledger safely to the cloud
                    </Text>
                  </View>
                </View>
                <ChevronRight
                  size={17}
                  color={theme.isDark ? theme.brand : '#059669'}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ================= 9. META-STYLE FOOTER BRANDING ================= */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerFromText, { color: theme.textDim }]}>from</Text>
          <View style={styles.footerBrandRow}>
            <StatusSymbol size={13} color={theme.isDark ? theme.brand : '#059669'} strokeWidth={2.4} />
            <Text style={[styles.footerBrandName, { color: theme.textMain }]}>Sinance</Text>
          </View>
        </View>

        {/* Spacing for bottom */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  topBarSpacer: {
    width: 38,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  toastBanner: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBarContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  heroCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 14,
  },
  avatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroTextContainer: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userAboutText: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchArrowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCard: {
    alignSelf: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  aiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupedCard: {
    alignSelf: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconDisc: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStack: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingSubtitle: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValueText: {
    fontSize: 13,
  },
  rowDivider: {
    height: 1,
    marginLeft: 52,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 2,
  },
  footerFromText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerBrandName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
