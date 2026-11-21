import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SinanceHeroCard } from './src/components/SinanceHeroCard';
import { SinanceActivitySection } from './src/components/SinanceActivitySection';
import { UpcomingBillsSection, BillItem } from './src/components/UpcomingBillsSection';
import { BottomCapsuleDock, NavTabId } from './src/components/BottomCapsuleDock';
import { StatsView } from './src/screens/StatsView';
import { SinancePocketScreen } from './src/screens/SinancePocketScreen';
import { TaskManagerScreen } from './src/screens/TaskManagerScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { GetSetUpModal } from './src/components/GetSetUpModal';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FinanceService, Account, Transaction } from './src/services/financeService';
import { SubscriptionService } from './src/services/subscriptionService';
import { useAppTheme } from './src/theme/colors';

function AppContent() {
  const theme = useAppTheme();
  const { user } = useAuth();

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(() => {
    return getQueryParam('profile') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    return getQueryParam('auth') === 'true';
  });
  const [isSetupDismissed, setIsSetupDismissed] = useState(() => {
    return getQueryParam('setup_dismissed') === 'true';
  });
  const [isGetSetUpModalOpen, setIsGetSetUpModalOpen] = useState(() => {
    return getQueryParam('setup_modal') === 'true';
  });

  // Cloud Financial Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(240250);
  const [loadingData, setLoadingData] = useState<boolean>(true);

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
          {activeTab === 'tasks' ? (
            /* ================= TAB 2: TASKS & GOALS BOARD ================= */
            <TaskManagerScreen
              onOpenProfile={() => setIsProfileModalOpen(true)}
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
                userName={userName}
                balance={formattedBalance}
                pastWeekDiff="+₹1,940 past week"
                onboardingStep={user ? 'Cloud Synced' : '2 of 5 complete'}
                onboardingText={
                  user
                    ? 'Your data is connected to Supabase and synced across devices.'
                    : 'is a crucial phase in the onboarding process'
                }
                isSetupDismissed={isSetupDismissed}
                onPressAvatar={() => setIsProfileModalOpen(true)}
                onPressNotification={() => setIsProfileModalOpen(true)}
                onPressDismissSetup={() => setIsSetupDismissed(true)}
                onPressGetSetUp={() => setIsGetSetUpModalOpen(true)}
                onPressBalance={() => {
                  setIsPocketOpen(true);
                }}
              />

              {/* SECTION 2: TWO-COLUMN ACTIVITY & BRAIN CARDS */}
              <SinanceActivitySection
                brainAmount={formattedBalance}
                sinceAllTimeLabel="Since All Time"
                dailyCashSubtitle="+₹1,250 Daily Cash"
                isBrainActive={isPocketOpen}
                onPressBrainCard={() => {
                  setIsPocketOpen(true);
                }}
                onPressActivityCard={() => setActiveTab('analytics')}
              />

              {/* SECTION 3: UPCOMING BILLS & SUBSCRIPTIONS */}
              <UpcomingBillsSection
                bills={bills.length > 0 ? bills : undefined}
                onPressBill={(bill) => console.log('Bill pressed:', bill.name)}
                onPressSeeAll={() => console.log('See all bills')}
              />
            </ScrollView>
          )}

          {/* ================= 2-TAB BOTTOM CAPSULE DOCK ================= */}
          <BottomCapsuleDock
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsPocketOpen(false);
            }}
          />

          {/* ================= PROFILE MODAL ================= */}
          <ProfileModal
            visible={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onOpenAuth={() => {
              setIsProfileModalOpen(false);
              setIsAuthModalOpen(true);
            }}
          />

          {/* ================= GET SET UP MODAL ================= */}
          <GetSetUpModal
            visible={isGetSetUpModalOpen}
            onClose={() => setIsGetSetUpModalOpen(false)}
            onDismissFromHome={() => setIsSetupDismissed(true)}
            onNavigateToPocket={() => setIsPocketOpen(true)}
            onNavigateToBills={() => {
              // Can open upcoming bills screen
            }}
            onNavigateToAuth={() => setIsAuthModalOpen(true)}
          />

          {/* ================= AUTH MODAL ================= */}
          {isAuthModalOpen && (
            <View style={StyleSheet.absoluteFill}>
              <AuthScreen onDismiss={() => setIsAuthModalOpen(false)} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: 390,
    maxWidth: 390,
    backgroundColor: '#000000',
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
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 110,
  },
});
