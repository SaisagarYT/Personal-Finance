import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/budgets - Get budgets for current month with actual spending
 */
router.get('/', async (req, res) => {
  try {
    const period = req.query.period || new Date().toISOString().substring(0, 7); // 'YYYY-MM'

    const [budgetsRes, txRes] = await Promise.all([
      supabase
        .from('budgets')
        .select(`
          *,
          categories (name, icon, color)
        `)
        .eq('user_id', req.user.id)
        .eq('period_month', period),
      supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', req.user.id)
        .eq('type', 'expense')
        .gte('transaction_date', `${period}-01`)
        .lte('transaction_date', `${period}-31`),
    ]);

    if (budgetsRes.error) throw budgetsRes.error;

    // Aggregate spending by category
    const spendingMap = new Map();
    txRes.data?.forEach(t => {
      const catId = t.category_id || 'uncategorized';
      spendingMap.set(catId, (spendingMap.get(catId) || 0) + Number(t.amount));
    });

    const budgetsWithSpent = budgetsRes.data.map(b => {
      const spent = spendingMap.get(b.category_id) || 0;
      const limit = Number(b.limit_amount);
      const remaining = Math.max(0, limit - spent);
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return {
        ...b,
        spent_amount: spent,
        remaining_amount: remaining,
        percentage_used: percent,
        is_over_budget: spent > limit,
      };
    });

    res.json({ period, budgets: budgetsWithSpent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/budgets - Set or update budget limit
 */
router.post('/', async (req, res) => {
  try {
    const { category_id, limit_amount, period_month, rollover = false } = req.body;
    if (!category_id || !limit_amount) {
      return res.status(400).json({ error: 'category_id and limit_amount are required' });
    }

    const period = period_month || new Date().toISOString().substring(0, 7);

    const { data, error } = await supabase
      .from('budgets')
      .upsert([{
        user_id: req.user.id,
        category_id,
        period_month: period,
        limit_amount: parseFloat(limit_amount),
        rollover,
      }], { onConflict: 'user_id,category_id,period_month' })
      .select(`
        *,
        categories (name, icon, color)
      `)
      .single();

    if (error) throw error;
    res.status(201).json({ budget: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
