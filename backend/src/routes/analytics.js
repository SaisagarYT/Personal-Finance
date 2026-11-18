import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/analytics/summary - Get total balance, monthly income, monthly expenses
router.get('/summary', async (req, res) => {
  const userId = req.user.id;

  // 1. Total Net Worth / Balance across accounts
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId);

  if (accError) return res.status(500).json({ error: accError.message });

  const totalBalance = (accounts || []).reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  // 2. Current Month Income & Expenses
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, type, category_id, categories ( name, color )')
    .eq('user_id', userId)
    .gte('transaction_date', firstDayOfMonth);

  if (txError) return res.status(500).json({ error: txError.message });

  let monthIncome = 0;
  let monthExpenses = 0;
  const categorySpending = {};

  (transactions || []).forEach((tx) => {
    const amount = parseFloat(tx.amount);
    if (tx.type === 'income') {
      monthIncome += amount;
    } else if (tx.type === 'expense') {
      monthExpenses += amount;
      const catName = tx.categories?.name || 'Uncategorized';
      categorySpending[catName] = (categorySpending[catName] || 0) + amount;
    }
  });

  res.json({
    total_balance: totalBalance,
    month_income: monthIncome,
    month_expenses: monthExpenses,
    savings_rate: monthIncome > 0 ? (((monthIncome - monthExpenses) / monthIncome) * 100).toFixed(1) : 0,
    category_spending: Object.entries(categorySpending).map(([name, total]) => ({
      name,
      total,
    })),
  });
});

export default router;
