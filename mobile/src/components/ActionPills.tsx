import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      icon: <ArrowUpRight size={19} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressSend,
    },
    {
      id: 'request',
      label: 'Request',
      icon: <ArrowDownLeft size={19} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressRequest,
    },
    {
      id: 'topup',
      label: 'TopUp',
      icon: <CreditCard size={19} color={KOVA_COLORS.textMain} strokeWidth={2.2} />,
      onPress: onPressTopUp,
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal size={19} color={KOVA_COLORS.textMain} strokeWidth={2.4} />,
      onPress: onPressMore,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <View key={action.id} style={styles.actionItem}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={action.onPress}
            style={styles.buttonShadowWrapper}
          >
            {/* SaaS 3D Tactile Disc Surface */}
            <LinearGradient
              colors={['#FFFFFF', '#F8F7F3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.circleButton}
            >
              {action.icon}
            </LinearGradient>
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
  /* SaaS 3D Tactile Keycap Shadow & Bottom Lip */
  buttonShadowWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DCDAD1', // The 3D bottom bevel lip
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    paddingBottom: 2.5, // Creates the physical 3D thickness
  },
  circleButton: {
    flex: 1,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: '#E6E4DC',
    borderTopColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: KOVA_COLORS.textMuted,
    letterSpacing: -0.2,
  },
});
