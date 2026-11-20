import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from './src/components/HeaderBar';
import { CardStack } from './src/components/CardStack';
import { ActionPills } from './src/components/ActionPills';
import { ExpenseLedger } from './src/components/ExpenseLedger';
import { BottomCapsuleDock, NavTabId } from './src/components/BottomCapsuleDock';
import { SINANCE_COLORS } from './src/theme/colors';

export default function App() {
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
    <View style={styles.outerWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.mainContainer}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* ================= UPPER SECTION WITH SPRING ELASTIC TRANSLATION ================= */}
            <Animated.View style={{ transform: [{ translateY: upperTranslateY }] }}>
              {/* SECTION 1: TOP ICONS & GREETING */}
              <HeaderBar
                userName="Sagar"
                subtitle="Let's save your money."
                onPressMenu={() => console.log('Menu pressed')}
                onPressNotifications={() => console.log('Notifications pressed')}
                onPressProfile={() => console.log('Profile pressed')}
              />

              {/* SECTION 2: PHYSICAL STACKED CARD DECK (WITH SPRING ELASTIC UPPER CARD) */}
              <CardStack
                balance={balance}
                secondaryCardNumber="•••• •••• 7216"
                primaryCardNumber="•••• •••• 4364"
                cardHolderName="Sagar Sylada"
                expiryDate="08/28"
                activeTab={activeTab}
                onPressAddCard={() => console.log('Add Card pressed')}
                onPressCard={() => setCurrency((prev) => (prev === 'USD' ? 'INR' : 'USD'))}
              />
            </Animated.View>

            {/* ================= SECTION 3: 4 CIRCULAR ACTION PILLS ================= */}
            <ActionPills
              onPressSend={() => console.log('Send pressed')}
              onPressRequest={() => console.log('Request pressed')}
              onPressTopUp={() => console.log('TopUp pressed')}
              onPressMore={() => console.log('More pressed')}
            />

            {/* ================= SECTION 4: MANAGE EXPENSES / RECENT ACTIVITY LEDGER ================= */}
            <ExpenseLedger
              items={expenses}
              onPressViewAll={() => console.log('View All pressed')}
              onPressItem={(item) => console.log('Pressed item:', item.title)}
            />
          </ScrollView>

          {/* ================= SECTION 5: FLOATING CAPSULE BOTTOM NAVIGATION DOCK ================= */}
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
    backgroundColor: SINANCE_COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: SINANCE_COLORS.canvas,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: SINANCE_COLORS.canvas,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 110,
  },
});
