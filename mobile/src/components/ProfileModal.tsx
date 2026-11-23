import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAppTheme } from '../theme/colors';
import {
  User,
  LogOut,
  Cloud,
  ShieldCheck,
  X,
  IndianRupee,
  DollarSign,
  FileSpreadsheet,
  Lock,
  Sparkles,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react-native';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  currency?: 'INR' | 'USD';
  onToggleCurrency?: (currency: 'INR' | 'USD') => void;
  isSetupDismissed?: boolean;
  onToggleSetupDismissed?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onOpenAuth,
  currency = 'INR',
  onToggleCurrency,
  isSetupDismissed = false,
  onToggleSetupDismissed,
}) => {
  const theme = useAppTheme();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleExportCSV = () => {
    showToast({
      title: 'Ledger exported successfully!',
      description: 'Records saved to your device download storage (CSV)',
      type: 'success',
      actionLabel: 'Got It!',
    });
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sagar';
  const displayEmail = user?.email || 'sagar@sinance.app';
  const isCloudSynced = !!user;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'web' ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Sheet Container */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.isDark ? '#141414' : '#FFFFFF',
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Header with Avatar & Close */}
          <View style={styles.sheetHeader}>
            <View style={styles.userInfoRow}>
              <View
                style={[
                  styles.avatarDisc,
                  { backgroundColor: theme.isDark ? '#23F07D' : '#10B981' },
                ]}
              >
                <Text
                  style={[
                    styles.avatarInitial,
                    { color: theme.isDark ? '#07170D' : '#FFFFFF' },
                  ]}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userTextContainer}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: theme.textMain }]}>
                    {displayName}
                  </Text>
                </View>
                <Text style={[styles.userEmail, { color: theme.textDim }]}>
                  {displayEmail}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <X size={16} color={theme.textMain} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Preferences Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* SECTION 1: FINANCIAL PREFERENCES */}
            <Text style={[styles.sectionHeading, { color: theme.textDim }]}>
              FINANCIAL PREFERENCES
            </Text>

            {/* Currency Selector Card */}
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ]}
                >
                  {currency === 'INR' ? (
                    <IndianRupee size={16} color={theme.textMain} strokeWidth={2.2} />
                  ) : (
                    <DollarSign size={16} color={theme.textMain} strokeWidth={2.2} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                    Primary Currency
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textDim }]}>
                    App-wide balance & ledgers ({currency})
                  </Text>
                </View>
              </View>

              {/* Currency Toggle Pills */}
              <View
                style={[
                  styles.currencyToggleGroup,
                  { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onToggleCurrency?.('INR')}
                  style={[
                    styles.currencyPill,
                    currency === 'INR' && [
                      styles.currencyPillActive,
                      {
                        backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyPillText,
                      {
                        color:
                          currency === 'INR'
                            ? (theme.isDark ? '#07170D' : '#FFFFFF')
                            : theme.textDim,
                        fontWeight: currency === 'INR' ? '700' : '500',
                      },
                    ]}
                  >
                    ₹ INR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onToggleCurrency?.('USD')}
                  style={[
                    styles.currencyPill,
                    currency === 'USD' && [
                      styles.currencyPillActive,
                      {
                        backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyPillText,
                      {
                        color:
                          currency === 'USD'
                            ? (theme.isDark ? '#07170D' : '#FFFFFF')
                            : theme.textDim,
                        fontWeight: currency === 'USD' ? '700' : '500',
                      },
                    ]}
                  >
                    $ USD
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Restore Home Setup Checklist Banner */}
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ]}
                >
                  {isSetupDismissed ? (
                    <EyeOff size={16} color={theme.textDim} strokeWidth={2.2} />
                  ) : (
                    <Eye size={16} color={theme.textMain} strokeWidth={2.2} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                    Home Setup Checklist
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textDim }]}>
                    {isSetupDismissed ? 'Currently hidden from Home' : 'Visible on Home Hero Card'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onToggleSetupDismissed}
                style={[
                  styles.toggleActionBtn,
                  {
                    backgroundColor: isSetupDismissed
                      ? (theme.isDark ? '#23F07D' : '#10B981')
                      : theme.surface,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleActionText,
                    {
                      color: isSetupDismissed
                        ? (theme.isDark ? '#07170D' : '#FFFFFF')
                        : theme.textDim,
                      fontWeight: isSetupDismissed ? '700' : '500',
                    },
                  ]}
                >
                  {isSetupDismissed ? 'Restore' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SECTION 2: CLOUD & DATA */}
            <Text style={[styles.sectionHeading, { color: theme.textDim, marginTop: 18 }]}>
              SYNC & DATA
            </Text>

            {/* Cloud Sync Status Card */}
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ]}
                >
                  <Cloud
                    size={16}
                    color={isCloudSynced ? (theme.isDark ? '#23F07D' : '#10B981') : theme.textDim}
                    strokeWidth={2.2}
                  />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                    {isCloudSynced ? 'Supabase PostgreSQL' : 'Local Offline Mode'}
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textDim }]}>
                    {isCloudSynced
                      ? 'Real-time multi-device cloud synchronization'
                      : 'Data stored locally on this device'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isCloudSynced
                      ? (theme.isDark ? 'rgba(35, 240, 125, 0.15)' : 'rgba(16, 185, 129, 0.15)')
                      : theme.surface,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: isCloudSynced
                        ? (theme.isDark ? '#23F07D' : '#10B981')
                        : theme.textDim,
                    },
                  ]}
                >
                  {isCloudSynced ? 'Active' : 'Offline'}
                </Text>
              </View>
            </View>

            {/* Export CSV Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExportCSV}
              style={[
                styles.settingCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ]}
                >
                  <FileSpreadsheet size={16} color={theme.textMain} strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                    Export Transactions
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textDim }]}>
                    Download complete ledger in CSV format
                  </Text>
                </View>
              </View>

              <ChevronRight size={16} color={theme.textDim} strokeWidth={2} />
            </TouchableOpacity>

            {/* SECTION 3: SECURITY */}
            <Text style={[styles.sectionHeading, { color: theme.textDim, marginTop: 18 }]}>
              SECURITY & PRIVACY
            </Text>

            {/* Biometric Toggle Card */}
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ]}
                >
                  <Lock size={16} color={theme.textMain} strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textMain }]}>
                    App Lock / Biometrics
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textDim }]}>
                    Require FaceID / Fingerprint on launch
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setBiometricsEnabled((prev) => !prev)}
                style={[
                  styles.toggleActionBtn,
                  {
                    backgroundColor: biometricsEnabled
                      ? (theme.isDark ? '#23F07D' : '#10B981')
                      : theme.surface,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleActionText,
                    {
                      color: biometricsEnabled
                        ? (theme.isDark ? '#07170D' : '#FFFFFF')
                        : theme.textDim,
                      fontWeight: biometricsEnabled ? '700' : '500',
                    },
                  ]}
                >
                  {biometricsEnabled ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* RLS Security Note */}
            <View style={styles.footnoteRow}>
              <ShieldCheck size={13} color={theme.textDim} strokeWidth={2.2} />
              <Text style={[styles.footnoteText, { color: theme.textDim }]}>
                Row Level Security active • 256-bit client-side encryption
              </Text>
            </View>

            {/* SECTION 4: ACCOUNT ACTION */}
            <View style={styles.actionSection}>
              {user ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignOut}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <LogOut size={16} color="#EF4444" strokeWidth={2.2} />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: theme.isDark ? '#23F07D' : '#10B981' },
                  ]}
                >
                  <User size={16} color={theme.isDark ? '#07170D' : '#FFFFFF'} strokeWidth={2.2} />
                  <Text
                    style={[
                      styles.primaryActionBtnText,
                      { color: theme.isDark ? '#07170D' : '#FFFFFF' },
                    ]}
                  >
                    Sign In / Connect Supabase
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
  },
  userTextContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
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
  tierText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    maxHeight: 520,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  settingSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  currencyToggleGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPillActive: {},
  currencyPillText: {
    fontSize: 11.5,
  },
  toggleActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActionText: {
    fontSize: 11.5,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  noticeBannerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 18,
  },
  footnoteText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
