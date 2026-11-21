import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * Helper to compute human-friendly countdown relative to today
 */
function computeDueCountdown(dueDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
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
 * Format date like "24 Nov"
 */
function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * GET /api/subscriptions - List user's subscriptions with live countdowns
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('next_due_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map((sub) => {
      const countdown = computeDueCountdown(sub.next_due_date);
      const shortDate = formatShortDate(sub.next_due_date);
      return {
        ...sub,
        dueCountdown: countdown,
        dueDate: shortDate,
        amountFormatted: `₹${Number(sub.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      };
    });

    res.json({ subscriptions: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/subscriptions - Create a subscription / recurring bill
 */
router.post('/', async (req, res) => {
  try {
    const { name, category = 'streaming', amount, billing_cycle = 'monthly', next_due_date, is_auto_pay = false, notes } = req.body;
    if (!name || !amount || !next_due_date) {
      return res.status(400).json({ error: 'name, amount, and next_due_date are required' });
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: req.user.id,
        name: name.trim(),
        category,
        amount: parseFloat(amount),
        currency: 'INR',
        billing_cycle,
        next_due_date,
        is_auto_pay: Boolean(is_auto_pay),
        status: 'active',
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) throw error;

    const countdown = computeDueCountdown(data.next_due_date);
    const shortDate = formatShortDate(data.next_due_date);

    res.status(201).json({
      subscription: {
        ...data,
        dueCountdown: countdown,
        dueDate: shortDate,
        amountFormatted: `₹${Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/subscriptions/:id - Update or toggle auto-pay
 */
router.patch('/:id', async (req, res) => {
  try {
    const subId = req.params.id;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    delete updates.user_id;

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      subscription: {
        ...data,
        dueCountdown: computeDueCountdown(data.next_due_date),
        dueDate: formatShortDate(data.next_due_date),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/subscriptions/:id - Delete a subscription
 */
router.delete('/:id', async (req, res) => {
  try {
    const subId = req.params.id;
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Subscription removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
