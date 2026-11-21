import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Bell, ChevronRight, ChevronsRight, X } from 'lucide-react-native';

interface EcoFinHeroCardProps {
  userName?: string;
  balance?: string;
  pastWeekDiff?: string;
  onboardingStep?: string;
  onboardingText?: string;
  onPressNotification?: () => void;
  onPressDismissSetup?: () => void;
  onPressGetSetUp?: () => void;
  onPressBalance?: () => void;
}

export const EcoFinHeroCard: React.FC<EcoFinHeroCardProps> = ({
  userName = 'Esther',
  balance = '$142.83',
  pastWeekDiff = '$23.91 past week',
  onboardingStep = '2 of 5 complete',
  onboardingText = 'is a crucial phase in the onboarding process',
  onPressNotification,
  onPressDismissSetup,
  onPressGetSetUp,
  onPressBalance,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* 1. Header Greeting & Notification Row */}
      <View style={styles.headerRow}>
        <View style={styles.userInfoRow}>
          {/* Avatar with circular ring */}
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/esther_avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          {/* Greeting text */}
          <View style={styles.greetingContainer}>
            <View style={styles.waveRow}>
              <Text style={styles.helloText}>Hello</Text>
              <Text style={styles.waveEmoji}> 👋</Text>
            </View>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
        </View>

        {/* Dark Circle Notification Bell */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressNotification}
          style={styles.notificationButton}
        >
          <Bell size={16} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. Value & Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Your EcoFin Value</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressBalance}
          style={styles.balanceRow}
        >
          <Text style={styles.balanceAmount}>{balance}</Text>
          <View style={styles.pastWeekBadge}>
            <Text style={styles.triangleIndicator}>▲</Text>
            <Text style={styles.pastWeekText}>{pastWeekDiff}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Setup / Onboarding Banner */}
      <View style={styles.setupBanner}>
        {/* Onboarding phase notice + Dismiss button */}
        <View style={styles.setupTextRow}>
          <Text style={styles.setupNoticeText}>
            Get Set Up <Text style={styles.setupNoticeEmphasis}>({onboardingStep})</Text> {onboardingText}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressDismissSetup}
            style={styles.dismissButton}
          >
            <X size={12} color="#FFFFFF" strokeWidth={2.8} />
          </TouchableOpacity>
        </View>

        {/* Interactive Action Pill Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressGetSetUp}
          style={styles.actionPillButton}
        >
          {/* Left black disc with chevron */}
          <View style={styles.arrowDisc}>
            <ChevronRight size={17} color="#FFFFFF" strokeWidth={2.8} />
          </View>

          {/* Center text */}
          <Text style={styles.actionPillText}>Get Set Up</Text>

          {/* Right double chevron */}
          <View style={styles.rightChevrons}>
            <ChevronsRight size={18} color="#71717A" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#23F07D',
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
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
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
    fontSize: 12.5,
    fontWeight: '500',
    color: '#163824',
    letterSpacing: -0.1,
  },
  waveEmoji: {
    fontSize: 12,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#08170E',
    letterSpacing: -0.3,
    marginTop: -1,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F1A13',
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
    fontWeight: '500',
    color: '#163824',
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
    color: '#07160D',
    letterSpacing: -1,
  },
  pastWeekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 56, 32, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  triangleIndicator: {
    fontSize: 9,
    color: '#123820',
  },
  pastWeekText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123820',
    letterSpacing: -0.2,
  },
  setupBanner: {
    backgroundColor: '#1FD872',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  setupTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  setupNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#0E2918',
    paddingRight: 10,
    letterSpacing: -0.1,
  },
  setupNoticeEmphasis: {
    fontWeight: '700',
    color: '#07170D',
  },
  dismissButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F1A13',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#0A130D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#09150E',
    letterSpacing: -0.2,
  },
  rightChevrons: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
