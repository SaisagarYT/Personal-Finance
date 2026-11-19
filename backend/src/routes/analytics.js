import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const convertCurrency = (amt, from = 'INR', to = 'INR') => {
  const f = (from || 'INR').toUpperCase();
  const t = (to || 'INR').toUpperCase();
  const val = Number(amt) || 0;
  if (f === t) return val;
  if (f === 'USD' && t === 'INR') return val * 83.5;
  if (f === 'INR' && t === 'USD') return val / 83.5;
  return val;
};

router.get('/summary', async (req, res) => {
  const userId = req.user.id;
  const targetCurrency = (req.query.currency || 'INR').toUpperCase();

  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('balance, currency')
    .eq('user_id', userId);

  if (accError) return res.status(500).json({ error: accError.message });

  const totalBalance = (accounts || []).reduce(
    (sum, a) => sum + convertCurrency(parseFloat(a.balance || 0), a.currency || 'INR', targetCurrency),
    0
  );

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, type, accounts ( currency ), categories ( name )')
    .eq('user_id', userId)
    .gte('transaction_date', startOfMonth);

  if (txError) return res.status(500).json({ error: txError.message });

  let monthIncome = 0;
  let monthExpenses = 0;
  const categorySpending = {};

  (transactions || []).forEach((tx) => {
    const rawAmt = parseFloat(tx.amount || 0);
    const txCurr = tx.accounts?.currency || 'INR';
    const amount = convertCurrency(rawAmt, txCurr, targetCurrency);

    if (tx.type === 'income') {
      monthIncome += amount;
    } else if (tx.type === 'expense') {
      monthExpenses += amount;
      const cat = tx.categories?.name || 'Uncategorized';
      categorySpending[cat] = (categorySpending[cat] || 0) + amount;
    }
  });

  res.json({
    currency: targetCurrency,
    total_balance: parseFloat(totalBalance.toFixed(2)),
    month_income: parseFloat(monthIncome.toFixed(2)),
    month_expenses: parseFloat(monthExpenses.toFixed(2)),
    savings: parseFloat((monthIncome - monthExpenses).toFixed(2)),
    category_spending: Object.entries(categorySpending).map(([name, total]) => ({
      name,
      total: parseFloat(total.toFixed(2)),
    })),
  });
});

export default router;
