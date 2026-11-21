import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from './src/components/HeaderBar';
import { CardStack } from './src/components/CardStack';
import { ActionPills } from './src/components/ActionPills';
import { ExpenseLedger } from './src/components/ExpenseLedger';
import { EcoFinHeroCard } from './src/components/EcoFinHeroCard';
import { EcoFinActivitySection } from './src/components/EcoFinActivitySection';
import { EcoFinSavingsRulesSection } from './src/components/EcoFinSavingsRulesSection';
import { BottomCapsuleDock, NavTabId } from './src/components/BottomCapsuleDock';
import { StatsView } from './src/screens/StatsView';
import { useAppTheme } from './src/theme/colors';

export default function App() {
  const theme = useAppTheme();
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');

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

  const upperTranslateY = upperSpring.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [-8, 2, 0],
  });

  const balance = currency === 'USD' ? '$3,922.40' : '₹2,40,250.00';

  const expenses = currency === 'USD' ? [
    {
      id: '1',
      title: 'House Rent',
      date: '09:00 am • 12 September, 2025',
      amount: '$400.00',
      icon: 'rent' as const,
    },
    {
      id: '2',
      title: 'Internet Bill',
      date: '14:21 pm • 11 September, 2025',
      amount: '$55.00',
      icon: 'internet' as const,
    },
    {
      id: '3',
      title: 'Groceries',
      date: '18:00 pm • 10 September, 2025',
      amount: '$78.00',
      icon: 'groceries' as const,
    },
    {
      id: '4',
      title: 'Taxes',
      date: '11:15 am • 08 September, 2025',
      amount: '$230.00',
      icon: 'taxes' as const,
    },
  ] : [
    {
      id: '1',
      title: 'House Rent',
      date: '09:00 am • 12 September, 2025',
      amount: '₹24,000.00',
      icon: 'rent' as const,
    },
    {
      id: '2',
      title: 'Internet Bill',
      date: '14:21 pm • 11 September, 2025',
      amount: '₹1,499.00',
      icon: 'internet' as const,
    },
    {
      id: '3',
      title: 'Groceries',
      date: '18:00 pm • 10 September, 2025',
      amount: '₹4,850.00',
      icon: 'groceries' as const,
    },
    {
      id: '4',
      title: 'Taxes',
      date: '11:15 am • 08 September, 2025',
      amount: '₹18,500.00',
      icon: 'taxes' as const,
    },
  ];

  return (
    <View style={[styles.outerWrapper, { backgroundColor: '#000000' }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#23F07D' }]}>
        <StatusBar style="dark" />
        <View style={[styles.mainContainer, { backgroundColor: '#000000' }]}>
          {activeTab === 'analytics' ? (
            <StatsView
              onBack={() => setActiveTab('home')}
              currency={currency}
            />
          ) : (
            <ScrollView
              style={[styles.container, { backgroundColor: '#000000' }]}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* ================= SECTION 1: ECOFIN HERO CARD ================= */}
              <EcoFinHeroCard
                userName="Esther"
                balance="$142.83"
                pastWeekDiff="+$23.91 past week"
                onboardingStep="2 of 5 complete"
                onboardingText="is a crucial phase in the onboarding process"
                onPressNotification={() => setActiveTab('analytics')}
                onPressDismissSetup={() => console.log('Dismiss setup')}
                onPressGetSetUp={() => console.log('Get Set Up clicked')}
                onPressBalance={() => setCurrency((prev) => (prev === 'USD' ? 'INR' : 'USD'))}
              />

              {/* ================= SECTION 2: TWO-COLUMN ACTIVITY & BRAIN CARDS ================= */}
              <EcoFinActivitySection
                brainAmount="$142.83"
                sinceAllTimeLabel="Since All Time"
                dailyCashSubtitle="+$15.43 Daily Cash"
                onPressBrainCard={() => console.log('Brain card pressed')}
                onPressActivityCard={() => setActiveTab('analytics')}
              />

              {/* ================= SECTION 3: SAVINGS RULES & 1P CHALLENGE ================= */}
              <EcoFinSavingsRulesSection
                automaticAmount="$150.87"
                onPressAutomaticRule={() => console.log('Automatic saving rule pressed')}
                onPressChallenge={() => console.log('1P Challenge pressed')}
              />
            </ScrollView>
          )}

          {/* ================= FLOATING CAPSULE BOTTOM NAVIGATION DOCK (PRESERVED) ================= */}
          <BottomCapsuleDock
            activeTab={activeTab}
            onSelectTab={(tab) => {
              console.log('Navigated to:', tab);
              setActiveTab(tab);
            }}
          />
        </View>
      </SafeAreaView>
    </View>
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
