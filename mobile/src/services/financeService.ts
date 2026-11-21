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

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
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
  accounts?: {
    name: string;
    type: string;
    color: string;
  };
  categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

const CACHE_KEY_ACCOUNTS = '@sinance_cache_accounts';
const CACHE_KEY_TRANSACTIONS = '@sinance_cache_transactions';
const CACHE_KEY_CATEGORIES = '@sinance_cache_categories';

export const FinanceService = {
  /**
   * Fetch accounts: reads from local cache first, then fetches fresh data from Supabase.
   */
  async getAccounts(userId?: string): Promise<{ data: Account[]; source: 'cache' | 'network'; error?: string }> {
    try {
      const query = supabase.from('accounts').select('*').order('created_at', { ascending: true });
      if (userId) {
        query.eq('user_id', userId);
      }
      const { data, error } = await query;

      if (!error && data) {
        await AsyncStorage.setItem(CACHE_KEY_ACCOUNTS, JSON.stringify(data));
        return { data: data as Account[], source: 'network' };
      }

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
   * Create a new Account in Supabase & cache
   */
  async createAccount(acc: {
    user_id: string;
    name: string;
    type: Account['type'];
    balance: number;
    currency?: string;
    color?: string;
  }): Promise<{ data: Account | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: acc.user_id,
          name: acc.name,
          type: acc.type,
          balance: acc.balance,
          currency: acc.currency || 'INR',
          color: acc.color || '#141414',
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Refresh local cache
        const cached = await AsyncStorage.getItem(CACHE_KEY_ACCOUNTS);
        const accounts: Account[] = cached ? JSON.parse(cached) : [];
        accounts.push(data as Account);
        await AsyncStorage.setItem(CACHE_KEY_ACCOUNTS, JSON.stringify(accounts));
      }

      return { data: data as Account, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Fetch recent transactions with accounts and categories joined
   */
  async getTransactions(userId?: string, limit = 25): Promise<{ data: Transaction[]; source: 'cache' | 'network'; error?: string }> {
    try {
      const query = supabase
        .from('transactions')
        .select(`
          *,
          accounts (name, type, color),
          categories (name, icon, color)
        `)
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
   * Record a deposit or withdrawal and update account balance atomically
   */
  async recordTransaction(tx: {
    user_id: string;
    account_id: string;
    category_id?: string | null;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    description?: string;
    transaction_date?: string;
  }): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const txDate = tx.transaction_date || new Date().toISOString().split('T')[0];

      // 1. Insert transaction
      const { data: newTx, error: txErr } = await supabase
        .from('transactions')
        .insert([{
          user_id: tx.user_id,
          account_id: tx.account_id,
          category_id: tx.category_id || null,
          amount: tx.amount,
          type: tx.type,
          description: tx.description || (tx.type === 'income' ? 'Deposit' : 'Withdrawal'),
          transaction_date: txDate,
        }])
        .select(`
          *,
          accounts (name, type, color),
          categories (name, icon, color)
        `)
        .single();

      if (txErr) throw txErr;

      // 2. Fetch current balance and update account
      const { data: currentAcc, error: accErr } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', tx.account_id)
        .single();

      if (!accErr && currentAcc) {
        const delta = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
        const newBalance = Math.max(0, Number(currentAcc.balance) + delta);

        await supabase
          .from('accounts')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', tx.account_id);
      }

      return { data: newTx as Transaction, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Fetch categories
   */
  async getCategories(userId?: string): Promise<{ data: Category[]; error?: string }> {
    try {
      let query = supabase.from('categories').select('*').order('name', { ascending: true });
      if (userId) {
        query = query.or(`user_id.is.null,user_id.eq.${userId}`);
      } else {
        query = query.is('user_id', null);
      }
      const { data, error } = await query;
      if (!error && data) {
        await AsyncStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(data));
        return { data: data as Category[] };
      }
      const cached = await AsyncStorage.getItem(CACHE_KEY_CATEGORIES);
      return { data: cached ? JSON.parse(cached) : [] };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  },

  /**
   * Calculate total balance from an array of accounts
   */
  calculateTotalBalance(accounts: Account[]): number {
    return accounts.reduce((acc, account) => acc + Number(account.balance), 0);
  },
};
