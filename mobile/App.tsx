import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from './src/components/HeaderBar';
import { KOVA_COLORS } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.outerWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          {/* ================= SECTION 1: TOP ICONS & GREETING ================= */}
          <HeaderBar
            userName="Sagar"
            subtitle="Let's save your money."
            onPressMenu={() => console.log('Menu pressed')}
            onPressNotifications={() => console.log('Notifications pressed')}
            onPressProfile={() => console.log('Profile pressed')}
          />

          {/* Section 2 (Stacked Card Deck) will be added upon Section 1 approval */}
          <View style={styles.sectionPlaceholder} />
        </View>
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
  sectionPlaceholder: {
    flex: 1,
  },
});
