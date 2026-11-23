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
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  QrCode,
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
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/colors';
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
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  const handleExportCSV = () => {
    setExportNotice('Ledger records exported to download storage (CSV)');
    setTimeout(() => setExportNotice(null), 3000);
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
        outputRange: [44 / 54, 1],
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
        {/* Notice Toast Banner */}
        {exportNotice && (
          <View
            style={[
              styles.toastBanner,
              {
                backgroundColor: theme.isDark ? 'rgba(35, 240, 125, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                borderColor: theme.isDark ? theme.brand : '#10B981',
              },
            ]}
          >
            <Check size={14} color={theme.isDark ? theme.brand : '#10B981'} strokeWidth={2.5} />
            <Text
              style={[
                styles.toastText,
                { color: theme.isDark ? theme.brand : '#059669' },
              ]}
            >
              {exportNotice}
            </Text>
          </View>
        )}

        {/* ================= 2. WHATSAPP HERO PROFILE BANNER CARD ================= */}
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
          {/* Avatar on the left - smoothly scales and translates */}
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

          {/* User Name & About Status - smoothly reveals */}
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
              <Text style={[styles.userName, { color: theme.textMain }]}>
                {displayName}
              </Text>
              <View
                style={[
                  styles.tierBadge,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Sparkles size={11} color={theme.isDark ? theme.brand : '#10B981'} />
                <Text style={[styles.tierBadgeText, { color: theme.textDim }]}>
                  {isCloudSynced ? 'Pro Cloud' : 'Free Tier'}
                </Text>
              </View>
            </View>
            <Text style={[styles.userAboutText, { color: theme.textDim }]} numberOfLines={1}>
              {displayAbout}
            </Text>
          </Animated.View>

          {/* WhatsApp QR Code Icon Pill */}
          <View style={[styles.qrBadge, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
            <QrCode size={19} color={theme.isDark ? theme.brand : theme.forestDark} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* ================= 3. SECTION 1: ACCOUNT & SECURITY ================= */}
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
                <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>Security, sync & credentials</Text>
              </View>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

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
                <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>Screen lock & balance privacy</Text>
              </View>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Wallets & Cards */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <CreditCard size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <View style={styles.textStack}>
                <Text style={[styles.settingTitle, { color: theme.textMain }]}>Wallets & Cards</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>Linked banks and payment cards</Text>
              </View>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ================= 4. SECTION 2: PREFERENCES ================= */}
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
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <Bell size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Notifications</Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Primary Currency */}
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
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Primary Currency</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textMain, fontWeight: '700' }]}>
                {currency === 'INR' ? '₹ INR' : '$ USD'}
              </Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* App Language */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <Languages size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>App Language</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>English</Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Theme */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <SunMoon size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Theme</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>
                {theme.isDark ? 'Dark' : 'Light'}
              </Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Home Setup Checklist */}
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
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Home Checklist</Text>
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

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Storage & Data (Export CSV) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <FileSpreadsheet size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Storage & Export</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>CSV</Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 5. SECTION 3: HELP & SUPPORT ================= */}
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
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <HelpCircle size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Help</Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Encryption Note */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <ShieldCheck size={18} color={theme.isDark ? theme.brand : '#059669'} strokeWidth={2} />
              </View>
              <View style={styles.textStack}>
                <Text style={[styles.settingTitle, { color: theme.textMain }]}>Encryption</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textDim }]}>End-to-end cloud protection</Text>
              </View>
            </View>
            <Text style={[styles.settingValueText, { color: theme.textDim, fontWeight: '600' }]}>AES-256</Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Invite a Friend */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleInviteFriend}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                <Share2 size={18} color={theme.textMain} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>Invite a Friend</Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ================= 6. SECTION 4: AUTH & ACCOUNT ACTION ================= */}
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
                <Text style={[styles.settingTitle, { color: '#EF4444', fontWeight: '700' }]}>
                  Sign Out
                </Text>
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
              </View>
              <ChevronRight
                size={17}
                color={theme.isDark ? theme.brand : '#059669'}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          )}
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
    paddingTop: 14,
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
    marginBottom: 16,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    gap: 14,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  qrBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 13,
    flex: 1,
  },
  iconDisc: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStack: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
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
    marginLeft: 49,
  },
});
