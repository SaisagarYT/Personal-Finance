import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, CreditCard, MoreHorizontal } from 'lucide-react-native';
import { KOVA_COLORS } from '../theme/colors';

interface ActionPillsProps {
  onPressSend?: () => void;
  onPressRequest?: () => void;
  onPressTopUp?: () => void;
  onPressMore?: () => void;
}

export const ActionPills: React.FC<ActionPillsProps> = ({
  onPressSend,
  onPressRequest,
  onPressTopUp,
  onPressMore,
}) => {
  const actions = [
    {
      id: 'send',
      label: 'Send',
      icon: <ArrowUpRight size={20} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressSend,
    },
    {
      id: 'request',
      label: 'Request',
      icon: <ArrowDownLeft size={20} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressRequest,
    },
    {
      id: 'topup',
      label: 'TopUp',
      icon: <CreditCard size={20} color={KOVA_COLORS.textMain} strokeWidth={2.2} />,
      onPress: onPressTopUp,
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal size={20} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressMore,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <View key={action.id} style={styles.actionItem}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={action.onPress}
            style={styles.circleButton}
          >
            {action.icon}
          </TouchableOpacity>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    marginTop: 18,
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  circleButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: KOVA_COLORS.surface,
    borderWidth: 1,
    borderColor: KOVA_COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: KOVA_COLORS.textMuted,
    letterSpacing: -0.2,
  },
});
