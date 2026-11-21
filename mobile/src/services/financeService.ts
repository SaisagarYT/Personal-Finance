import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Cash' | 'Investment';
  balance: number;
  currency: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  transaction_date: string;
  created_at: string;
  account?: Account;
}

const CACHE_KEY_ACCOUNTS = '@sinance_cache_accounts';
const CACHE_KEY_TRANSACTIONS = '@sinance_cache_transactions';

export const FinanceService = {
  /**
   * Fetch accounts: reads from local cache first, then fetches fresh data from Supabase.
   */
  async getAccounts(userId?: string): Promise<{ data: Account[]; source: 'cache' | 'network'; error?: string }> {
    try {
      // 1. Fetch from Supabase if we have a user or active session
      const query = supabase.from('accounts').select('*').order('created_at', { ascending: true });
      if (userId) {
        query.eq('user_id', userId);
      }
      const { data, error } = await query;

      if (!error && data) {
        // Update cache
        await AsyncStorage.setItem(CACHE_KEY_ACCOUNTS, JSON.stringify(data));
        return { data: data as Account[], source: 'network' };
      }

      // If network fails, read cache
      const cached = await AsyncStorage.getItem(CACHE_KEY_ACCOUNTS);
      if (cached) {
        return { data: JSON.parse(cached), source: 'cache', error: error?.message };
      }

      return { data: [], source: 'network', error: error?.message };
    } catch (err: any) {
      const cached = await AsyncStorage.getItem(CACHE_KEY_ACCOUNTS);
      if (cached) {
        return { data: JSON.parse(cached), source: 'cache', error: err.message };
      }
      return { data: [], source: 'network', error: err.message };
    }
  },

  /**
   * Fetch recent transactions
   */
  async getTransactions(userId?: string, limit = 20): Promise<{ data: Transaction[]; source: 'cache' | 'network'; error?: string }> {
    try {
      const query = supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (!error && data) {
        await AsyncStorage.setItem(CACHE_KEY_TRANSACTIONS, JSON.stringify(data));
        return { data: data as Transaction[], source: 'network' };
      }

      const cached = await AsyncStorage.getItem(CACHE_KEY_TRANSACTIONS);
      if (cached) {
        return { data: JSON.parse(cached), source: 'cache', error: error?.message };
      }

      return { data: [], source: 'network', error: error?.message };
    } catch (err: any) {
      const cached = await AsyncStorage.getItem(CACHE_KEY_TRANSACTIONS);
      if (cached) {
        return { data: JSON.parse(cached), source: 'cache', error: err.message };
      }
      return { data: [], source: 'network', error: err.message };
    }
  },

  /**
   * Add a new transaction
   */
  async addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([tx])
      .select()
      .single();

    return { data: data as Transaction | null, error };
  },

  /**
   * Calculate total balance from an array of accounts
   */
  calculateTotalBalance(accounts: Account[]): number {
    return accounts.reduce((acc, account) => acc + Number(account.balance), 0);
  },
};
