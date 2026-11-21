import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/habits - List habits with today's status
 */
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [habitsRes, checkinsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', req.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_checkins')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('checkin_date', today),
    ]);

    if (habitsRes.error) throw habitsRes.error;

    const checkinMap = new Map();
    checkinsRes.data?.forEach((c) => checkinMap.set(c.habit_id, c));

    const habitsWithToday = habitsRes.data.map((h) => ({
      ...h,
      today_checkin: checkinMap.get(h.id) || null,
      is_done_today: checkinMap.get(h.id)?.kind === 'done',
    }));

    res.json({ habits: habitsWithToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/habits - Create a habit
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, frequency_type, weekdays, times_per_week, target_amount, target_unit, goal_id, reminder_time, auto_check_category, auto_check_min_minutes } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required' });

    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: req.user.id,
        name,
        description,
        frequency_type: frequency_type || 'daily',
        weekdays: weekdays || [0, 1, 2, 3, 4, 5, 6],
        times_per_week: times_per_week || 7,
        target_amount: target_amount || 1,
        target_unit: target_unit || 'times',
        goal_id: goal_id || null,
        reminder_time: reminder_time || null,
        auto_check_category: auto_check_category || null,
        auto_check_min_minutes: auto_check_min_minutes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ habit: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/habits/:id/checkin - Check in for today or a specific date
 */
router.post('/:id/checkin', async (req, res) => {
  try {
    const habitId = req.params.id;
    const { checkin_date, kind = 'done', amount = 1, note } = req.body;
    const targetDate = checkin_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_checkins')
      .upsert([{
        user_id: req.user.id,
        habit_id: habitId,
        checkin_date: targetDate,
        kind,
        amount,
        note: note || null,
        source: 'manual',
      }], { onConflict: 'habit_id,checkin_date' })
      .select()
      .single();

    if (error) throw error;

    // Recalculate streak
    await EventBusService.recalculateStreak(req.user.id, habitId);

    // Publish event
    await EventBusService.publish(req.user.id, 'habits', 'habit.checked', {
      habit_id: habitId,
      checkin_date: targetDate,
      kind,
    });

    // Fetch updated habit
    const { data: updatedHabit } = await supabase.from('habits').select('*').eq('id', habitId).single();

    res.json({ checkin: data, habit: updatedHabit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
