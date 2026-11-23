import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  name: string;
  email: string;
  avatarUri: string | null;
  bio?: string;
  updatedAt: string;
}

const PROFILE_STORAGE_KEY = '@sinance_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Sagar',
  email: 'sagar@sinance.app',
  avatarUri: null,
  bio: 'Personal finance enthusiast & investor',
  updatedAt: new Date().toISOString(),
};

export const ProfileService = {
  async getProfile(userId?: string): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      let localProfile = stored ? JSON.parse(stored) : DEFAULT_PROFILE;

      // If user is authenticated, sync with Supabase metadata
      if (userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          const syncedProfile: UserProfile = {
            name: meta.full_name || localProfile.name,
            email: user.email || localProfile.email,
            avatarUri: meta.avatar_url !== undefined ? meta.avatar_url : localProfile.avatarUri,
            bio: meta.bio || localProfile.bio,
            updatedAt: new Date().toISOString(),
          };
          await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(syncedProfile));
          return syncedProfile;
        }
      }

      return localProfile;
    } catch (err) {
      console.warn('Failed to load profile from storage:', err);
      return DEFAULT_PROFILE;
    }
  },

  async saveProfile(updates: Partial<UserProfile>, userId?: string): Promise<UserProfile> {
    try {
      const current = await this.getProfile(userId);
      const updated: UserProfile = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

      // Sync with Supabase if logged in
      if (userId) {
        await supabase.auth.updateUser({
          data: {
            full_name: updated.name,
            avatar_url: updated.avatarUri,
            bio: updated.bio,
          },
        });
      }

      return updated;
    } catch (err) {
      console.warn('Failed to save profile:', err);
      throw err;
    }
  },

  async deleteAvatar(userId?: string): Promise<UserProfile> {
    return this.saveProfile({ avatarUri: null }, userId);
  },

  async deleteProfile(userId?: string): Promise<UserProfile> {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      if (userId) {
        await supabase.auth.updateUser({
          data: {
            full_name: 'Sagar',
            avatar_url: null,
            bio: '',
          },
        });
      }
      return DEFAULT_PROFILE;
    } catch (err) {
      console.warn('Failed to delete profile data:', err);
      return DEFAULT_PROFILE;
    }
  },
};
