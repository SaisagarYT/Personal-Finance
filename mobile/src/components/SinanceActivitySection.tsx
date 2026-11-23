import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { Transaction } from '../services/financeService';

interface SinanceActivitySectionProps {
  brainAmount?: string;
  sinceAllTimeLabel?: string;
  dailyCashSubtitle?: string;
  isBrainActive?: boolean;
  transactions?: Transaction[];
  onPressBrainCard?: () => void;
  onPressActivityCard?: () => void;
}

export const SinanceActivitySection: React.FC<SinanceActivitySectionProps> = ({
  brainAmount = '₹0.00',
  sinceAllTimeLabel = 'Since All Time',
  dailyCashSubtitle,
  isBrainActive = false,
  transactions = [],
  onPressBrainCard,
  onPressActivityCard,
}) => {
  const theme = useAppTheme();

  // Calculate dynamic weekly bars from real transaction history (Monday through Sunday)
  const { weeklyBars, calculatedDailyCash } = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const now = new Date();
    // Monday of the current week (assuming Monday is start of week)
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Sum transactions per day of the current week
    const dailyExpenses = [0, 0, 0, 0, 0, 0, 0];
    let todayIncome = 0;
    let todayExpense = 0;
    const todayStr = now.toISOString().split('T')[0];

    transactions.forEach((tx) => {
      const txDateStr = tx.transaction_date || tx.created_at;
      if (!txDateStr) return;
      const txDate = new Date(txDateStr);

      if (txDateStr.startsWith(todayStr)) {
        if (tx.type === 'income') todayIncome += Number(tx.amount || 0);
        else if (tx.type === 'expense') todayExpense += Number(tx.amount || 0);
      }

      if (txDate >= startOfWeek && txDate < endOfWeek) {
        const dayIdx = (txDate.getDay() + 6) % 7;
        dailyExpenses[dayIdx] += Number(tx.amount || 0);
      }
    });

    const maxExpense = Math.max(...dailyExpenses, 1);
    const minBarHeight = 6;
    const maxBarHeight = 38;

    // Peak active day index (highest volume or today)
    const highestIdx = dailyExpenses.indexOf(Math.max(...dailyExpenses));
    const activePeakIdx = dailyExpenses.some((val) => val > 0) ? highestIdx : currentDayOfWeek;

    const bars = days.map((day, idx) => {
      const amount = dailyExpenses[idx];
      let height = minBarHeight;
      if (amount > 0) {
        height = Math.round(minBarHeight + (amount / maxExpense) * (maxBarHeight - minBarHeight));
      } else if (transactions.length === 0) {
        // Fallback default progression if zero transactions exist yet
        const defaultHeights = [10, 16, 22, 36, 26, 18, 32];
        height = defaultHeights[idx];
      }
      return {
        day,
        height,
        isHighlight: idx === activePeakIdx,
      };
    });

    const netToday = todayIncome - todayExpense;
    const fallbackCash = netToday !== 0
      ? `${netToday >= 0 ? '+' : '-'}₹${Math.abs(netToday).toLocaleString('en-IN')} Daily Cash`
      : '+₹1,250 Daily Cash';

    return {
      weeklyBars: bars,
      calculatedDailyCash: dailyCashSubtitle || fallbackCash,
    };
  }, [transactions, dailyCashSubtitle]);

  return (
    <View style={styles.container}>
      {/* ================= LEFT CARD: BRAIN CARD (PERMANENT PURE WHITE CARD MATCHING REFERENCE) ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressBrainCard}
        style={styles.brainCard}
      >
        {/* Top Header: Flame Icon & Brain Label */}
        <View style={styles.brainHeaderRow}>
          <Flame
            size={18}
            color="#07170D"
            fill="#07170D"
            strokeWidth={2.4}
          />
          <Text style={styles.brainTitle}>
            Brain
          </Text>
        </View>

        {/* Amount & Timeframe */}
        <View style={styles.brainValueContainer}>
          <Text style={styles.brainAmount}>
            {brainAmount}
          </Text>
          <Text style={styles.brainSubtitle}>
            {sinceAllTimeLabel}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ================= RIGHT CARD: DARK WEEKLY ACTIVITY CARD ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressActivityCard}
        style={[
          styles.activityCard,
          {
            backgroundColor: theme.cardContainer,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        {/* Header: Weekly Activity & Daily Cash */}
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, { color: theme.textMain }]}>Weekly Activity</Text>
          <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>{calculatedDailyCash}</Text>
        </View>

        {/* 7-Day Mini Bar Chart */}
        <View style={styles.chartContainer}>
          {weeklyBars.map((bar, index) => (
            <View key={index} style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: bar.height,
                    backgroundColor: bar.isHighlight ? theme.brand : theme.textMain,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 18,
    marginBottom: 14,
    width: '100%',
  },
  brainCard: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Reference-identical pure white card surface
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 126,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  brainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brainTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#07170D',
    letterSpacing: -0.2,
  },
  brainValueContainer: {
    marginTop: 18,
  },
  brainAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#07170D',
    letterSpacing: -0.6,
  },
  brainSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 3,
    letterSpacing: -0.1,
  },
  activityCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 126,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  activityHeader: {
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  activitySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: -0.1,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 38,
    paddingHorizontal: 2,
  },
  barTrack: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 8,
  },
  bar: {
    width: 6.5,
    borderRadius: 3.5,
  },
});
