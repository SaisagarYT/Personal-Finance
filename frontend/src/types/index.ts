export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  currency: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Cash' | 'Investment';
  balance: number;
  currency: string;
  color: string;
  created_at: string;
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
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
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
