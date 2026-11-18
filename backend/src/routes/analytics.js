import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req, res) => {
  const userId = req.user.id;

  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId);

  if (accError) return res.status(500).json({ error: accError.message });

  const totalBalance = (accounts || []).reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, type, categories ( name )')
    .eq('user_id', userId)
    .gte('transaction_date', startOfMonth);

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
      const cat = tx.categories?.name || 'Uncategorized';
      categorySpending[cat] = (categorySpending[cat] || 0) + amount;
    }
  });

  res.json({
    total_balance: totalBalance,
    month_income: monthIncome,
    month_expenses: monthExpenses,
    savings: monthIncome - monthExpenses,
    category_spending: Object.entries(categorySpending).map(([name, total]) => ({
      name,
      total,
    })),
  });
});

export default router;
