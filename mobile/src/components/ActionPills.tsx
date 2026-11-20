import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
          borderWidth: theme.isDark ? 1 : 0,
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
                styles.buttonShadowWrapper,
                { backgroundColor: theme.actionPillLip },
              ]}
            >
              {/* SaaS 3D Tactile Disc Surface */}
              <LinearGradient
                colors={theme.isDark ? ['#2A2A2E', '#1C1C1F'] : ['#FFFFFF', '#F8F7F3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                  styles.circleButton,
                  {
                    borderColor: theme.actionPillBorder,
                    borderTopColor: theme.isDark ? '#3D3D44' : '#FFFFFF',
                  },
                ]}
              >
                {action.icon}
              </LinearGradient>
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
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
  /* SaaS 3D Tactile Keycap Shadow & Bottom Lip */
  buttonShadowWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    paddingBottom: 2.5, // Creates the physical 3D thickness
  },
  circleButton: {
    flex: 1,
    borderRadius: 27,
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
