import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../theme/colors';

export interface PixelMorphMatrixProps {
  size?: number;
  color?: string;
  glowColor?: string;
  speedMs?: number;
  isThinking?: boolean;
}

/**
 * 3x3 Pixel matrix states representing discrete morph steps from the reference video:
 * 1 = Pixel ON (illuminated)
 * 0 = Pixel OFF (transparent/hidden)
 */
const MATRIX_FRAMES = [
  // Frame 0: Top-left L-bracket / corner
  [
    1, 1, 0,
    1, 0, 0,
    0, 0, 0,
  ],
  // Frame 1: Full top bar + left stalk
  [
    1, 1, 1,
    1, 0, 0,
    1, 0, 0,
  ],
  // Frame 2: Solid filled block / box
  [
    1, 1, 1,
    1, 1, 1,
    0, 1, 1,
  ],
  // Frame 3: Inverted bottom-right bracket
  [
    0, 0, 0,
    0, 1, 1,
    0, 1, 1,
  ],
  // Frame 4: Cross / central node
  [
    0, 1, 0,
    1, 1, 1,
    0, 1, 0,
  ],
  // Frame 5: Diagonal staircase
  [
    1, 0, 0,
    1, 1, 0,
    0, 1, 1,
  ],
];

export const PixelMorphMatrix: React.FC<PixelMorphMatrixProps> = ({
  size = 18,
  color,
  glowColor,
  speedMs = 280,
  isThinking = true,
}) => {
  const theme = useAppTheme();
  const activeColor = color || (theme.isDark ? '#23F07D' : '#059669');
  const activeGlow = glowColor || (theme.isDark ? 'rgba(35, 240, 125, 0.45)' : 'rgba(5, 150, 105, 0.35)');

  const [frameIndex, setFrameIndex] = useState(0);
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Step through pixel morph frames rhythmically (identical to reference video)
  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % MATRIX_FRAMES.length);
    }, speedMs);

    return () => clearInterval(interval);
  }, [speedMs, isThinking]);

  // Subtle breathing pulse behind the pixel cluster
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.85,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [glowAnim]);

  const currentFrame = MATRIX_FRAMES[frameIndex];
  const pixelGap = Math.max(1, Math.round(size * 0.08));
  const pixelSize = Math.floor((size - pixelGap * 2) / 3);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Soft Glow Aura */}
      <Animated.View
        style={[
          styles.glowBackdrop,
          {
            backgroundColor: activeGlow,
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            opacity: glowAnim,
          },
        ]}
      />

      {/* 3x3 Pixel Grid */}
      <View style={[styles.grid, { width: size, height: size, gap: pixelGap }]}>
        {currentFrame.map((isOn, idx) => (
          <View
            key={idx}
            style={[
              styles.pixel,
              {
                width: pixelSize,
                height: pixelSize,
                backgroundColor: isOn ? activeColor : 'transparent',
                borderRadius: Math.max(1, pixelSize * 0.22),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBackdrop: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pixel: {
    // Sharp yet subtle soft-cornered square pixel
  },
});
