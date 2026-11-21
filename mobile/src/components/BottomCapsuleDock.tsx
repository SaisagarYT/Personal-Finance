import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Wallet, ListTodo } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

export type NavTabId = 'sinance' | 'tasks' | 'home' | 'cards' | 'analytics' | 'profile';

interface BottomCapsuleDockProps {
  activeTab?: NavTabId;
  onSelectTab?: (tab: NavTabId) => void;
}

export const BottomCapsuleDock: React.FC<BottomCapsuleDockProps> = ({
  activeTab = 'sinance',
  onSelectTab,
}) => {
  const theme = useAppTheme();
  const pillSpring = useRef(new Animated.Value(1)).current;

  // Normalize tab to 'sinance' or 'tasks'
  const normalizedActive: 'sinance' | 'tasks' =
    activeTab === 'tasks' ? 'tasks' : 'sinance';

  useEffect(() => {
    pillSpring.setValue(0.86);
    Animated.spring(pillSpring, {
      toValue: 1,
      friction: 4,
      tension: 130,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const tabs = [
    {
      id: 'sinance' as NavTabId,
      label: 'Sinance',
      icon: (isActive: boolean) => (
        <Wallet
          size={18}
          color={isActive ? theme.dockActivePillText : '#FFFFFF'}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
    {
      id: 'tasks' as NavTabId,
      label: 'Tasks',
      icon: (isActive: boolean) => (
        <ListTodo
          size={18}
          color={isActive ? theme.dockActivePillText : '#FFFFFF'}
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
          const isActive = normalizedActive === tab.id;
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
                {/* Only display name when tab is selected */}
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
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
    borderRadius: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  activeTabLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  inactiveTabCircle: {
    width: 48,
    borderRadius: 24,
  },
});
