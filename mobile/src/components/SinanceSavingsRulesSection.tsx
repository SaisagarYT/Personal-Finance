import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, Target, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface SinanceSavingsRulesSectionProps {
  automaticAmount?: string;
  onPressAutomaticRule?: () => void;
  onPressChallenge?: () => void;
}

export const SinanceSavingsRulesSection: React.FC<SinanceSavingsRulesSectionProps> = ({
  automaticAmount = '$150.87',
  onPressAutomaticRule,
  onPressChallenge,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* ================= CARD 1: AUTOMATIC SAVING RULE ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressAutomaticRule}
        style={[
          styles.ruleCard,
          {
            backgroundColor: theme.cardContainer,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <View style={styles.leftRow}>
          {/* Emerald Star Badge */}
          <View style={[styles.iconBadge, { backgroundColor: theme.forestBadgeBg, borderColor: theme.brandMedium }]}>
            <Star size={18} color={theme.brand} fill={theme.brand} />
          </View>

          {/* Titles */}
          <View style={styles.textContainer}>
            <Text style={[styles.titleText, { color: theme.textMain }]}>Automatic</Text>
            <Text style={[styles.subtitleText, { color: theme.textMuted }]}>First Active saving rule</Text>
          </View>
        </View>

        {/* Right Values */}
        <View style={styles.rightContainer}>
          <Text style={[styles.amountText, { color: theme.textMain }]}>{automaticAmount}</Text>
          <Text style={[styles.sinceText, { color: theme.textMuted }]}>Since All Time</Text>
        </View>
      </TouchableOpacity>

      {/* ================= CARD 2: 1P CHALLENGE ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressChallenge}
        style={[
          styles.ruleCard,
          {
            backgroundColor: theme.cardContainer,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <View style={styles.leftRow}>
          {/* Emerald Target/Pin Badge */}
          <View style={[styles.iconBadge, { backgroundColor: theme.forestBadgeBg, borderColor: theme.brandMedium }]}>
            <Target size={18} color={theme.brand} strokeWidth={2.4} />
          </View>

          {/* Titles */}
          <View style={styles.textContainer}>
            <Text style={[styles.titleText, { color: theme.textMain }]}>1P Challenge</Text>
            <Text style={[styles.subtitleText, { color: theme.textMuted }]}>Set aside $667 in a year</Text>
          </View>
        </View>

        {/* Right Chevron */}
        <View style={styles.chevronWrapper}>
          <ChevronRight size={19} color={theme.textDim} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 2,
    marginBottom: 20,
    width: '100%',
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    minHeight: 68,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 14,
    justifyContent: 'center',
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sinceText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  chevronWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
