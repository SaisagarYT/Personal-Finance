import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Home, Wallet, BarChart2, User } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

export type NavTabId = 'home' | 'cards' | 'analytics' | 'profile';

interface BottomCapsuleDockProps {
  activeTab?: NavTabId;
  onSelectTab?: (tab: NavTabId) => void;
}

export const BottomCapsuleDock: React.FC<BottomCapsuleDockProps> = ({
  activeTab = 'home',
  onSelectTab,
}) => {
  const theme = useAppTheme();
  const pillSpring = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    pillSpring.setValue(0.86);
    Animated.spring(pillSpring, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const tabs = [
    {
      id: 'home' as NavTabId,
      label: 'Home',
      icon: (isActive: boolean) => (
        <Home
          size={18}
          color={isActive ? theme.dockActivePillText : theme.dockInactiveIconColor}
          fill={isActive ? theme.dockActivePillText : 'none'}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
    {
      id: 'cards' as NavTabId,
      label: 'Cards',
      icon: (isActive: boolean) => (
        <Wallet
          size={18}
          color={isActive ? theme.dockActivePillText : theme.dockInactiveIconColor}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
    {
      id: 'analytics' as NavTabId,
      label: 'Stats',
      icon: (isActive: boolean) => (
        <BarChart2
          size={18}
          color={isActive ? theme.dockActivePillText : theme.dockInactiveIconColor}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
    {
      id: 'profile' as NavTabId,
      label: 'Profile',
      icon: (isActive: boolean) => (
        <User
          size={18}
          color={isActive ? theme.dockActivePillText : theme.dockInactiveIconColor}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
  ];

  return (
    <View pointerEvents="box-none" style={styles.dockOuterContainer}>
      <View
        style={[
          styles.dockShell,
          {
            backgroundColor: theme.dockShellBg,
            borderColor: theme.dockShellBorder,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => onSelectTab?.(tab.id)}
            >
              <Animated.View
                style={[
                  styles.tabBase,
                  isActive
                    ? [styles.activeTabPill, { backgroundColor: theme.dockActivePillBg }]
                    : [styles.inactiveTabCircle, { backgroundColor: theme.dockInactiveTabBg }],
                  isActive && { transform: [{ scale: pillSpring }] },
                ]}
              >
                {tab.icon(isActive)}
                {isActive && (
                  <Text style={[styles.activeTabLabel, { color: theme.dockActivePillText }]}>
                    {tab.label}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockOuterContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dockShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 36,
    padding: 6,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
  },
  tabBase: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    paddingHorizontal: 18,
    gap: 7,
  },
  activeTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inactiveTabCircle: {
    width: 48,
    borderRadius: 24,
  },
});
