import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useAppTheme } from '../theme/colors';

export interface AudioWaveformIndicatorProps {
  height?: number;
  barCount?: number;
  activeColor?: string;
}

/**
 * Premium 5-bar live audio waveform visualizer for Sins.
 * Each bar oscillates with an organic staggered phase delay
 * to simulate authentic human speech / microphone frequency analysis.
 */
export const AudioWaveformIndicator: React.FC<AudioWaveformIndicatorProps> = ({
  height = 36,
  barCount = 5,
  activeColor,
}) => {
  const theme = useAppTheme();
  const color = activeColor || (theme.isDark ? '#23F07D' : '#059669');

  // Animated scale heights for each individual bar
  const waveAnims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    // Staggered sine oscillation loops for each bar
    const animations = waveAnims.map((anim, index) => {
      const minScale = 0.15;
      const maxScale = 0.75 + (index % 2 === 0 ? 0.25 : 0.1);
      const duration = 340 + (index * 75);

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxScale,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minScale,
            duration: duration * 1.1,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [waveAnims]);

  return (
    <View style={[styles.container, { height }]}>
      {waveAnims.map((anim, idx) => {
        const barHeight = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [4, height],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: color,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});
