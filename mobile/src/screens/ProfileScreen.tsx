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
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Lock,
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
  LogOut,
  User,
  Sparkles,
  Check,
  Edit2,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/colors';
import { UserProfile } from '../services/profileService';
import { EditProfileModal } from '../components/EditProfileModal';

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
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  const handleExportCSV = () => {
    setExportNotice('Ledger records exported to download storage (CSV)');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const displayName = userProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sagar';
  const displayEmail = userProfile?.email || user?.email || 'sagar@sinance.app';
  const avatarUri = userProfile?.avatarUri;
  const isCloudSynced = !!user;

  // Premium Hero Transition Interpolations (Option C)
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

  const sectionsOpacity = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 0.25, 1],
        outputRange: [0, 0.5, 1],
      })
    : 1;

  const sectionsTranslateY = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
      })
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      {/* Top Header Row with Back Button */}
      <View style={styles.topBar}>
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
          <ChevronLeft size={22} color={theme.textMain} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO PROFILE CARD ================= */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsEditProfileModalOpen(true)}
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

          {/* User Name & Email - smoothly reveals */}
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
                <Sparkles size={11} color={theme.isDark ? '#23F07D' : '#10B981'} />
                <Text style={[styles.tierBadgeText, { color: theme.textDim }]}>
                  {isCloudSynced ? 'Pro Cloud' : 'Free Tier'}
                </Text>
              </View>
            </View>
            <Text style={[styles.userEmail, { color: theme.textDim }]}>
              {displayEmail}
            </Text>
          </Animated.View>

          {/* Edit icon indicator */}
          <View style={[styles.editPill, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
            <Edit2 size={13} color={theme.textDim} />
          </View>
        </TouchableOpacity>

        {/* Notice Toast Banner */}
        {exportNotice && (
          <View
            style={[
              styles.toastBanner,
              {
                backgroundColor: theme.isDark ? 'rgba(35, 240, 125, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                borderColor: theme.isDark ? '#23F07D' : '#10B981',
              },
            ]}
          >
            <Check size={14} color={theme.isDark ? '#23F07D' : '#10B981'} strokeWidth={2.5} />
            <Text
              style={[
                styles.toastText,
                { color: theme.isDark ? '#23F07D' : '#059669' },
              ]}
            >
              {exportNotice}
            </Text>
          </View>
        )}

        {/* ================= SECTION 1: ACCOUNT ================= */}
        <Text style={[styles.sectionHeaderLabel, { color: theme.textDim }]}>Account</Text>
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Row 1: Manage Profile */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsEditProfileModalOpen(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <CircleUser size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Manage Profile
              </Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 2: Password & Security */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <Lock size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Password & Security
              </Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 3: Notifications */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <Bell size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Notifications
              </Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 4: Language */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <Languages size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Language
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>English</Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 2: PREFERENCES ================= */}
        <Text style={[styles.sectionHeaderLabel, { color: theme.textDim }]}>Preferences</Text>
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Row 1: Primary Currency */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggleCurrency?.(currency === 'INR' ? 'USD' : 'INR')}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              {currency === 'INR' ? (
                <IndianRupee size={19} color={theme.textMain} strokeWidth={1.9} />
              ) : (
                <DollarSign size={19} color={theme.textMain} strokeWidth={1.9} />
              )}
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Primary Currency
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textMain, fontWeight: '700' }]}>
                {currency === 'INR' ? '₹ INR' : '$ USD'}
              </Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 2: Theme */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <SunMoon size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Theme
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>
                {theme.isDark ? 'Dark' : 'Light'}
              </Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 3: Home Setup Checklist */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleSetupDismissed}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              {isSetupDismissed ? (
                <EyeOff size={19} color={theme.textDim} strokeWidth={1.9} />
              ) : (
                <Eye size={19} color={theme.textMain} strokeWidth={1.9} />
              )}
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Home Setup Checklist
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text
                style={[
                  styles.settingValueText,
                  {
                    color: isSetupDismissed
                      ? theme.textDim
                      : (theme.isDark ? '#23F07D' : '#10B981'),
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

          {/* Row 4: Export Transactions */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <FileSpreadsheet size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Export Transactions
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>CSV</Text>
              <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 3: SUPPORT & CLOUD ================= */}
        <Text style={[styles.sectionHeaderLabel, { color: theme.textDim }]}>Support</Text>
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Row 1: Help Center */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingRowLeft}>
              <HelpCircle size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Help Center
              </Text>
            </View>
            <ChevronRight size={17} color={theme.textDim} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 2: Security & RLS Note */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <ShieldCheck size={19} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                Security & Encryption
              </Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={[styles.settingValueText, { color: theme.textDim }]}>AES-256</Text>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 3: Sign In or Sign Out */}
          {user ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignOut}
              style={styles.settingRow}
            >
              <View style={styles.settingRowLeft}>
                <LogOut size={19} color="#EF4444" strokeWidth={1.9} />
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
                <User
                  size={19}
                  color={theme.isDark ? '#23F07D' : '#10B981'}
                  strokeWidth={1.9}
                />
                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color: theme.isDark ? '#23F07D' : '#10B981',
                      fontWeight: '700',
                    },
                  ]}
                >
                  Sign In / Connect Supabase
                </Text>
              </View>
              <ChevronRight
                size={17}
                color={theme.isDark ? '#23F07D' : '#10B981'}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Spacing for bottom */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Edit Profile & Avatar Cropping Modal */}
      <EditProfileModal
        visible={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onProfileUpdated={(updated) => onProfileUpdated?.(updated)}
        userId={user?.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  editPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  heroCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 24,
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
    fontSize: 18,
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
    fontSize: 10.5,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  toastBanner: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderLabel: {
    alignSelf: 'stretch',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  groupedCard: {
    alignSelf: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
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
    width: '100%',
  },
});
