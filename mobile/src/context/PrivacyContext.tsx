import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PRIVACY = '@sinance_privacy_settings';

export interface PrivacySettings {
  isPrivacyMode: boolean;
  maskTransactions: boolean;
  blurInAppSwitcher: boolean;
  discreetNotifications: boolean;
  biometricLock: boolean;
  lockImmediately: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  isPrivacyMode: false,
  maskTransactions: true,
  blurInAppSwitcher: true,
  discreetNotifications: false,
  biometricLock: false,
  lockImmediately: false,
};

interface PrivacyContextType {
  settings: PrivacySettings;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  updateSetting: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void;
  maskAmount: (value: string | number, placeholder?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted privacy preferences from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_PRIVACY);
        if (stored) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
        }
      } catch (err) {
        console.warn('Failed to load privacy settings:', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Save changes to AsyncStorage
  const saveSettings = async (newSettings: PrivacySettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(newSettings));
    } catch (err) {
      console.warn('Failed to persist privacy settings:', err);
    }
  };

  const togglePrivacyMode = () => {
    saveSettings({
      ...settings,
      isPrivacyMode: !settings.isPrivacyMode,
    });
  };

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    saveSettings({
      ...settings,
      [key]: value,
    });
  };

  /**
   * Universal smart masking helper function:
   * Masks currency/numbers with "xxx" prefix while keeping the last 2 digits visible (e.g. ₹2,40,250 -> ₹xxx50).
   * - If the value ends with cents/decimals (e.g. .00), it preserves the last 2 digits of the main integer part or decimals.
   * - If the number is 0, it displays '0' or '₹0'.
   * - If only 1 digit exists (e.g. 5), it shows 'xxx5'.
   * - If a sign (+ or -) or currency prefix exists (₹ or $), it preserves them at the beginning.
   */
  const maskAmount = (value: string | number, fallbackPlaceholder?: string): string => {
    if (!settings.isPrivacyMode) {
      return String(value);
    }

    if (fallbackPlaceholder && fallbackPlaceholder !== '••••••••' && fallbackPlaceholder !== '••••••' && fallbackPlaceholder !== '••••') {
      return fallbackPlaceholder;
    }

    const str = String(value).trim();
    if (!str) return 'xxx';

    // Check if the value is zero
    if (str === '0' || str === '₹0' || str === '$0' || str === '₹0.00' || str === '$0.00') {
      return str.includes('₹') ? '₹0' : (str.includes('$') ? '$0' : '0');
    }

    // Extract leading sign (+, -) and currency symbol (₹, $)
    const prefixMatch = str.match(/^([+-]?\s*[₹$]?|[₹$]\s*[+-]?)/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const remainder = str.slice(prefix.length).trim();

    // Separate main integer number and decimal part if present (e.g. "2,40,250.00")
    const parts = remainder.split('.');
    const intDigits = parts[0].replace(/[^\d]/g, '');

    // Check for trailing suffix text like "past week" or "Available"
    const suffixMatch = remainder.match(/\s+[A-Za-z].*$/);
    const suffix = suffixMatch ? suffixMatch[0] : '';

    if (!intDigits || intDigits === '0') {
      return `${prefix}0${suffix}`;
    }

    if (intDigits.length === 1) {
      return `${prefix}xxx${intDigits}${suffix}`;
    }

    // Grab the last 2 digits of the integer amount
    const lastTwo = intDigits.slice(-2);
    return `${prefix}xxx${lastTwo}${suffix}`;
  };

  return (
    <PrivacyContext.Provider
      value={{
        settings,
        isPrivacyMode: settings.isPrivacyMode,
        togglePrivacyMode,
        updateSetting,
        maskAmount,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
