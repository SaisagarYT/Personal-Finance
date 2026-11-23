import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/colors';

export interface PixelMorphMatrixProps {
  size?: number;
  speedMs?: number;
}

/**
 * Clean 2x2 4-block square matrix.
 * Exactly 4 blocks with sequential rotating color illumination:
 * Block 1 (top-left) -> Block 2 (top-right) -> Block 4 (bottom-right) -> Block 3 (bottom-left)
 * Pure minimalist square grid with zero circular or blurred glow backgrounds.
 */
export const PixelMorphMatrix: React.FC<PixelMorphMatrixProps> = ({
  size = 18,
  speedMs = 220,
}) => {
  const theme = useAppTheme();
  const [activeStep, setActiveStep] = useState(0);

  // Cycle through 0 -> 1 -> 2 -> 3 in a clockwise rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, speedMs);

    return () => clearInterval(timer);
  }, [speedMs]);

  const primaryColor = theme.isDark ? '#23F07D' : '#059669';
  const dimColor = theme.isDark ? 'rgba(35, 240, 125, 0.22)' : 'rgba(5, 150, 105, 0.22)';

  const gap = 2;
  const blockSize = Math.floor((size - gap) / 2);

  // Rotation order:
  // Index 0: Top-Left
  // Index 1: Top-Right
  // Index 2: Bottom-Right
  // Index 3: Bottom-Left
  const getBlockColor = (blockIndex: number) => {
    return activeStep === blockIndex ? primaryColor : dimColor;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top Row: Block 0 (TL), Block 1 (TR) */}
      <View style={[styles.row, { gap }]}>
        <View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: getBlockColor(0),
              borderRadius: Math.max(1, blockSize * 0.2),
            },
          ]}
        />
        <View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: getBlockColor(1),
              borderRadius: Math.max(1, blockSize * 0.2),
            },
          ]}
        />
      </View>

      {/* Bottom Row: Block 3 (BL), Block 2 (BR) */}
      <View style={[styles.row, { gap, marginTop: gap }]}>
        <View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: getBlockColor(3),
              borderRadius: Math.max(1, blockSize * 0.2),
            },
          ]}
        />
        <View
          style={[
            styles.block,
            {
              width: blockSize,
              height: blockSize,
              backgroundColor: getBlockColor(2),
              borderRadius: Math.max(1, blockSize * 0.2),
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
    // Crisp, clean square tile
  },
});
