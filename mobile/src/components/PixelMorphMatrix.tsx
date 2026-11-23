import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useAppTheme } from '../theme/colors';

export interface PixelMorphMatrixProps {
  size?: number;
  durationMs?: number;
}

/**
 * 2x2 Clean 4-Block Matrix with continuous, ultra-smooth color circulation.
 * Instead of discrete jump cuts, a single 0 -> 4 continuous loop smoothly
 * fades and cross-dissolves the theme color across the 4 blocks clockwise:
 * Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left -> Top-Left.
 */
export const PixelMorphMatrix: React.FC<PixelMorphMatrixProps> = ({
  size = 18,
  durationMs = 1800,
}) => {
  const theme = useAppTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animValue, {
        toValue: 4,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [animValue, durationMs]);

  const activeColor = theme.isDark ? '#23F07D' : '#059669';
  const dimColor = theme.isDark ? 'rgba(35, 240, 125, 0.18)' : 'rgba(5, 150, 105, 0.18)';

  const gap = 2;
  const blockSize = Math.floor((size - gap) / 2);
  const blockRadius = Math.max(1, Math.round(blockSize * 0.22));

  // Block 0: Top-Left (Peaks at 0 and 4)
  const bgTL = animValue.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [activeColor, dimColor, dimColor, dimColor, activeColor],
  });

  // Block 1: Top-Right (Peaks at 1)
  const bgTR = animValue.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [dimColor, activeColor, dimColor, dimColor, dimColor],
  });

  // Block 2: Bottom-Right (Peaks at 2)
  const bgBR = animValue.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [dimColor, dimColor, activeColor, dimColor, dimColor],
  });

  // Block 3: Bottom-Left (Peaks at 3)
  const bgBL = animValue.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [dimColor, dimColor, dimColor, activeColor, dimColor],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top Row: Block 0 (TL), Block 1 (TR) */}
      <View style={[styles.row, { gap }]}>
        <Animated.View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: bgTL,
              borderRadius: blockRadius,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: bgTR,
              borderRadius: blockRadius,
            },
          ]}
        />
      </View>

      {/* Bottom Row: Block 3 (BL), Block 2 (BR) */}
      <View style={[styles.row, { gap, marginTop: gap }]}>
        <Animated.View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: bgBL,
              borderRadius: blockRadius,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: bgBR,
              borderRadius: blockRadius,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  block: {
    // Clean, crisp square tile with soft rounded corners
  },
});
