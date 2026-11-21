import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BillCategory, BillItem } from '../components/UpcomingBillsSection';

export interface Subscription {
  id: string;
  user_id: string;
  account_id?: string | null;
  name: string;
  category: BillCategory;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
  next_due_date: string; // ISO date 'YYYY-MM-DD'
  is_auto_pay: boolean;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY_SUBSCRIPTIONS = '@sinance_cache_subscriptions';

/**
 * Format relative countdown string: "Due in 3 days", "Due tomorrow", "Due today", "Overdue"
 */
export function computeDueCountdown(dueDateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${diffDays} days`;
}

/**
 * Format short date: "24 Nov"
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export const SubscriptionService = {
  /**
   * Fetch active subscriptions with offline-first local cache fallback
   */
  async getSubscriptions(userId?: string): Promise<{
    data: Subscription[];
    billItems: BillItem[];
    source: 'cache' | 'network';
    error?: string;
  }> {
    try {
      // 1. Fetch from Supabase
      let query = supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('next_due_date', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (!error && data) {
        await AsyncStorage.setItem(CACHE_KEY_SUBSCRIPTIONS, JSON.stringify(data));
        const billItems = this.transformToBillItems(data as Subscription[]);
        return { data: data as Subscription[], billItems, source: 'network' };
      }

      // 2. Cache Fallback
      const cached = await AsyncStorage.getItem(CACHE_KEY_SUBSCRIPTIONS);
      if (cached) {
        const parsed = JSON.parse(cached) as Subscription[];
        return { data: parsed, billItems: this.transformToBillItems(parsed), source: 'cache', error: error?.message };
      }

      return { data: [], billItems: [], source: 'network', error: error?.message };
    } catch (err: any) {
      const cached = await AsyncStorage.getItem(CACHE_KEY_SUBSCRIPTIONS);
      if (cached) {
        const parsed = JSON.parse(cached) as Subscription[];
        return { data: parsed, billItems: this.transformToBillItems(parsed), source: 'cache', error: err.message };
      }
      return { data: [], billItems: [], source: 'network', error: err.message };
    }
  },

  /**
   * Create a new recurring subscription in Supabase & local cache
   */
  async createSubscription(sub: {
    user_id: string;
    name: string;
    category: BillCategory;
    amount: number;
    currency?: string;
    billing_cycle?: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
    next_due_date: string;
    is_auto_pay?: boolean;
    notes?: string;
  }): Promise<{ data: Subscription | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: sub.user_id,
          name: sub.name.trim(),
          category: sub.category,
          amount: sub.amount,
          currency: sub.currency || 'INR',
          billing_cycle: sub.billing_cycle || 'monthly',
          next_due_date: sub.next_due_date,
          is_auto_pay: Boolean(sub.is_auto_pay),
          status: 'active',
          notes: sub.notes || null,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Refresh local cache
        const cached = await AsyncStorage.getItem(CACHE_KEY_SUBSCRIPTIONS);
        const list: Subscription[] = cached ? JSON.parse(cached) : [];
        list.push(data as Subscription);
        list.sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
        await AsyncStorage.setItem(CACHE_KEY_SUBSCRIPTIONS, JSON.stringify(list));
      }

      return { data: data as Subscription, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Toggle auto-pay flag on a subscription
   */
  async toggleAutoPay(id: string, isAutoPay: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_auto_pay: isAutoPay, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update cache
      const cached = await AsyncStorage.getItem(CACHE_KEY_SUBSCRIPTIONS);
      if (cached) {
        const list: Subscription[] = JSON.parse(cached);
        const idx = list.findIndex(s => s.id === id);
        if (idx !== -1) {
          list[idx].is_auto_pay = isAutoPay;
          await AsyncStorage.setItem(CACHE_KEY_SUBSCRIPTIONS, JSON.stringify(list));
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete or cancel a subscription
   */
  async deleteSubscription(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;

      const cached = await AsyncStorage.getItem(CACHE_KEY_SUBSCRIPTIONS);
      if (cached) {
        const list: Subscription[] = JSON.parse(cached);
        const filtered = list.filter(s => s.id !== id);
        await AsyncStorage.setItem(CACHE_KEY_SUBSCRIPTIONS, JSON.stringify(filtered));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Helper: map Supabase Subscription rows into BillItem format expected by UI
   */
  transformToBillItems(subs: Subscription[]): BillItem[] {
    return subs.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      amount: `₹${Number(s.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      dueDate: formatShortDate(s.next_due_date),
      dueCountdown: computeDueCountdown(s.next_due_date),
      isAutoPay: s.is_auto_pay,
    }));
  },
};
