import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
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

const CARD_WIDTH = 349;
const CARD_HEIGHT = 214;

// Precise mathematical outline for the card with the organic concave-convex cutout notch (dent)
const NOTCHED_CARD_PATH = `
  M 24 0
  H ${CARD_WIDTH - 24}
  A 24 24 0 0 1 ${CARD_WIDTH} 24
  V 128
  A 24 24 0 0 1 ${CARD_WIDTH - 24} 152
  H 216
  A 20 20 0 0 0 196 172
  V 190
  A 24 24 0 0 1 172 214
  H 24
  A 24 24 0 0 1 0 190
  V 24
  A 24 24 0 0 1 24 0
  Z
`;

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
          colors={['#F9D678', '#E6B84F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.secondaryCard}
        >
          <View style={styles.secondaryCardHeader}>
            {/* Left: Interlocking Mastercard / Contactless Symbol */}
            <View style={styles.interlockingCircles}>
              <View style={[styles.circle, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
              <View style={[styles.circle, { backgroundColor: 'rgba(0,0,0,0.18)', marginLeft: -6 }]} />
            </View>

            {/* Right: Masked Secondary Number */}
            <Text style={styles.secondaryCardNumber}>{secondaryCardNumber}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ================= 2. PRIMARY CARD WITH CUSTOM CUTOUT NOTCH ================= */}
      <View style={styles.primaryCardContainer}>
        {/* SVG Background Path with Notched Dent */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onPressCard}
          style={styles.svgWrapper}
        >
          <Svg
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
            fill="none"
          >
            <Defs>
              <SvgLinearGradient
                id="titaniumGradient"
                x1="0"
                y1="0"
                x2={CARD_WIDTH}
                y2={CARD_HEIGHT}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0%" stopColor="#222226" />
                <Stop offset="55%" stopColor="#141416" />
                <Stop offset="100%" stopColor="#0B0B0D" />
              </SvgLinearGradient>
            </Defs>

            {/* Notched Card Body */}
            <Path
              d={NOTCHED_CARD_PATH}
              fill="url(#titaniumGradient)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
          </Svg>

          {/* Overlay Card Content (Typography & Details) */}
          <View style={styles.cardContentOverlay}>
            {/* Top Row: Brand Monogram + Masked Number */}
            <View style={styles.primaryTopRow}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>K</Text>
                </View>
                <Text style={styles.brandTitle}>KOVA</Text>
              </View>

              <Text style={styles.primaryCardNumber}>{primaryCardNumber}</Text>
            </View>

            {/* Middle Row: Balance & Expiry */}
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

            {/* Bottom Row: Cardholder Name (sitting in the taller left section) */}
            <View style={styles.nameRow}>
              <Text style={styles.labelMuted}>Name</Text>
              <Text style={styles.nameValue}>{cardHolderName}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ================= 3. STANDALONE [+ Add Card] FLOATING PILL BUTTON ================= */}
        {/* Positioned inside the transparent cutout notch on the warm stone canvas */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressAddCard}
          style={styles.addCardButton}
        >
          <View style={styles.addCardIconCircle}>
            <Plus size={13} color="#000000" strokeWidth={3} />
          </View>
          <Text style={styles.addCardText}>Add Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginTop: 6,
    marginBottom: 14,
  },
  /* Secondary Gold Peeking Card */
  secondaryCardWrapper: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH - 20,
    height: 70,
    zIndex: 1,
  },
  secondaryCard: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    paddingHorizontal: 20,
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
    width: 15,
    height: 15,
    borderRadius: 7.5,
  },
  secondaryCardNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.7)',
  },

  /* Primary Card with Cutout */
  primaryCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginTop: 26,
    zIndex: 2,
    position: 'relative',
  },
  svgWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  cardContentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  primaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  labelMuted: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  expiryCol: {
    alignItems: 'flex-start',
    paddingRight: 6,
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nameRow: {
    width: '55%',
  },
  nameValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* Standalone Floating [+ Add Card] Pill Button in the Notch */
  addCardButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 48,
    paddingLeft: 7,
    paddingRight: 16,
    borderRadius: 24,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  addCardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
