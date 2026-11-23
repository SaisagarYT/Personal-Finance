import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Check, AlertTriangle, Info, X } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
  toastData: ToastOptions | null;
  animValue: Animated.Value;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastData, setToastData] = useState<ToastOptions | null>(null);
  const animValue = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(animValue, {
      toValue: 0,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setToastData(null);
    });
  }, [animValue]);

  const showToast = useCallback((options: ToastOptions | string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const config: ToastOptions =
      typeof options === 'string'
        ? {
            title: options,
            type: 'success',
          }
        : options;

    setToastData(config);

    Animated.spring(animValue, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const duration = config.duration ?? 3500;
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, [animValue, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toastData, animValue }}>
      {children}
    </ToastContext.Provider>
  );
};

export const ToastHost: React.FC = () => {
  const context = useContext(ToastContext);
  const theme = useAppTheme();

  if (!context || !context.toastData) return null;

  const { toastData, animValue, hideToast } = context;

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const isSuccess = toastData.type === 'success' || !toastData.type;
  const isError = toastData.type === 'error';
  const defaultActionLabel = isError ? 'Fixing!' : 'Got It!';
  const actionLabel = toastData.actionLabel || defaultActionLabel;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.toastSafeArea}>
      <Animated.View
        style={[
          styles.toastContainer,
          {
            backgroundColor: theme.isDark ? '#18181B' : '#FFFFFF',
            borderColor: theme.borderSubtle,
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        {/* Top-left subtle diagonal gloss streak matching reference */}
        <View
          pointerEvents="none"
          style={[
            styles.glossStreak,
            {
              backgroundColor: theme.isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.02)',
            },
          ]}
        />

        {/* Left Status Icon */}
        <View style={styles.iconColumn}>
          {isSuccess && (
            <View
              style={[
                styles.scallopBadge,
                {
                  backgroundColor: theme.isDark ? theme.brand : '#10B981',
                },
              ]}
            >
              <Check
                size={14}
                color={theme.isDark ? theme.forestDark : '#FFFFFF'}
                strokeWidth={3}
              />
            </View>
          )}
          {isError && (
            <View style={styles.triangleBadge}>
              <AlertTriangle size={20} color="#EF4444" fill="#EF4444" />
            </View>
          )}
          {toastData.type === 'info' && (
            <View
              style={[
                styles.scallopBadge,
                {
                  backgroundColor: theme.surfaceSubtle,
                },
              ]}
            >
              <Info size={14} color={theme.textMain} strokeWidth={2.5} />
            </View>
          )}
        </View>

        {/* Middle: Title & Description */}
        <View style={styles.contentColumn}>
          <Text
            style={[
              styles.titleText,
              { color: theme.textMain },
            ]}
            numberOfLines={1}
          >
            {toastData.title}
          </Text>
          {!!toastData.description && (
            <Text
              style={[
                styles.descText,
                { color: theme.textDim },
              ]}
              numberOfLines={2}
            >
              {toastData.description}
            </Text>
          )}
        </View>

        {/* Right Action Button Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (toastData.onAction) {
              toastData.onAction();
            }
            hideToast();
          }}
          style={[
            styles.actionPill,
            {
              backgroundColor: isError
                ? (theme.isDark ? '#FFFFFF' : '#18181B')
                : (theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'),
            },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: isError
                  ? (theme.isDark ? '#000000' : '#FFFFFF')
                  : (theme.isDark ? '#FFFFFF' : theme.textMain),
              },
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 24 : 14,
    left: 0,
    right: 0,
    zIndex: 999999,
    ...(Platform.OS === 'web' ? { zIndex: 9999999 } : {}),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  toastContainer: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  glossStreak: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    transform: [{ rotate: '45deg' }],
  },
  iconColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scallopBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangleBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  descText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  actionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
