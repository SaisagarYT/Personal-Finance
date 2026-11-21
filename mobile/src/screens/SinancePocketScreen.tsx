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
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'moreInfo'>('activity');

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ================= TOP GREEN HERO CARD ================= */}
        <View style={styles.heroCard}>
          {/* Top navigation row */}
          <View style={styles.topNavRow}>
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={styles.backButton}
            >
              <ArrowLeft size={18} color="#08180E" strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Centered Pocket Brand */}
            <View style={styles.pocketHeaderCenter}>
              <View style={styles.pocketIconDisc}>
                <DollarSign size={13} color="#FFFFFF" strokeWidth={2.8} />
              </View>
              <Text style={styles.pocketTitle}>Pocket</Text>
            </View>

            {/* Spacer for symmetry */}
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* Balance Section */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.availableText}>{availableBalance}</Text>
            <View style={styles.instantBadge}>
              <Text style={styles.instantBadgeText}>Instant Withdrawals</Text>
            </View>
          </View>

          {/* Action Buttons: Deposit & Withdraw */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.depositButton}
              onPress={() => console.log('Deposit pressed')}
            >
              <Text style={styles.depositText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.withdrawButton}
              onPress={() => console.log('Withdraw pressed')}
            >
              <Text style={styles.withdrawText}>Withdraw</Text>
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
            style={styles.quickTransfersCard}
            onPress={() => console.log('Enable quick transfers pressed')}
          >
            <View style={styles.quickCardLeft}>
              <View style={styles.starDisc}>
                <Star size={16} color="#23F07D" fill="#23F07D" />
              </View>
              <View style={styles.quickTextWrapper}>
                <Text style={styles.quickCardTitle}>Enable Quick Transfers</Text>
                <Text style={styles.quickCardSubtitle}>
                  Get your money now, Don't Wait 4 days for direct debits
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#082312" strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Ledger Group: April 2024 */}
          <Text style={styles.ledgerMonthHeader}>April 2024</Text>

          {/* Transaction 1: Manual Deposit */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.txRow}
            onPress={() => console.log('Manual deposit clicked')}
          >
            <View style={styles.txLeft}>
              <View style={styles.txIconBadge}>
                <ArrowDown size={16} color="#23F07D" strokeWidth={2.4} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={styles.txTitle}>Manual Deposit</Text>
                <Text style={styles.txSubtitle}>Cancelled • 17 April 2024</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>+$10</Text>
          </TouchableOpacity>

          {/* Transaction 2: Automatic Deposit */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.txRow}
            onPress={() => console.log('Automatic deposit clicked')}
          >
            <View style={styles.txLeft}>
              <View style={styles.txIconBadge}>
                <Sparkles size={16} color="#23F07D" strokeWidth={2.2} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={styles.txTitle}>Automatic Deposit</Text>
                <Text style={styles.txSubtitle}>Should Arrive on 25 April 2024</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>+$20</Text>
          </TouchableOpacity>

          {/* Transaction 3: Monthly Lookback */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.txRow}
            onPress={() => console.log('Monthly lookback clicked')}
          >
            <View style={styles.txLeft}>
              <View style={styles.txIconBadge}>
                <Calendar size={16} color="#23F07D" strokeWidth={2.2} />
              </View>
              <View style={styles.txTextContainer}>
                <Text style={styles.txTitle}>Monthly Lookback</Text>
                <Text style={styles.txSubtitle}>A summary of how your savings</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>+$110</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#23F07D',
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
    backgroundColor: 'rgba(10, 35, 20, 0.12)',
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
    backgroundColor: '#08170E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pocketTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#08170E',
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
    color: '#08180E',
    letterSpacing: -1,
  },
  availableText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#133922',
    marginTop: 4,
  },
  instantBadge: {
    backgroundColor: 'rgba(18, 56, 32, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  instantBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#123820',
    letterSpacing: -0.2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#0B0B0D',
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
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: 'rgba(18, 56, 32, 0.12)',
    borderRadius: 26,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0A2615',
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
    color: '#71717A',
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickTransfersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#23F07D',
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
    backgroundColor: '#08170E',
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
    color: '#07170D',
    letterSpacing: -0.2,
  },
  quickCardSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#0E2E19',
    marginTop: 2,
  },
  ledgerMonthHeader: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161616',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#242426',
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
    backgroundColor: 'rgba(35, 240, 125, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(35, 240, 125, 0.2)',
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
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  txSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#A1A1AA',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
