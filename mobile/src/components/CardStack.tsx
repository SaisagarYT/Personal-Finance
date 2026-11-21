import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { SINANCE_COLORS, useAppTheme } from '../theme/colors';

interface CardStackProps {
  balance?: string;
  secondaryCardNumber?: string;
  primaryCardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  activeTab?: string;
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
  V 136
  A 24 24 0 0 1 ${CARD_WIDTH - 24} 160
  H 236
  A 16 16 0 0 0 220 176
  V 196
  A 18 18 0 0 1 202 214
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
  activeTab = 'home',
  onPressAddCard,
  onPressCard,
}) => {
  const theme = useAppTheme();

  // Spring Physics for Upper Gold Card and Primary Card
  const upperElasticAnim = useRef(new Animated.Value(0)).current;
  const primaryElasticAnim = useRef(new Animated.Value(0)).current;

  // Track tab switch changes to trigger spring elastic recoil
  useEffect(() => {
    // Reset and trigger high-energy spring physics
    upperElasticAnim.setValue(0);
    primaryElasticAnim.setValue(0);

    Animated.parallel([
      // Upper Card (Gold Card): Elastic spring oscillation
      Animated.spring(upperElasticAnim, {
        toValue: 1,
        friction: 4,      // Low friction produces signature rubber-band spring recoil
        tension: 90,     // Energetic spring tension
        useNativeDriver: true,
      }),
      // Primary Card: Subtle physical breathing spring
      Animated.spring(primaryElasticAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  // If "cards" tab is selected, upper card expands further upwards, otherwise subtle elastic bounce
  const isCardsTab = activeTab === 'cards';

  const upperTranslateY = upperElasticAnim.interpolate({
    inputRange: [0, 0.45, 0.75, 1],
    outputRange: isCardsTab
      ? [0, -42, -32, -36]    // Expanded cards view with bouncy overshoot
      : [0, -16, 4, 0],       // Elastic pop-up and settle on tab switch
  });

  const upperScale = upperElasticAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isCardsTab ? [0.98, 1.01, 1] : [0.98, 1.015, 1],
  });

  const primaryScale = primaryElasticAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.985, 1.008, 1],
  });

  const primaryTranslateY = primaryElasticAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 4, 0],
  });

  return (
    <View style={styles.container}>
      {/* ================= 1. SECONDARY UPPER CARD (ELASTIC SPRING PEEKING) ================= */}
      <Animated.View
        style={[
          styles.secondaryCardWrapper,
          {
            transform: [
              { translateY: upperTranslateY },
              { scale: upperScale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressCard}
          style={styles.secondaryCardTouchable}
        >
          <LinearGradient
            colors={[theme.goldChampagneStart, theme.goldChampagneEnd]}
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
        </TouchableOpacity>
      </Animated.View>

      {/* ================= 2. PRIMARY CARD WITH CUSTOM CUTOUT NOTCH ================= */}
      <Animated.View
        style={[
          styles.primaryCardContainer,
          {
            transform: [
              { translateY: primaryTranslateY },
              { scale: primaryScale },
            ],
          },
        ]}
      >
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
                <Stop offset="0%" stopColor={theme.primaryCardGradient[0]} />
                <Stop offset="55%" stopColor={theme.primaryCardGradient[1]} />
                <Stop offset="100%" stopColor={theme.primaryCardGradient[2]} />
              </SvgLinearGradient>
            </Defs>

            {/* Notched Card Body */}
            <Path
              d={NOTCHED_CARD_PATH}
              fill="url(#titaniumGradient)"
              stroke={theme.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)'}
              strokeWidth="1"
            />
          </Svg>

          {/* Overlay Card Content (Typography & Details) */}
          <View style={styles.cardContentOverlay}>
            {/* Top Row: Brand Monogram + Masked Number */}
            <View style={styles.primaryTopRow}>
              <View style={styles.brandRow}>
                <View style={[styles.brandBadge, { backgroundColor: theme.forestDark }]}>
                  <Text style={[styles.brandBadgeText, { color: theme.brand }]}>S</Text>
                </View>
                <Text style={[styles.brandTitle, { color: theme.forestDark }]}>SINANCE</Text>
              </View>

              <Text style={[styles.primaryCardNumber, { color: theme.forestMedium }]}>{primaryCardNumber}</Text>
            </View>

            {/* Middle Row: Balance & Expiry */}
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.labelMuted, { color: theme.forestMedium }]}>Balance</Text>
                <Text style={[styles.balanceAmount, { color: theme.forestDark }]}>{balance}</Text>
              </View>

              <View style={styles.expiryCol}>
                <Text style={[styles.labelMuted, { color: theme.forestMedium }]}>Exp. Date</Text>
                <Text style={[styles.expiryValue, { color: theme.forestDark }]}>{expiryDate}</Text>
              </View>
            </View>

            {/* Bottom Row: Cardholder Name (sitting in the taller left section) */}
            <View style={styles.nameRow}>
              <Text style={[styles.labelMuted, { color: theme.forestMedium }]}>Name</Text>
              <Text style={[styles.nameValue, { color: theme.forestDark }]}>{cardHolderName}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ================= 3. STANDALONE [+ Add Card] FLOATING PILL BUTTON ================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressAddCard}
          style={[
            styles.addCardButton,
            {
              backgroundColor: theme.addCardBg,
              borderColor: theme.addCardBorder,
            },
          ]}
        >
          <View style={[styles.addCardIconCircle, { backgroundColor: theme.addCardIconBg }]}>
            <Plus size={13} color={theme.addCardIconColor} strokeWidth={3} />
          </View>
          <Text style={[styles.addCardText, { color: theme.addCardTextColor }]}>Add Card</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginTop: 22,
    marginBottom: 14,
  },
  /* Secondary Gold Peeking Card */
  secondaryCardWrapper: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH - 20,
    height: 85,
    zIndex: 1,
  },
  secondaryCardTouchable: {
    width: '100%',
    height: '100%',
  },
  secondaryCard: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  primaryCardNumber: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  labelMuted: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  expiryCol: {
    alignItems: 'flex-start',
    paddingRight: 6,
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nameRow: {
    width: '55%',
  },
  nameValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Add Card Pill Button */
  addCardButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 15,
    gap: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  addCardIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
