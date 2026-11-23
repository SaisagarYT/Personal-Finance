import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Tv,
  Wifi,
  Zap,
  Music,
  Smartphone,
  Dumbbell,
  Cloud,
  CreditCard,
  Home,
  Receipt,
  ChevronRight,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

export type BillCategory =
  | 'streaming'
  | 'internet'
  | 'utility'
  | 'music'
  | 'mobile'
  | 'fitness'
  | 'cloud'
  | 'emi'
  | 'housing';

export interface BillItem {
  id: string;
  name: string;
  category: BillCategory;
  amount: string;
  dueDate: string;
  dueCountdown: string;
  isAutoPay?: boolean;
}

interface UpcomingBillsSectionProps {
  bills?: BillItem[];
  onPressBill?: (bill: BillItem) => void;
  onPressSeeAll?: () => void;
}

const DEFAULT_BILLS: BillItem[] = [
  {
    id: 'netflix',
    name: 'Netflix Premium',
    category: 'streaming',
    amount: '₹649.00',
    dueDate: '24 Nov',
    dueCountdown: 'Due in 3 days',
    isAutoPay: true,
  },
  {
    id: 'airtel',
    name: 'Airtel Xstream Fibre',
    category: 'internet',
    amount: '₹999.00',
    dueDate: '28 Nov',
    dueCountdown: 'Due in 7 days',
    isAutoPay: false,
  },
];

export const UpcomingBillsSection: React.FC<UpcomingBillsSectionProps> = ({
  bills = DEFAULT_BILLS,
  onPressBill,
  onPressSeeAll,
}) => {
  const theme = useAppTheme();

  const renderCategoryIcon = (category: BillCategory) => {
    const iconSize = 18;
    const strokeWidth = 2.0;
    const color = theme.textMain;

    switch (category) {
      case 'streaming':
        return <Tv size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'internet':
        return <Wifi size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'utility':
        return <Zap size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'music':
        return <Music size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'mobile':
        return <Smartphone size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'fitness':
        return <Dumbbell size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'cloud':
        return <Cloud size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'housing':
        return <Home size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'emi':
      default:
        return <CreditCard size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Receipt size={17} color={theme.textMain} strokeWidth={2.0} />
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>Upcoming Bills</Text>
          <View style={[styles.badgeCount, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.badgeCountText, { color: theme.textDim }]}>{bills.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressSeeAll}
          style={styles.seeAllBtn}
        >
          <Text style={[styles.seeAllText, { color: theme.textDim }]}>See All</Text>
          <ChevronRight size={14} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Bill Cards */}
      <View style={styles.billsList}>
        {bills.map((bill) => (
          <TouchableOpacity
            key={bill.id}
            activeOpacity={0.88}
            onPress={() => onPressBill?.(bill)}
            style={[
              styles.billCard,
              {
                backgroundColor: theme.cardContainer,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {/* Left: Clean Icon Disc */}
            <View style={styles.leftGroup}>
              <View
                style={[
                  styles.iconDisc,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                {renderCategoryIcon(bill.category)}
              </View>

              {/* Title & Timing Info */}
              <View style={styles.textContainer}>
                <Text
                  style={[styles.billName, { color: theme.textMain }]}
                  numberOfLines={1}
                >
                  {bill.name}
                </Text>
                <Text style={[styles.dueInfo, { color: theme.textMuted }]}>
                  {bill.dueCountdown} • {bill.dueDate}
                </Text>
              </View>
            </View>

            {/* Right: Amount & Status Badge */}
            <View style={styles.rightGroup}>
              <Text style={[styles.amountText, { color: theme.textMain }]}>
                {bill.amount}
              </Text>
              {bill.isAutoPay ? (
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: theme.isDark ? theme.brand : '#059669' },
                    ]}
                  />
                  <Text style={[styles.statusPillText, { color: theme.textMain }]}>
                    Auto-pay
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: theme.textDim },
                    ]}
                  />
                  <Text style={[styles.statusPillText, { color: theme.textDim }]}>
                    Scheduled
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 24,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badgeCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeCountText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  billsList: {
    gap: 10,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconDisc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  billName: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  dueInfo: {
    fontSize: 12,
    fontWeight: '400',
  },
  rightGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
