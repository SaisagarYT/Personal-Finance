import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Animated,
  Easing,
  Image,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SinanceHeroCard } from './src/components/SinanceHeroCard';
import { SinanceActivitySection } from './src/components/SinanceActivitySection';
import { UpcomingBillsSection, BillItem } from './src/components/UpcomingBillsSection';
import { AllBillsModal } from './src/components/AllBillsModal';
import { SinsBrainModal } from './src/components/SinsBrainModal';
import { BottomCapsuleDock, NavTabId } from './src/components/BottomCapsuleDock';
import { StatsView } from './src/screens/StatsView';
import { SinancePocketScreen } from './src/screens/SinancePocketScreen';
import { TaskManagerScreen } from './src/screens/TaskManagerScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { GetSetUpModal } from './src/components/GetSetUpModal';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider, ToastHost } from './src/context/ToastContext';
import { FinanceService, Account, Transaction } from './src/services/financeService';
import { SubscriptionService } from './src/services/subscriptionService';
import { ProfileService, UserProfile } from './src/services/profileService';
import { useAppTheme } from './src/theme/colors';

function AppContent() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const screenHeight = windowHeight || 900;

  // Prevent white edges and eliminate browser scrollbar gutter lines on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
      const doc = (globalThis as any).document;
      if (doc) {
        doc.documentElement.style.backgroundColor = theme.canvas;
        doc.body.style.backgroundColor = theme.canvas;
        doc.body.style.overflowX = 'hidden';

        const styleId = 'sinance-hide-scrollbars';
        let styleTag = doc.getElementById(styleId);
        if (!styleTag) {
          styleTag = doc.createElement('style');
          styleTag.id = styleId;
          doc.head.appendChild(styleTag);
        }
        styleTag.textContent = `
          html, body, #root {
            background-color: ${theme.canvas} !important;
            overflow-x: hidden !important;
          }
          * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
        `;
      }
    }
  }, [theme.canvas]);

  const getQueryParam = (key: string): string | null => {
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && (globalThis as any).window) {
      return new URLSearchParams((globalThis as any).window.location.search).get(key);
    }
    return null;
  };

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    const t = getQueryParam('tab') as NavTabId | null;
    return t || 'sinance';
  });
  const [isPocketOpen, setIsPocketOpen] = useState(() => {
    return getQueryParam('pocket') === 'true';
  });
  const initialProfileOpen = getQueryParam('profile') === 'true';
  const [isProfileMounted, setIsProfileMounted] = useState(initialProfileOpen);
  const [isAvatarFlying, setIsAvatarFlying] = useState(false);
  const [isProfileSettled, setIsProfileSettled] = useState(initialProfileOpen);
  const profileAnim = useRef(new Animated.Value(initialProfileOpen ? 1 : 0)).current;

  const handleOpenProfile = () => {
    setIsProfileMounted(true);
    setIsAvatarFlying(true);
    setIsProfileSettled(false);

    Animated.timing(profileAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsAvatarFlying(false);
      setIsProfileSettled(true);
    });
  };

  const handleCloseProfile = () => {
    setIsAvatarFlying(true);
    setIsProfileSettled(false);

    Animated.timing(profileAnim, {
      toValue: 0,
      duration: 320,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsAvatarFlying(false);
      setIsProfileMounted(false);
      setIsProfileSettled(false);
    });
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    return getQueryParam('auth') === 'true';
  });
  const [isAllBillsOpen, setIsAllBillsOpen] = useState(false);
  const [isSinsBrainOpen, setIsSinsBrainOpen] = useState(false);
  const [isSetupDismissed, setIsSetupDismissed] = useState(() => {
    return getQueryParam('setup_dismissed') === 'true';
  });
  const [isGetSetUpModalOpen, setIsGetSetUpModalOpen] = useState(() => {
    return getQueryParam('setup_modal') === 'true';
  });

  // Cloud Financial Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<BillItem[]>([
    {
      id: 'netflix',
      name: 'Netflix Premium',
      category: 'streaming',
      amount: '₹649.00',
      dueDate: '24 Nov',
      dueCountdown: 'Due in 3 days',
      isAutoPay: true,
    },
    {
      id: 'airtel',
      name: 'Airtel Xstream Fibre',
      category: 'internet',
      amount: '₹999.00',
      dueDate: '28 Nov',
      dueCountdown: 'Due in 7 days',
      isAutoPay: false,
    },
  ]);
  const [totalBalance, setTotalBalance] = useState<number>(240250);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Dynamic Onboarding Milestone Evaluation
  const completedStepsCount = useMemo(() => {
    let count = 0;
    if (user) count++;
    if (accounts.length > 0) count++;
    if (bills.length > 0) count++;
    if (transactions.length > 0) count++;
    if (userProfile?.name && userProfile.name.trim().length > 0) count++;
    return count;
  }, [user, accounts.length, bills.length, transactions.length, userProfile?.name]);

  const onboardingHeadline = completedStepsCount === 5
    ? 'All 5 steps complete'
    : `${completedStepsCount} of 5 complete`;

  const onboardingDetailText = useMemo(() => {
    if (completedStepsCount === 5) {
      return 'Your financial workspace is fully configured and tracking.';
    }
    if (!user) {
      return 'Connect your account to Supabase to enable cloud backup & sync.';
    }
    if (accounts.length === 0) {
      return 'Connect checking, savings, or UPI cash ledger to calculate net worth.';
    }
    if (bills.length === 0) {
      return 'Track recurring subscriptions and upcoming utilities.';
    }
    if (transactions.length === 0) {
      return 'Record your first expense or income to activate analytics.';
    }
    return 'Complete your ledger setup to unlock maximum financial clarity.';
  }, [completedStepsCount, user, accounts.length, bills.length, transactions.length]);

  // Upper section synchronized spring elastic effect when switching tabs
  const upperSpring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    upperSpring.setValue(0);
    Animated.spring(upperSpring, {
      toValue: 1,
      friction: 4.5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // Load Real Data from Supabase & Cache
  useEffect(() => {
    let isMounted = true;

    async function fetchCloudData() {
      try {
        setLoadingData(true);
        const [accRes, txRes, subRes] = await Promise.all([
          FinanceService.getAccounts(user?.id),
          FinanceService.getTransactions(user?.id, 15),
          SubscriptionService.getSubscriptions(user?.id),
        ]);

        if (isMounted) {
          if (accRes.data && accRes.data.length > 0) {
            setAccounts(accRes.data);
            const total = FinanceService.calculateTotalBalance(accRes.data);
            setTotalBalance(total);
          } else {
            // Default demo balance if new empty account
            setTotalBalance(240250);
          }

          if (txRes.data && txRes.data.length > 0) {
            setTransactions(txRes.data);
          }

          if (subRes.billItems && subRes.billItems.length > 0) {
            setBills(subRes.billItems);
          }
        }
      } catch (err) {
        console.warn('Failed to load cloud finance data:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    fetchCloudData();
    ProfileService.getProfile(user?.id).then((prof) => {
      if (isMounted) setUserProfile(prof);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Format currency display string
  const formatBalance = (amount: number) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const usd = (amount / 86.5).toFixed(2);
    return `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formattedBalance = formatBalance(totalBalance);
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || (user ? 'Member' : 'Sagar');

  const isSinanceTab = activeTab === 'sinance' || activeTab === 'home' || activeTab === 'cards' || activeTab === 'analytics';

  return (
    <View style={[styles.outerWrapper, { backgroundColor: theme.canvas }]}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              isSinanceTab && !isPocketOpen && activeTab !== 'analytics'
                ? theme.heroCardBg
                : theme.canvas,
          },
        ]}
      >
        <StatusBar
          style={
            isSinanceTab && !isPocketOpen && activeTab !== 'analytics'
              ? 'dark'
              : theme.isDark
              ? 'light'
              : 'dark'
          }
        />
        <View style={[styles.mainContainer, { backgroundColor: theme.canvas }]}>
          {/* ================= PRIMARY SCREEN CONTENT WRAPPER WITH MOTION DEPTH ================= */}
          <Animated.View
            style={[
              styles.screenContentWrapper,
              {
                opacity: profileAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.7],
                }),
                transform: [
                  {
                    scale: profileAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.98],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={isProfileMounted ? 'none' : 'auto'}
          >
            {activeTab === 'tasks' ? (
              /* ================= TAB 2: TASKS & GOALS BOARD ================= */
              <TaskManagerScreen
                onOpenProfile={handleOpenProfile}
              />
            ) : isPocketOpen || activeTab === 'cards' ? (
              /* ================= POCKET DETAIL SCREEN ================= */
              <SinancePocketScreen
                onBack={() => {
                  setIsPocketOpen(false);
                  setActiveTab('sinance');
                }}
                balance={formattedBalance}
                availableBalance="₹0 Available"
                accounts={accounts}
                transactions={transactions}
                onAccountCreated={(newAcc) => {
                  setAccounts((prev) => [...prev, newAcc]);
                  setTotalBalance((prev) => prev + Number(newAcc.balance));
                }}
                onTransactionAdded={(newTx) => {
                  setTransactions((prev) => [newTx, ...prev]);
                  const delta = newTx.type === 'income' ? Number(newTx.amount) : -Number(newTx.amount);
                  setTotalBalance((prev) => Math.max(0, prev + delta));
                  setAccounts((prev) =>
                    prev.map((acc) => {
                      if (acc.id === newTx.account_id) {
                        return {
                          ...acc,
                          balance: Math.max(0, Number(acc.balance) + delta),
                        };
                      }
                      return acc;
                    })
                  );
                }}
              />
            ) : activeTab === 'analytics' ? (
              /* ================= STATS VIEW SCREEN ================= */
              <StatsView
                onBack={() => setActiveTab('sinance')}
                currency={currency}
              />
            ) : (
              /* ================= TAB 1: SINANCE CORE HOME SCREEN ================= */
              <ScrollView
                style={[styles.container, { backgroundColor: theme.canvas }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* SECTION 1: SINANCE HERO CARD */}
                <SinanceHeroCard
                  userName={userProfile?.name || userName}
                  avatarUri={userProfile?.avatarUri}
                  balance={formattedBalance}
                  pastWeekDiff="+₹1,940 past week"
                  onboardingStep={onboardingHeadline}
                  onboardingText={onboardingDetailText}
                  isSetupDismissed={isSetupDismissed}
                  onPressAvatar={handleOpenProfile}
                  onPressNotification={handleOpenProfile}
                  onPressDismissSetup={() => setIsSetupDismissed(true)}
                  onPressGetSetUp={() => setIsGetSetUpModalOpen(true)}
                  onPressBalance={() => {
                    setIsPocketOpen(true);
                  }}
                  isAvatarHidden={isAvatarFlying || isProfileMounted}
                />

                {/* SECTION 2: TWO-COLUMN ACTIVITY & BRAIN CARDS */}
                <SinanceActivitySection
                  brainAmount={formattedBalance}
                  sinceAllTimeLabel="Since All Time"
                  transactions={transactions}
                  isBrainActive={isSinsBrainOpen}
                  onPressBrainCard={() => {
                    setIsSinsBrainOpen(true);
                  }}
                  onPressActivityCard={() => setActiveTab('analytics')}
                />

                {/* SECTION 3: UPCOMING BILLS & SUBSCRIPTIONS */}
                <UpcomingBillsSection
                  bills={bills.length > 0 ? bills : undefined}
                  onPressBill={() => setIsAllBillsOpen(true)}
                  onPressSeeAll={() => setIsAllBillsOpen(true)}
                />
              </ScrollView>
            )}
          </Animated.View>

          {/* ================= 2-TAB BOTTOM CAPSULE DOCK (GLIDES OUT ON PROFILE OPEN) ================= */}
          <Animated.View
            style={[
              styles.dockAnimatedWrapper,
              {
                opacity: profileAnim.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [1, 0, 0],
                }),
                transform: [
                  {
                    translateY: profileAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 90],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={isProfileMounted ? 'none' : 'auto'}
          >
            <BottomCapsuleDock
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setIsPocketOpen(false);
                handleCloseProfile();
              }}
            />
          </Animated.View>

          {/* ================= FULL PROFILE SCREEN (SLIDES UP FROM BOTTOM) ================= */}
          {isProfileMounted && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  zIndex: 200,
                  elevation: 20,
                  backgroundColor: theme.canvas,
                  transform: [
                    {
                      translateY: profileAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [screenHeight, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <ProfileScreen
                animProgress={profileAnim}
                onBack={handleCloseProfile}
                currency={currency}
                onToggleCurrency={(newCurr) => setCurrency(newCurr)}
                isSetupDismissed={isSetupDismissed}
                onToggleSetupDismissed={() => setIsSetupDismissed((prev) => !prev)}
                onOpenAuth={() => {
                  handleCloseProfile();
                  setIsAuthModalOpen(true);
                }}
                isAvatarHidden={!isProfileSettled}
                userProfile={userProfile || undefined}
                onProfileUpdated={(updated) => setUserProfile(updated)}
                onOpenSinanceBrain={() => setIsSinsBrainOpen(true)}
              />
            </Animated.View>
          )}

          {/* ================= SHARED FLYING AVATAR (HOMEPAGE -> PROFILE POSITION) ================= */}
          {(isAvatarFlying || (isProfileMounted && !isProfileSettled)) && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.flyingAvatarContainer,
                {
                  borderColor: theme.borderSubtle,
                  backgroundColor: theme.avatarInnerBg,
                  transform: [
                    {
                      translateX: profileAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 23],
                      }),
                    },
                    {
                      translateY: profileAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 126],
                      }),
                    },
                    {
                      scale: profileAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 58 / 44],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={userProfile?.avatarUri ? { uri: userProfile.avatarUri } : require('./assets/esther_avatar.png')}
                style={styles.flyingAvatarImage}
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* ================= GET SET UP MODAL ================= */}
          <GetSetUpModal
            visible={isGetSetUpModalOpen}
            onClose={() => setIsGetSetUpModalOpen(false)}
            onDismissFromHome={() => setIsSetupDismissed(true)}
            accounts={accounts}
            transactions={transactions}
            bills={bills}
            userProfile={userProfile}
            onNavigateToPocket={() => setIsPocketOpen(true)}
            onNavigateToBills={() => {
              setIsGetSetUpModalOpen(false);
              setIsAllBillsOpen(true);
            }}
            onNavigateToAuth={() => setIsAuthModalOpen(true)}
            onNavigateToProfile={() => {
              setIsGetSetUpModalOpen(false);
              handleOpenProfile();
            }}
            onNavigateToRecord={() => {
              setIsGetSetUpModalOpen(false);
              setIsSinsBrainOpen(true);
            }}
          />

          {/* ================= ALL BILLS & SUBSCRIPTIONS MODAL ================= */}
          <AllBillsModal
            visible={isAllBillsOpen}
            onClose={() => setIsAllBillsOpen(false)}
            bills={bills}
            onBillsUpdated={() => {
              SubscriptionService.getSubscriptions(user?.id).then((subRes) => {
                if (subRes.billItems) {
                  setBills(subRes.billItems);
                }
              });
            }}
            userId={user?.id}
          />

          {/* ================= SINS BRAIN APP-WIDE AI COPILOT ================= */}
          <SinsBrainModal
            visible={isSinsBrainOpen}
            onClose={() => setIsSinsBrainOpen(false)}
            contextData={{
              accounts,
              transactions,
              bills,
              userProfile: userProfile || undefined,
            }}
            onExecuteTransaction={(newTx) => {
              FinanceService.recordTransaction(newTx).then((res) => {
                if (res.data) {
                  setTransactions((prev) => [res.data!, ...prev]);
                  // Refresh accounts
                  FinanceService.getAccounts(user?.id).then((accRes) => {
                    if (accRes.data) setAccounts(accRes.data);
                  });
                }
              });
            }}
            onPayBill={(billId) => {
              const matchedBill = bills.find((b) => b.id === billId);
              if (matchedBill) {
                SubscriptionService.markAsPaid(matchedBill).then(() => {
                  SubscriptionService.getSubscriptions(user?.id).then((subRes) => {
                    if (subRes.billItems) setBills(subRes.billItems);
                  });
                });
              }
            }}
          />

          {/* ================= AUTH MODAL ================= */}
          {isAuthModalOpen && (
            <View style={StyleSheet.absoluteFill}>
              <AuthScreen onDismiss={() => setIsAuthModalOpen(false)} />
            </View>
          )}
          {/* ================= GLOBAL TOAST NOTIFICATION HOST ================= */}
          <ToastHost />
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : undefined,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  screenContentWrapper: {
    flex: 1,
    width: '100%',
  },
  dockAnimatedWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  flyingAvatarContainer: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'android' ? 14 : 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 9999,
  },
  flyingAvatarImage: {
    width: '100%',
    height: '100%',
  },
});
