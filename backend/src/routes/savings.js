import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/savings - List all savings goals with progress
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const goalsWithProgress = (data || []).map(g => {
      const current = Number(g.current_amount || 0);
      const target = Number(g.target_amount || 1);
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        ...g,
        progress_percentage: pct,
        is_achieved: current >= target,
      };
    });

    res.json({ savings_goals: goalsWithProgress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/savings - Create savings goal
 */
router.post('/', async (req, res) => {
  try {
    const { name, target_amount, target_date, account_id, goal_id } = req.body;
    if (!name || !target_amount) {
      return res.status(400).json({ error: 'Name and target_amount are required' });
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{
        user_id: req.user.id,
        name,
        target_amount: parseFloat(target_amount),
        current_amount: 0,
        target_date: target_date || null,
        account_id: account_id || null,
        goal_id: goal_id || null,
        status: 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ savings_goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/savings/:id/contribute - Deposit towards savings goal
 */
router.post('/:id/contribute', async (req, res) => {
  try {
    const goalId = req.params.id;
    const { amount } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const { data: goal, error: fetchErr } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !goal) return res.status(404).json({ error: 'Savings goal not found' });

    const newCurrent = Number(goal.current_amount || 0) + numAmount;
    const isAchieved = newCurrent >= Number(goal.target_amount);

    const { data: updated, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newCurrent,
        status: isAchieved ? 'achieved' : goal.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'finance', 'finance.savings.deposited', {
      savings_goal_id: goalId,
      amount: numAmount,
      total_saved: newCurrent,
      is_achieved: isAchieved,
    });

    res.json({ savings_goal: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
