import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SinanceHeroCard } from './src/components/SinanceHeroCard';
import { SinanceActivitySection } from './src/components/SinanceActivitySection';
import { SinanceSavingsRulesSection } from './src/components/SinanceSavingsRulesSection';
import { BottomCapsuleDock, NavTabId } from './src/components/BottomCapsuleDock';
import { StatsView } from './src/screens/StatsView';
import { SinancePocketScreen } from './src/screens/SinancePocketScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FinanceService, Account, Transaction } from './src/services/financeService';
import { useAppTheme } from './src/theme/colors';

function AppContent() {
  const theme = useAppTheme();
  const { user, session } = useAuth();

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tab') as NavTabId | null;
      if (t) return t;
    }
    return 'home';
  });
  const [isPocketOpen, setIsPocketOpen] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('pocket') === 'true';
    }
    return false;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('profile') === 'true';
    }
    return false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('auth') === 'true';
    }
    return false;
  });

  // Cloud Financial Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        const [accRes, txRes] = await Promise.all([
          FinanceService.getAccounts(user?.id),
          FinanceService.getTransactions(user?.id, 15),
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
    // Approx USD conversion for demo
    const usd = (amount / 86.5).toFixed(2);
    return `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formattedBalance = formatBalance(totalBalance);
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || (user ? 'Member' : 'Sagar');

  return (
    <View style={[styles.outerWrapper, { backgroundColor: theme.canvas }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.heroCardBg }]}>
        <StatusBar style="dark" />
        <View style={[styles.mainContainer, { backgroundColor: theme.canvas }]}>
          {isPocketOpen || activeTab === 'cards' ? (
            <SinancePocketScreen
              onBack={() => {
                setIsPocketOpen(false);
                setActiveTab('home');
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
            <StatsView
              onBack={() => setActiveTab('home')}
              currency={currency}
            />
          ) : (
            <ScrollView
              style={[styles.container, { backgroundColor: theme.canvas }]}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* ================= SECTION 1: SINANCE HERO CARD ================= */}
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
                onPressAvatar={() => setIsProfileModalOpen(true)}
                onPressNotification={() => setIsProfileModalOpen(true)}
                onPressDismissSetup={() => console.log('Dismiss setup')}
                onPressGetSetUp={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setActiveTab('cards');
                  }
                }}
                onPressBalance={() => {
                  setIsPocketOpen(true);
                  setActiveTab('cards');
                }}
              />

              {/* ================= SECTION 2: TWO-COLUMN ACTIVITY & BRAIN CARDS ================= */}
              <SinanceActivitySection
                brainAmount={formattedBalance}
                sinceAllTimeLabel="Since All Time"
                dailyCashSubtitle="+₹1,250 Daily Cash"
                isBrainActive={isPocketOpen}
                onPressBrainCard={() => {
                  setIsPocketOpen(true);
                  setActiveTab('cards');
                }}
                onPressActivityCard={() => setActiveTab('analytics')}
              />

              {/* ================= SECTION 3: SAVINGS RULES & 1P CHALLENGE ================= */}
              <SinanceSavingsRulesSection
                automaticAmount="₹12,450.00"
                onPressAutomaticRule={() => console.log('Automatic saving rule pressed')}
                onPressChallenge={() => console.log('1P Challenge pressed')}
              />
            </ScrollView>
          )}

          {/* ================= FLOATING CAPSULE BOTTOM NAVIGATION DOCK ================= */}
          <BottomCapsuleDock
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'cards') {
                setIsPocketOpen(true);
              } else {
                setIsPocketOpen(false);
              }
            }}
          />

          {/* ================= PROFILE & CLOUD SYNC SHEET ================= */}
          <ProfileModal
            visible={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onOpenAuth={() => {
              setIsProfileModalOpen(false);
              setIsAuthModalOpen(true);
            }}
          />

          {/* ================= AUTH MODAL (SIGN IN / SIGN UP) ================= */}
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 110,
  },
});
