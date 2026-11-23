import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  X,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface StatsViewProps {
  onBack?: () => void;
  currency?: 'USD' | 'INR';
}

interface MonthlyData {
  month: string;
  amount: number;
  formattedUSD: string;
  formattedINR: string;
}

export const StatsView: React.FC<StatsViewProps> = ({
  onBack,
  currency = 'USD',
}) => {
  const theme = useAppTheme();
  const [activeSegment, setActiveSegment] = useState<'category' | 'all'>('category');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Default: Nov
  const [selectedCategory, setSelectedCategory] = useState<string>('Subscriptions');

  const monthlyHistory: MonthlyData[] = [
    { month: 'Jun', amount: 5600, formattedUSD: '$5,600', formattedINR: '₹46,000' },
    { month: 'Jul', amount: 7904, formattedUSD: '$7,904', formattedINR: '₹65,000' },
    { month: 'Aug', amount: 4549, formattedUSD: '$4,549', formattedINR: '₹37,500' },
    { month: 'Sep', amount: 4090, formattedUSD: '$4,090', formattedINR: '₹33,800' },
    { month: 'Oct', amount: 10110, formattedUSD: '$10,110', formattedINR: '₹83,500' },
    { month: 'Nov', amount: 12924, formattedUSD: '$12,924', formattedINR: '₹1,06,700' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: true },
    { id: 'Subscriptions', label: 'Subscriptions' },
    { id: 'Edu', label: 'Edu.' },
    { id: 'Travel', label: 'Travel' },
    { id: 'Food', label: 'Food' },
    { id: 'Rent', label: 'Rent' },
  ];

  const maxAmount = Math.max(...monthlyHistory.map((m) => m.amount));
  const activeMonthData = monthlyHistory[selectedMonthIndex];

  // Dynamic currency conversions
  const avgCheck = currency === 'USD' ? '$42.50' : '₹3,500';
  const potentialSavings = currency === 'USD' ? '$180.00' : '₹14,800';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.canvas }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= 1. TOP HEADER ================= */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.iconButtonBg,
              borderColor: theme.iconButtonBorder,
            },
          ]}
        >
          <ChevronLeft size={20} color={theme.iconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.textMain }]}>Analytics</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.iconButtonBg,
              borderColor: theme.iconButtonBorder,
            },
          ]}
        >
          <Calendar size={18} color={theme.iconColor} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ================= 2. SEGMENTED SWITCHER (By Category / All analytics) ================= */}
      <View style={styles.segmentWrapper}>
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveSegment('category')}
            style={[
              styles.segmentTab,
              activeSegment === 'category' && [
                styles.segmentTabActive,
                {
                  backgroundColor: theme.surface,
                  shadowColor: '#000000',
                },
              ],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 'category'
                      ? theme.textMain
                      : theme.textMuted,
                  fontWeight: activeSegment === 'category' ? '700' : '500',
                },
              ]}
            >
              By Category
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveSegment('all')}
            style={[
              styles.segmentTab,
              activeSegment === 'all' && [
                styles.segmentTabActive,
                {
                  backgroundColor: theme.surface,
                  shadowColor: '#000000',
                },
              ],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 'all'
                      ? theme.textMain
                      : theme.textMuted,
                  fontWeight: activeSegment === 'all' ? '700' : '500',
                },
              ]}
            >
              All analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 3. MONTH NAVIGATOR ================= */}
      <View style={styles.monthNavRow}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
          style={styles.monthArrowBtn}
        >
          <ChevronLeft size={18} color={theme.textDim} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={[styles.monthNavTitle, { color: theme.textMain }]}>
          {activeMonthData.month === 'Nov' ? 'November' : activeMonthData.month}
        </Text>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() =>
            setSelectedMonthIndex((prev) =>
              Math.min(monthlyHistory.length - 1, prev + 1)
            )
          }
          style={styles.monthArrowBtn}
        >
          <ChevronRight size={18} color={theme.textDim} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* ================= 4. HORIZONTAL CATEGORY FILTER CHIPS ================= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsScroll}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedCategory('All')}
          style={[
            styles.gridIconChip,
            {
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <LayoutGrid size={16} color={theme.iconColor} strokeWidth={2} />
        </TouchableOpacity>

        {categories.slice(1).map((cat) => {
          const isSelected = selectedCategory === cat.label;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(cat.label)}
              style={[
                styles.categoryChip,
                isSelected
                  ? {
                      backgroundColor: theme.brand,
                      borderColor: 'transparent',
                    }
                  : {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isSelected ? theme.forestDark : theme.textMain,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
              {isSelected && (
                <View style={styles.chipCloseIcon}>
                  <X size={12} color={theme.forestDark} strokeWidth={2.6} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ================= 5. HERO BAR CHART (CYLINDER PILL BARS) ================= */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.cardContainer,
            borderColor: theme.cardContainerBorder,
          },
        ]}
      >
        <View style={styles.chartBarsContainer}>
          {monthlyHistory.map((item, idx) => {
            const isSelected = idx === selectedMonthIndex;
            const barHeight = Math.max(30, (item.amount / maxAmount) * 120);

            return (
              <TouchableOpacity
                key={item.month}
                activeOpacity={0.8}
                onPress={() => setSelectedMonthIndex(idx)}
                style={styles.barColumn}
              >
                {/* Amount Callout above the bar */}
                <Text
                  style={[
                    styles.barAmountText,
                    {
                      color: isSelected ? theme.textMain : theme.textMuted,
                      fontWeight: isSelected ? '800' : '600',
                      opacity: isSelected ? 1 : 0.9,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {currency === 'USD' ? item.formattedUSD : item.formattedINR}
                </Text>

                {/* Dotted guideline */}
                <View
                  style={[
                    styles.dashedGuideline,
                    {
                      borderColor: isSelected
                        ? theme.brand
                        : theme.chartBarInactiveBorder,
                      opacity: isSelected ? 1 : 0.6,
                    },
                  ]}
                />

                {/* Cylinder Capsule Bar */}
                <View
                  style={[
                    styles.capsuleBar,
                    {
                      height: barHeight,
                      backgroundColor: isSelected
                        ? theme.brand
                        : theme.chartBarInactive,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? theme.brand
                        : theme.chartBarInactiveBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.capsuleInnerHighlight,
                      {
                        backgroundColor: isSelected
                          ? theme.brandLight
                          : 'rgba(255, 255, 255, 0.25)',
                      },
                    ]}
                  />
                </View>

                {/* Month Label */}
                <Text
                  style={[
                    styles.monthLabel,
                    {
                      color: isSelected
                        ? (theme.isDark ? '#23F07D' : '#059669')
                        : theme.textMuted,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ================= 6. KEY METRIC QUICK CARDS (3-COLUMN ROW) ================= */}
      <View style={styles.metricsRow}>
        {/* Card 1: Average Check */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          <View
            style={[
              styles.metricIconCircle,
              { backgroundColor: theme.expenseIconCircleBg },
            ]}
          >
            <FileText size={16} color={theme.iconColor} strokeWidth={2} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textMain }]}>
            {avgCheck}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
            Average check
          </Text>
        </View>

        {/* Card 2: Spending Trend */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          <View
            style={[
              styles.metricIconCircle,
              { backgroundColor: theme.expenseIconCircleBg },
            ]}
          >
            <TrendingUp size={16} color={theme.isDark ? '#23F07D' : '#059669'} strokeWidth={2.2} />
          </View>
          <Text style={[styles.metricValue, { color: theme.isDark ? '#23F07D' : '#059669' }]}>
            Up 18%
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
            Spending
          </Text>
        </View>

        {/* Card 3: Potential Savings */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          <View
            style={[
              styles.metricIconCircle,
              { backgroundColor: theme.expenseIconCircleBg },
            ]}
          >
            <TrendingUp size={16} color={theme.brand} strokeWidth={2.2} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textMain }]}>
            {potentialSavings}
          </Text>
          <Text
            style={[styles.metricLabel, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            Potential savi...
          </Text>
        </View>
      </View>

      {/* ================= 7. COMPARISON & DETAIL ROWS ================= */}
      <View style={styles.detailRowsWrapper}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.detailRowCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          <View style={styles.detailRowLeft}>
            <Text style={[styles.detailRowTitle, { color: theme.textMain }]}>
              Compare with previous month
            </Text>
            <Text style={[styles.detailRowSubtitle, { color: theme.textMuted }]}>
              +14.2% higher than October
            </Text>
          </View>
          <ChevronRight size={18} color={theme.textMuted} strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.detailRowCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          <View style={styles.detailRowLeft}>
            <Text style={[styles.detailRowTitle, { color: theme.textMain }]}>
              Detailed Category Breakdown
            </Text>
            <Text style={[styles.detailRowSubtitle, { color: theme.textMuted }]}>
              4 primary expense streams
            </Text>
          </View>
          <ChevronRight size={18} color={theme.textMuted} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120, // space for bottom dock
  },

  // 1. Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // 2. Segmented switcher
  segmentWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  segmentContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 24,
    padding: 3,
    borderWidth: 1,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13.5,
    letterSpacing: -0.2,
  },

  // 3. Month Navigator
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  monthArrowBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
  },

  // 4. Category Filter Chips
  categoryChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingRight: 10,
  },
  gridIconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
  },
  chipCloseIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 5. Hero Bar Chart Card
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 190,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: '100%',
  },
  barAmountText: {
    fontSize: 9.5,
    marginBottom: 4,
  },
  dashedGuideline: {
    width: 1,
    height: 14,
    borderWidth: 0.8,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  capsuleBar: {
    width: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    marginBottom: 8,
  },
  capsuleInnerHighlight: {
    width: 22,
    height: 6,
    borderRadius: 3,
  },
  monthLabel: {
    fontSize: 12,
  },

  // 6. Metrics 3-Column Row
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // 7. Detail Rows
  detailRowsWrapper: {
    gap: 10,
  },
  detailRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRowLeft: {
    flex: 1,
  },
  detailRowTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailRowSubtitle: {
    fontSize: 12,
  },
});
