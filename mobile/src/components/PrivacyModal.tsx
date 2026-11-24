import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import {
  X,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Bell,
  Lock,
  Timer,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { usePrivacy } from '../context/PrivacyContext';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance?: string;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
  currentBalance = '₹2,40,250.00',
}) => {
  const theme = useAppTheme();
  const { settings, isPrivacyMode, togglePrivacyMode, updateSetting, maskAmount } = usePrivacy();

  const [isMounted, setIsMounted] = useState(visible);
  const slideAnim = useRef(new Animated.Value(340)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 340,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible]);

  const handleSmoothClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 340,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsMounted(false);
    });
  };

  if (!isMounted) return null;

  const activeAccent = theme.isDark ? '#23F07D' : '#059669';

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleSmoothClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Animated Dark Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={handleSmoothClose}
          />
        </Animated.View>

        {/* ================= FULL-WIDTH BOTTOM SHEET ================= */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.borderSubtle,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Pull Handle */}
          <View style={styles.dragHandleWrapper}>
            <View style={[styles.dragHandle, { backgroundColor: theme.borderSubtle }]} />
          </View>

          {/* Top Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, { color: theme.textMain }]}>Privacy & Security</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                Protect sensitive numbers & lock preferences
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSmoothClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <X size={16} color={theme.textMain} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ================= HERO LIVE PREVIEW CARD ================= */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isPrivacyMode ? activeAccent : theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadgeRow}>
                  <View
                    style={[
                      styles.heroIconDisc,
                      {
                        backgroundColor: isPrivacyMode
                          ? (theme.isDark ? 'rgba(35, 240, 125, 0.18)' : 'rgba(5, 150, 105, 0.15)')
                          : theme.surfaceSubtle,
                      },
                    ]}
                  >
                    {isPrivacyMode ? (
                      <EyeOff size={18} color={activeAccent} strokeWidth={2.4} />
                    ) : (
                      <Eye size={18} color={theme.textMain} strokeWidth={2.2} />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.heroBadgeTitle, { color: theme.textMain }]}>
                      Discreet Mode
                    </Text>
                    <Text style={[styles.heroBadgeStatus, { color: isPrivacyMode ? activeAccent : theme.textMuted }]}>
                      {isPrivacyMode ? 'Active • Balances Masked' : 'Inactive • Numbers Visible'}
                    </Text>
                  </View>
                </View>

                {/* Main Toggle Switch */}
                <Switch
                  value={isPrivacyMode}
                  onValueChange={togglePrivacyMode}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                  thumbColor={Platform.OS === 'android' ? (theme.isDark ? '#000000' : '#FFFFFF') : undefined}
                />
              </View>

              {/* Live Preview Display Box */}
              <View style={[styles.previewDisplayBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.previewLabel, { color: theme.textMuted }]}>
                  Live Preview: Your Sinance Balance
                </Text>
                <Text
                  style={[
                    styles.previewValue,
                    {
                      color: isPrivacyMode ? theme.textDim : theme.textMain,
                      letterSpacing: isPrivacyMode ? 3 : -0.5,
                    },
                  ]}
                >
                  {maskAmount(currentBalance, '••••••••')}
                </Text>
              </View>
            </View>

            {/* ================= GROUP 1: DISPLAY & APP PRIVACY ================= */}
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              DISPLAY & SCREEN PRIVACY
            </Text>
            <View style={[styles.groupedCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
              {/* Row 1: Mask Individual Transactions */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Shield size={17} color={theme.textMain} strokeWidth={2.2} />
                  </View>
                  <View style={styles.optionTextStack}>
                    <Text style={[styles.optionTitle, { color: theme.textMain }]}>Mask Transactions</Text>
                    <Text style={[styles.optionSub, { color: theme.textDim }]}>
                      Hide line-item ledger amounts with dots
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.maskTransactions}
                  onValueChange={(val) => updateSetting('maskTransactions', val)}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Row 2: Blur in App Switcher */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Smartphone size={17} color={theme.textMain} strokeWidth={2.2} />
                  </View>
                  <View style={styles.optionTextStack}>
                    <Text style={[styles.optionTitle, { color: theme.textMain }]}>App Switcher Blur</Text>
                    <Text style={[styles.optionSub, { color: theme.textDim }]}>
                      Mask app preview during multitasking
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.blurInAppSwitcher}
                  onValueChange={(val) => updateSetting('blurInAppSwitcher', val)}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Row 3: Discreet Push Notifications */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Bell size={17} color={theme.textMain} strokeWidth={2.2} />
                  </View>
                  <View style={styles.optionTextStack}>
                    <Text style={[styles.optionTitle, { color: theme.textMain }]}>Discreet Notifications</Text>
                    <Text style={[styles.optionSub, { color: theme.textDim }]}>
                      Omit amounts in lock-screen alert messages
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.discreetNotifications}
                  onValueChange={(val) => updateSetting('discreetNotifications', val)}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                />
              </View>
            </View>

            {/* ================= GROUP 2: ACCESS & LOCK CONTROLS ================= */}
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              ACCESS & SECURITY LOCKS
            </Text>
            <View style={[styles.groupedCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
              {/* Row 1: Biometric Lock */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Lock size={17} color={theme.textMain} strokeWidth={2.2} />
                  </View>
                  <View style={styles.optionTextStack}>
                    <Text style={[styles.optionTitle, { color: theme.textMain }]}>Biometric Lock</Text>
                    <Text style={[styles.optionSub, { color: theme.textDim }]}>
                      Require Face ID or fingerprint to open
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.biometricLock}
                  onValueChange={(val) => updateSetting('biometricLock', val)}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Row 2: Lock Immediately on Minimize */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.iconDisc, { backgroundColor: theme.surfaceSubtle }]}>
                    <Timer size={17} color={theme.textMain} strokeWidth={2.2} />
                  </View>
                  <View style={styles.optionTextStack}>
                    <Text style={[styles.optionTitle, { color: theme.textMain }]}>Lock Immediately</Text>
                    <Text style={[styles.optionSub, { color: theme.textDim }]}>
                      Require authentication upon app minimization
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.lockImmediately}
                  onValueChange={(val) => updateSetting('lockImmediately', val)}
                  trackColor={{ false: theme.surfaceSubtle, true: activeAccent }}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  heroIconDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroBadgeStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  previewDisplayBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  previewLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  groupedCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  iconDisc: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextStack: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  optionSub: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
});
