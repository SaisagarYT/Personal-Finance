import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface SinanceActivitySectionProps {
  brainAmount?: string;
  sinceAllTimeLabel?: string;
  dailyCashSubtitle?: string;
  isBrainActive?: boolean;
  onPressBrainCard?: () => void;
  onPressActivityCard?: () => void;
}

export const SinanceActivitySection: React.FC<SinanceActivitySectionProps> = ({
  brainAmount = '$142.83',
  sinceAllTimeLabel = 'Since All Time',
  dailyCashSubtitle = '+$15.43 Daily Cash',
  isBrainActive = false,
  onPressBrainCard,
  onPressActivityCard,
}) => {
  const theme = useAppTheme();
  // Local interaction state so it turns white upon touch/press
  const [isPressed, setIsPressed] = useState(false);

  // Active if passed from parent or currently being pressed
  const isWhite = isBrainActive || isPressed;

  // 7 weekly activity data points (Monday through Sunday)
  // Thursday is the peak active day highlighted with EcoFin Green
  const weeklyBars = [
    { day: 'M', height: 10, isHighlight: false },
    { day: 'T', height: 16, isHighlight: false },
    { day: 'W', height: 22, isHighlight: false },
    { day: 'T', height: 36, isHighlight: true }, // Peak day
    { day: 'F', height: 26, isHighlight: false },
    { day: 'S', height: 18, isHighlight: false },
    { day: 'S', height: 32, isHighlight: false },
  ];

  return (
    <View style={styles.container}>
      {/* ================= LEFT CARD: BRAIN CARD (TURNS WHITE ON INTERACTION/ACTIVE) ================= */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPressBrainCard}
        style={[
          styles.brainCardBase,
          {
            backgroundColor: isWhite ? theme.surface : theme.cardContainer,
            borderColor: isWhite ? theme.surface : theme.borderSubtle,
          },
        ]}
      >
        {/* Top Header: Flame Icon & Brain Label */}
        <View style={styles.brainHeaderRow}>
          <Flame
            size={18}
            color={isWhite ? theme.forestDark : theme.textMain}
            fill={isWhite ? theme.forestDark : 'none'}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.brainTitle,
              { color: isWhite ? theme.forestDark : theme.textMain },
            ]}
          >
            Brain
          </Text>
        </View>

        {/* Amount & Timeframe */}
        <View style={styles.brainValueContainer}>
          <Text
            style={[
              styles.brainAmount,
              { color: isWhite ? theme.forestDark : theme.textMain },
            ]}
          >
            {brainAmount}
          </Text>
          <Text
            style={[
              styles.brainSubtitle,
              { color: isWhite ? theme.textDim : theme.textMuted },
            ]}
          >
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
          <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>{dailyCashSubtitle}</Text>
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
  brainCardBase: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 126,
    borderWidth: 1,
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
    letterSpacing: -0.2,
  },
  brainValueContainer: {
    marginTop: 18,
  },
  brainAmount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brainSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
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
