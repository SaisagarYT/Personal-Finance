import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, Target, ChevronRight } from 'lucide-react-native';

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
  return (
    <View style={styles.container}>
      {/* ================= CARD 1: AUTOMATIC SAVING RULE ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressAutomaticRule}
        style={styles.ruleCard}
      >
        <View style={styles.leftRow}>
          {/* Emerald Star Badge */}
          <View style={styles.iconBadge}>
            <Star size={18} color="#23F07D" fill="#23F07D" />
          </View>

          {/* Titles */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Automatic</Text>
            <Text style={styles.subtitleText}>First Active saving rule</Text>
          </View>
        </View>

        {/* Right Values */}
        <View style={styles.rightContainer}>
          <Text style={styles.amountText}>{automaticAmount}</Text>
          <Text style={styles.sinceText}>Since All Time</Text>
        </View>
      </TouchableOpacity>

      {/* ================= CARD 2: 1P CHALLENGE ================= */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressChallenge}
        style={styles.ruleCard}
      >
        <View style={styles.leftRow}>
          {/* Emerald Target/Pin Badge */}
          <View style={styles.iconBadge}>
            <Target size={18} color="#23F07D" strokeWidth={2.4} />
          </View>

          {/* Titles */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>1P Challenge</Text>
            <Text style={styles.subtitleText}>Set aside $667 in a year</Text>
          </View>
        </View>

        {/* Right Chevron */}
        <View style={styles.chevronWrapper}>
          <ChevronRight size={19} color="#71717A" strokeWidth={2.2} />
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
    backgroundColor: '#161616',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#242426',
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
    backgroundColor: 'rgba(35, 240, 125, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(35, 240, 125, 0.22)',
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
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
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
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sinceText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A1A1AA',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  chevronWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
