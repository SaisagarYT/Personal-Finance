import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from './src/components/HeaderBar';
import { CardStack } from './src/components/CardStack';
import { ActionPills } from './src/components/ActionPills';
import { KOVA_COLORS } from './src/theme/colors';

export default function App() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const balance = currency === 'INR' ? '₹2,40,250.00' : '$2,885.00';

  return (
    <View style={styles.outerWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= SECTION 1: TOP ICONS & GREETING ================= */}
          <HeaderBar
            userName="Sagar"
            subtitle="Let's save your money."
            onPressMenu={() => console.log('Menu pressed')}
            onPressNotifications={() => console.log('Notifications pressed')}
            onPressProfile={() => console.log('Profile pressed')}
          />

          {/* ================= SECTION 2: PHYSICAL STACKED CARD DECK ================= */}
          <CardStack
            balance={balance}
            secondaryCardNumber="•••• •••• 7216"
            primaryCardNumber="•••• •••• 4364"
            cardHolderName="Sagar Sylada"
            expiryDate="08/28"
            onPressAddCard={() => console.log('Add Card pressed')}
            onPressCard={() => console.log('Card tapped')}
          />

          {/* ================= SECTION 3: 4 CIRCULAR ACTION PILLS ================= */}
          <ActionPills
            onPressSend={() => console.log('Send pressed')}
            onPressRequest={() => console.log('Request pressed')}
            onPressTopUp={() => console.log('TopUp pressed')}
            onPressMore={() => console.log('More pressed')}
          />

          {/* Section 4 (Manage Expenses / Recent Activity Ledger) will follow upon approval */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: KOVA_COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: KOVA_COLORS.canvas,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: KOVA_COLORS.canvas,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 40,
  },
});
