import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/colors';
import { User, LogOut, Cloud, ShieldCheck, X } from 'lucide-react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onOpenAuth,
}) => {
  const theme = useAppTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User';
  const displayEmail = user?.email || 'Not signed in';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.cardContainer,
                  borderColor: theme.cardContainerBorder,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.titleRow}>
                  <View style={[styles.avatarDisc, { backgroundColor: theme.brand }]}>
                    <Text style={[styles.avatarInitial, { color: theme.forestDark }]}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.textMain }]}>
                      {displayName}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textMuted }]}>
                      {displayEmail}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
                  ]}
                >
                  <X size={18} color={theme.textMain} />
                </TouchableOpacity>
              </View>

              {/* Status Pill */}
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.statusLeft}>
                  <Cloud size={18} color={user ? theme.brand : theme.textDim} />
                  <View>
                    <Text style={[styles.statusTitle, { color: theme.textMain }]}>
                      {user ? 'Cloud Sync Active' : 'Offline / Guest Mode'}
                    </Text>
                    <Text style={[styles.statusSub, { color: theme.textMuted }]}>
                      {user
                        ? 'Supabase PostgreSQL cloud synchronization enabled'
                        : 'Sign in to sync your data across devices & web'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                {user ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSignOut}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    <LogOut size={18} color="#EF4444" />
                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    style={[styles.primaryActionBtn, { backgroundColor: theme.isDark ? '#23F07D' : '#10B981' }]}
                  >
                    <User size={18} color={theme.isDark ? '#07170D' : '#FFFFFF'} />
                    <Text style={[styles.primaryActionBtnText, { color: theme.isDark ? '#07170D' : '#FFFFFF' }]}>
                      Sign In / Create Account
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Security Footnote */}
              <View style={styles.footnoteRow}>
                <ShieldCheck size={13} color={theme.textDim} />
                <Text style={[styles.footnoteText, { color: theme.textDim }]}>
                  Row Level Security active on all tables
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarDisc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    maxWidth: 260,
  },
  actionSection: {
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryActionBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  footnoteText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
