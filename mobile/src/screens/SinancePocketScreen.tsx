import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  ArrowLeft,
  DollarSign,
  Star,
  ChevronRight,
  ArrowDown,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface SinancePocketScreenProps {
  onBack: () => void;
  balance?: string;
  availableBalance?: string;
}

export const SinancePocketScreen: React.FC<SinancePocketScreenProps> = ({
  onBack,
  balance = '$142.83',
  availableBalance = '$0 Available',
}) => {
  const theme = useAppTheme();
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'moreInfo'>('activity');

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.canvas }]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.canvas }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ================= TOP GREEN HERO CARD ================= */}
        <View style={[styles.heroCard, { backgroundColor: theme.heroCardBg }]}>
          {/* Top navigation row */}
          <View style={styles.topNavRow}>
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={[styles.backButton, { backgroundColor: theme.forestBadgeBg }]}
            >
              <ArrowLeft size={18} color={theme.forestDark} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Centered Pocket Brand */}
            <View style={styles.pocketHeaderCenter}>
              <View style={[styles.pocketIconDisc, { backgroundColor: theme.forestDark }]}>
                <DollarSign size={13} color="#FFFFFF" strokeWidth={2.8} />
              </View>
              <Text style={[styles.pocketTitle, { color: theme.forestDark }]}>Pocket</Text>
            </View>

            {/* Spacer for symmetry */}
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* Balance Section */}
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceAmount, { color: theme.forestDark }]}>{balance}</Text>
            <Text style={[styles.availableText, { color: theme.forestMedium }]}>{availableBalance}</Text>
            <View style={[styles.instantBadge, { backgroundColor: theme.forestBadgeBg }]}>
              <Text style={[styles.instantBadgeText, { color: theme.forestMedium }]}>Instant Withdrawals</Text>
            </View>
          </View>

          {/* Action Buttons: Deposit & Withdraw */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.depositButton, { backgroundColor: theme.forestDark }]}
              onPress={() => console.log('Deposit pressed')}
            >
              <Text style={[styles.depositText, { color: '#FFFFFF' }]}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.withdrawButton, { backgroundColor: theme.forestBadgeBg }]}
              onPress={() => console.log('Withdraw pressed')}
            >
              <Text style={[styles.withdrawText, { color: theme.forestDark }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= LOWER CHARCOAL SECTION ================= */}
        <View style={styles.lowerContainer}>
          {/* Sub-Tabs: Activity & More Info */}
          <View style={styles.subTabsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSubTab('activity')}
              style={styles.subTabButton}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeSubTab === 'activity' ? theme.textMain : theme.textDim },
                  activeSubTab === 'activity' && styles.subTabTextActive,
                ]}
              >
                Activity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSubTab('moreInfo')}
              style={styles.subTabButton}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeSubTab === 'moreInfo' ? theme.textMain : theme.textDim },
                  activeSubTab === 'moreInfo' && styles.subTabTextActive,
                ]}
              >
                More Info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enable Quick Transfers Banner Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.quickTransfersCard, { backgroundColor: theme.brand }]}
            onPress={() => console.log('Enable quick transfers pressed')}
          >
            <View style={styles.quickCardLeft}>
              <View style={[styles.starDisc, { backgroundColor: theme.forestDark }]}>
                <Star size={16} color={theme.brand} fill={theme.brand} />
              </View>
              <View style={styles.quickTextWrapper}>
                <Text style={[styles.quickCardTitle, { color: theme.forestDark }]}>Enable Quick Transfers</Text>
                <Text style={[styles.quickCardSubtitle, { color: theme.forestDark }]}>
                  Get your money now, Don't Wait 4 days for direct debits
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.forestDark} strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Ledger Group: April 2024 */}
          <Text style={[styles.ledgerMonthHeader, { color: theme.textMain }]}>April 2024</Text>

          {/* Transaction 1: Manual Deposit */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.txRow,
              {
                backgroundColor: theme.cardContainer,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => console.log('Manual deposit clicked')}
          >
            <View style={styles.txLeft}>
              <View style={[styles.txIconBadge, { backgroundColor: theme.forestBadgeBg, borderColor: theme.brandMedium }]}>
                <ArrowDown size={16} color={theme.brand} strokeWidth={2.4} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={[styles.txTitle, { color: theme.textMain }]}>Manual Deposit</Text>
                <Text style={[styles.txSubtitle, { color: theme.textMuted }]}>Cancelled • 17 April 2024</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: theme.brand }]}>+$10</Text>
          </TouchableOpacity>

          {/* Transaction 2: Automatic Deposit */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.txRow,
              {
                backgroundColor: theme.cardContainer,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => console.log('Automatic deposit clicked')}
          >
            <View style={styles.txLeft}>
              <View style={[styles.txIconBadge, { backgroundColor: theme.forestBadgeBg, borderColor: theme.brandMedium }]}>
                <Sparkles size={16} color={theme.brand} strokeWidth={2.2} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={[styles.txTitle, { color: theme.textMain }]}>Automatic Deposit</Text>
                <Text style={[styles.txSubtitle, { color: theme.textMuted }]}>Should Arrive on 25 April 2024</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: theme.brand }]}>+$20</Text>
          </TouchableOpacity>

          {/* Transaction 3: Monthly Lookback */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.txRow,
              {
                backgroundColor: theme.cardContainer,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => console.log('Monthly lookback clicked')}
          >
            <View style={styles.txLeft}>
              <View style={[styles.txIconBadge, { backgroundColor: theme.forestBadgeBg, borderColor: theme.brandMedium }]}>
                <Calendar size={16} color={theme.brand} strokeWidth={2.2} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={[styles.txTitle, { color: theme.textMain }]}>Monthly Lookback</Text>
                <Text style={[styles.txSubtitle, { color: theme.textMuted }]}>A summary of how your savings</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: theme.brand }]}>+$110</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 22,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketHeaderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketIconDisc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pocketTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  backButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  availableText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 4,
  },
  instantBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  instantBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  depositButton: {
    flex: 1,
    borderRadius: 26,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  depositText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  withdrawButton: {
    flex: 1,
    borderRadius: 26,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  lowerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subTabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 16,
  },
  subTabButton: {
    paddingVertical: 6,
  },
  subTabText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  subTabTextActive: {
    fontWeight: '700',
  },
  quickTransfersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  quickCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  starDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickCardSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  ledgerMonthHeader: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  txTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  txSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
