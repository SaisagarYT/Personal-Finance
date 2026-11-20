import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { KOVA_COLORS } from '../theme/colors';

interface CardStackProps {
  balance?: string;
  secondaryCardNumber?: string;
  primaryCardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  onPressAddCard?: () => void;
  onPressCard?: () => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  balance = '₹2,40,250.00',
  secondaryCardNumber = '•••• •••• 7216',
  primaryCardNumber = '•••• •••• 4364',
  cardHolderName = 'Sagar Sylada',
  expiryDate = '08/28',
  onPressAddCard,
  onPressCard,
}) => {
  return (
    <View style={styles.container}>
      {/* ================= 1. SECONDARY CARD (PEEKING FROM BEHIND) ================= */}
      <View style={styles.secondaryCardWrapper}>
        <LinearGradient
          colors={['#F7D270', '#E5B744']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.secondaryCard}
        >
          <View style={styles.secondaryCardHeader}>
            {/* Left: Interlocking Circles / Contactless Wave */}
            <View style={styles.interlockingCircles}>
              <View style={[styles.circle, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
              <View style={[styles.circle, { backgroundColor: 'rgba(0,0,0,0.15)', marginLeft: -6 }]} />
            </View>

            {/* Right: Masked Number */}
            <Text style={styles.secondaryCardNumber}>{secondaryCardNumber}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ================= 2. PRIMARY CARD (FOREGROUND TITANIUM) ================= */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPressCard}
        style={styles.primaryCardShadow}
      >
        <LinearGradient
          colors={['#222226', '#141416', '#0C0C0E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.primaryCard}
        >
          {/* Top Row: Brand Monogram + Card Number */}
          <View style={styles.primaryTopRow}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>K</Text>
              </View>
              <Text style={styles.brandTitle}>KOVA</Text>
            </View>

            <Text style={styles.primaryCardNumber}>{primaryCardNumber}</Text>
          </View>

          {/* Middle Row: Balance & Expiry Date */}
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.labelMuted}>Balance</Text>
              <Text style={styles.balanceAmount}>{balance}</Text>
            </View>

            <View style={styles.expiryCol}>
              <Text style={styles.labelMuted}>Exp. Date</Text>
              <Text style={styles.expiryValue}>{expiryDate}</Text>
            </View>
          </View>

          {/* Bottom Row: Cardholder Name + Embedded Add Card Pill */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.labelMuted}>Name</Text>
              <Text style={styles.nameValue}>{cardHolderName}</Text>
            </View>

            {/* Signature Feature: Embedded [+ Add Card] Pill Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPressAddCard}
              style={styles.addCardButton}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addCardText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 22,
    position: 'relative',
    marginTop: 4,
    marginBottom: 10,
  },
  /* Secondary Card Styles */
  secondaryCardWrapper: {
    position: 'absolute',
    top: 0,
    left: 32,
    right: 32,
    height: 70,
    zIndex: 1,
  },
  secondaryCard: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    shadowColor: '#C99E32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  secondaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interlockingCircles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  secondaryCardNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.7)',
    fontFamily: 'System',
  },

  /* Primary Card Styles */
  primaryCardShadow: {
    marginTop: 26,
    zIndex: 2,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  primaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: KOVA_COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  primaryCardNumber: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'System',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  labelMuted: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  expiryCol: {
    alignItems: 'flex-start',
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  nameValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  /* The Signature [+ Add Card] Pill Button */
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addCardText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
