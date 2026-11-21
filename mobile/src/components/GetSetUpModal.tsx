import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Check,
  ChevronRight,
  X,
  CreditCard,
  Wallet,
  Cloud,
  Target,
  Sparkles,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export interface SetupStep {
  id: string;
  num: number;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel?: string;
  icon: 'wallet' | 'bill' | 'target' | 'cloud' | 'sparkles';
}

interface GetSetUpModalProps {
  visible: boolean;
  onClose: () => void;
  onDismissFromHome: () => void;
  onNavigateToPocket?: () => void;
  onNavigateToBills?: () => void;
  onNavigateToAuth?: () => void;
}

export const GetSetUpModal: React.FC<GetSetUpModalProps> = ({
  visible,
  onClose,
  onDismissFromHome,
  onNavigateToPocket,
  onNavigateToBills,
  onNavigateToAuth,
}) => {
  const theme = useAppTheme();
  const { user } = useAuth();

  const steps: SetupStep[] = [
    {
      id: 'step-1',
      num: 1,
      title: 'Account Initialized',
      description: user
        ? `Logged in as ${user.email}`
        : 'Local guest profile active',
      isCompleted: true,
      icon: 'sparkles',
    },
    {
      id: 'step-2',
      num: 2,
      title: 'Wallets & Cash Configured',
      description: 'HDFC Checking, SBI Savings, and Cash ledger set up',
      isCompleted: true,
      actionLabel: 'View Wallets',
      icon: 'wallet',
    },
    {
      id: 'step-3',
      num: 3,
      title: 'Add Recurring Bills & Subscriptions',
      description: 'Track utilities, streaming, rent, and monthly commitments',
      isCompleted: false,
      actionLabel: 'Add Bill',
      icon: 'bill',
    },
    {
      id: 'step-4',
      num: 4,
      title: 'Set Monthly Savings Target',
      description: 'Set an automated target to build financial resilience',
      isCompleted: false,
      actionLabel: 'Set Goal',
      icon: 'target',
    },
    {
      id: 'step-5',
      num: 5,
      title: 'Cloud Backup & Sync',
      description: user
        ? 'Connected to PostgreSQL Cloud'
        : 'Sign in with Supabase to sync data across devices',
      isCompleted: !!user,
      actionLabel: user ? 'Synced' : 'Connect',
      icon: 'cloud',
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const handleStepAction = (step: SetupStep) => {
    onClose();
    if (step.id === 'step-2' || step.id === 'step-4') {
      onNavigateToPocket?.();
    } else if (step.id === 'step-3') {
      onNavigateToBills?.();
    } else if (step.id === 'step-5' && !user) {
      onNavigateToAuth?.();
    }
  };

  const renderIcon = (icon: SetupStep['icon'], color: string) => {
    switch (icon) {
      case 'wallet':
        return <Wallet size={16} color={color} strokeWidth={2.2} />;
      case 'bill':
        return <CreditCard size={16} color={color} strokeWidth={2.2} />;
      case 'target':
        return <Target size={16} color={color} strokeWidth={2.2} />;
      case 'cloud':
        return <Cloud size={16} color={color} strokeWidth={2.2} />;
      case 'sparkles':
      default:
        return <Sparkles size={16} color={color} strokeWidth={2.2} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'web' ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Sheet Container */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.isDark ? '#141414' : '#FFFFFF',
              borderColor: theme.borderSubtle,
            },
          ]}
        >
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.title, { color: theme.textMain }]}>Get Set Up</Text>
                  <Text style={[styles.subtitle, { color: theme.textDim }]}>
                    {completedCount} of {steps.length} complete • {progressPercent}% finished
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <X size={16} color={theme.textMain} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Progress Bar Track */}
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
                ]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                    },
                  ]}
                />
              </View>

              {/* Steps List */}
              <ScrollView
                style={styles.stepsList}
                showsVerticalScrollIndicator={false}
              >
                {steps.map((step) => {
                  return (
                    <TouchableOpacity
                      key={step.id}
                      activeOpacity={0.8}
                      onPress={() => handleStepAction(step)}
                      style={[
                        styles.stepCard,
                        {
                          backgroundColor: theme.surfaceSubtle,
                          borderColor: theme.borderSubtle,
                        },
                      ]}
                    >
                      {/* Left Status Icon */}
                      <View
                        style={[
                          styles.stepBadge,
                          step.isCompleted
                            ? {
                                backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                                borderColor: theme.isDark ? '#23F07D' : '#10B981',
                              }
                            : {
                                backgroundColor: theme.surface,
                                borderColor: theme.borderSubtle,
                              },
                        ]}
                      >
                        {step.isCompleted ? (
                          <Check
                            size={13}
                            color={theme.isDark ? '#07170D' : '#FFFFFF'}
                            strokeWidth={2.6}
                          />
                        ) : (
                          <Text style={[styles.stepNumText, { color: theme.textDim }]}>
                            {step.num}
                          </Text>
                        )}
                      </View>

                      {/* Content */}
                      <View style={styles.stepContent}>
                        <View style={styles.stepTitleRow}>
                          <Text
                            style={[
                              styles.stepTitle,
                              {
                                color: step.isCompleted ? theme.textDim : theme.textMain,
                                textDecorationLine: step.isCompleted ? 'line-through' : 'none',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {step.title}
                          </Text>
                        </View>
                        <Text
                          style={[styles.stepDesc, { color: theme.textDim }]}
                          numberOfLines={2}
                        >
                          {step.description}
                        </Text>
                      </View>

                      {/* Action Pill / Chevron */}
                      {step.actionLabel && !step.isCompleted ? (
                        <View
                          style={[
                            styles.actionPill,
                            {
                              backgroundColor: theme.surface,
                              borderColor: theme.borderSubtle,
                            },
                          ]}
                        >
                          <Text style={[styles.actionPillText, { color: theme.textMain }]}>
                            {step.actionLabel}
                          </Text>
                          <ChevronRight size={13} color={theme.textDim} strokeWidth={2.2} />
                        </View>
                      ) : (
                        <ChevronRight size={16} color={theme.textDim} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Bottom Actions */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onDismissFromHome();
                    onClose();
                  }}
                  style={[
                    styles.dismissBtn,
                    {
                      borderColor: theme.borderSubtle,
                      backgroundColor: theme.surfaceSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.dismissBtnText, { color: theme.textDim }]}>
                    Hide Banner from Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[
                    styles.doneBtn,
                    {
                      backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.doneBtnText,
                      { color: theme.isDark ? '#07170D' : '#FFFFFF' },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 18,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepsList: {
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  stepDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
