import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

interface HeaderBarProps {
  userName?: string;
  subtitle?: string;
  onPressMenu?: () => void;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  userName = 'Sagar',
  subtitle = "Let's save your money.",
  onPressMenu,
  onPressNotifications,
  onPressProfile,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* 1. Top Icons Bar: Menu on Left, Notifications & Avatar on Right */}
      <View style={styles.topIconRow}>
        {/* Left: Minimal Menu Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressMenu}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.iconButtonBg,
              borderColor: theme.iconButtonBorder,
            },
          ]}
        >
          <Menu size={18} color={theme.iconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Right: Bell & Avatar Profile */}
        <View style={styles.rightIconsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressNotifications}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.iconButtonBg,
                borderColor: theme.iconButtonBorder,
              },
            ]}
          >
            <Bell size={17} color={theme.iconColor} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressProfile}
            style={[
              styles.avatarButton,
              {
                backgroundColor: theme.iconButtonBg,
                borderColor: theme.iconButtonBorder,
              },
            ]}
          >
            <View style={[styles.avatarInner, { backgroundColor: theme.avatarInnerBg }]}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Greeting Section: Bold Greeting + Soft Subtitle */}
      <View style={styles.greetingSection}>
        <Text style={[styles.greetingTitle, { color: theme.textMain }]}>Hello {userName}!</Text>
        <Text style={[styles.greetingSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 16,
  },
  topIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  greetingSection: {
    gap: 4,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
