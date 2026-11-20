import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, CreditCard, MoreHorizontal } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

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
  const theme = useAppTheme();

  const actions = [
    {
      id: 'send',
      label: 'Send',
      icon: <ArrowUpRight size={19} color={theme.iconColor} strokeWidth={2.4} />,
      onPress: onPressSend,
    },
    {
      id: 'request',
      label: 'Request',
      icon: <ArrowDownLeft size={19} color={theme.iconColor} strokeWidth={2.4} />,
      onPress: onPressRequest,
    },
    {
      id: 'topup',
      label: 'TopUp',
      icon: <CreditCard size={19} color={theme.iconColor} strokeWidth={2.2} />,
      onPress: onPressTopUp,
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal size={19} color={theme.iconColor} strokeWidth={2.4} />,
      onPress: onPressMore,
    },
  ];

  return (
    <View
      style={[
        styles.cardWrapper,
        {
          backgroundColor: theme.cardContainer,
          borderColor: theme.cardContainerBorder,
        },
      ]}
    >
      <View style={styles.container}>
        {actions.map((action) => (
          <View key={action.id} style={styles.actionItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={action.onPress}
              style={[
                styles.circleButton,
                {
                  backgroundColor: theme.actionPillBg,
                  borderColor: theme.actionPillBorder,
                },
              ]}
            >
              {action.icon}
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.actionPillLabel }]}>
              {action.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  /* Clean Apple Wallet Circular Disc (Flat, minimal, matching symbol background) */
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
