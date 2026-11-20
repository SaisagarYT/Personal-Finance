import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Wallet, BarChart2, User } from 'lucide-react-native';

export type NavTabId = 'home' | 'cards' | 'analytics' | 'profile';

interface BottomCapsuleDockProps {
  activeTab?: NavTabId;
  onSelectTab?: (tab: NavTabId) => void;
}

export const BottomCapsuleDock: React.FC<BottomCapsuleDockProps> = ({
  activeTab = 'home',
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'home' as NavTabId,
      label: 'Home',
      icon: (isActive: boolean) => (
        <Home
          size={18}
          color={isActive ? '#0C0C0D' : '#FFFFFF'}
          fill={isActive ? '#0C0C0D' : 'none'}
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
          color={isActive ? '#0C0C0D' : '#FFFFFF'}
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
          color={isActive ? '#0C0C0D' : '#FFFFFF'}
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
          color={isActive ? '#0C0C0D' : '#FFFFFF'}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      ),
    },
  ];

  return (
    <View pointerEvents="box-none" style={styles.dockOuterContainer}>
      <View style={styles.dockShell}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => onSelectTab?.(tab.id)}
              style={[
                styles.tabBase,
                isActive ? styles.activeTabPill : styles.inactiveTabCircle,
              ]}
            >
              {tab.icon(isActive)}
              {isActive && <Text style={styles.activeTabLabel}>{tab.label}</Text>}
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
    backgroundColor: '#0C0C0D',
    borderRadius: 36,
    padding: 6,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#1E1E22',
  },
  tabBase: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    gap: 7,
  },
  activeTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C0C0D',
    letterSpacing: -0.2,
  },
  inactiveTabCircle: {
    width: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
