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
   * Universal masking helper function:
   * Masks numbers with dots (e.g. ₹2,40,250.00 -> ••••••••) when privacy mode is enabled.
   */
  const maskAmount = (value: string | number, placeholder: string = '••••••••'): string => {
    if (!settings.isPrivacyMode) {
      return String(value);
    }
    return placeholder;
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
