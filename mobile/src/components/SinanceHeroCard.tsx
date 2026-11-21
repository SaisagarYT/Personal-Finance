import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Bell, ChevronRight, ChevronsRight, X } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface SinanceHeroCardProps {
  userName?: string;
  balance?: string;
  pastWeekDiff?: string;
  onboardingStep?: string;
  onboardingText?: string;
  isSetupDismissed?: boolean;
  onPressNotification?: () => void;
  onPressAvatar?: () => void;
  onPressDismissSetup?: () => void;
  onPressGetSetUp?: () => void;
  onPressBalance?: () => void;
  isAvatarHidden?: boolean;
}

export const SinanceHeroCard: React.FC<SinanceHeroCardProps> = ({
  userName = 'Sagar',
  balance = '$142.83',
  pastWeekDiff = '$23.91 past week',
  onboardingStep = '2 of 5 complete',
  onboardingText = 'is a crucial phase in the onboarding process',
  isSetupDismissed = false,
  onPressNotification,
  onPressAvatar,
  onPressDismissSetup,
  onPressGetSetUp,
  onPressBalance,
  isAvatarHidden = false,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.heroCardBg }]}>
      {/* 1. Header Greeting & Notification Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressAvatar}
          style={styles.userInfoRow}
        >
          {/* Avatar with circular ring */}
          <View
            style={[
              styles.avatarWrapper,
              {
                borderColor: theme.surface,
                backgroundColor: theme.avatarInnerBg,
                opacity: isAvatarHidden ? 0 : 1,
              },
            ]}
          >
            <Image
              source={require('../../assets/esther_avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          {/* Greeting text */}
          <View style={styles.greetingContainer}>
            <View style={styles.waveRow}>
              <Text style={[styles.helloText, { color: theme.forestDark }]}>Hello</Text>
              <Text style={styles.waveEmoji}> 👋</Text>
            </View>
            <Text style={[styles.userNameText, { color: theme.forestDark }]}>{userName}</Text>
          </View>
        </TouchableOpacity>

        {/* Dark Circle Notification Bell */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressNotification}
          style={[styles.notificationButton, { backgroundColor: theme.heroPillDiscBg }]}
        >
          <Bell size={16} color={theme.heroPillDiscIcon} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* 2. Value & Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={[styles.balanceLabel, { color: theme.forestDark }]}>Your Sinance Value</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressBalance}
          style={styles.balanceRow}
        >
          <Text style={[styles.balanceAmount, { color: theme.forestDark }]}>{balance}</Text>
          <View style={[styles.pastWeekBadge, { backgroundColor: theme.forestBadgeBg }]}>
            <Text style={[styles.triangleIndicator, { color: theme.forestBadgeText }]}>▲</Text>
            <Text style={[styles.pastWeekText, { color: theme.forestBadgeText }]}>{pastWeekDiff}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Setup / Onboarding Banner */}
      {!isSetupDismissed && (
        <View
          style={[
            styles.setupBanner,
            {
              backgroundColor: theme.heroSetupBannerBg,
              borderColor: theme.heroSetupBannerBorder,
            },
          ]}
        >
          {/* Onboarding phase notice + Dismiss button */}
          <View style={styles.setupTextRow}>
            <Text style={[styles.setupNoticeText, { color: theme.forestDark }]}>
              Get Set Up <Text style={[styles.setupNoticeEmphasis, { color: theme.forestDark }]}>({onboardingStep})</Text> {onboardingText}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressDismissSetup}
              style={[styles.dismissButton, { backgroundColor: theme.heroPillDiscBg }]}
            >
              <X size={12} color={theme.heroPillDiscIcon} strokeWidth={2.8} />
            </TouchableOpacity>
          </View>

          {/* Interactive Action Pill Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPressGetSetUp}
            style={[styles.actionPillButton, { backgroundColor: theme.heroPillBg }]}
          >
            {/* Left black disc with chevron */}
            <View style={[styles.arrowDisc, { backgroundColor: theme.heroPillDiscBg }]}>
              <ChevronRight size={17} color={theme.heroPillDiscIcon} strokeWidth={2.8} />
            </View>

            {/* Center text */}
            <Text style={[styles.actionPillText, { color: theme.heroPillText }]}>Get Set Up</Text>

            {/* Right double chevron */}
            <View style={styles.rightChevrons}>
              <ChevronsRight size={18} color={theme.textDim} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helloText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  waveEmoji: {
    fontSize: 12,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: -1,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceSection: {
    marginBottom: 18,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pastWeekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  triangleIndicator: {
    fontSize: 9,
    fontWeight: '800',
  },
  pastWeekText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  setupBanner: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 1,
  },
  setupTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  setupNoticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 16.5,
    fontWeight: '600',
    paddingRight: 10,
    letterSpacing: -0.1,
  },
  setupNoticeEmphasis: {
    fontWeight: '800',
  },
  dismissButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 26,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 16,
    height: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  arrowDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rightChevrons: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
