import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/goals - List all goals for the user with milestones
 */
router.get('/', async (req, res) => {
  try {
    const { status, area } = req.query;
    let query = supabase
      .from('goals')
      .select(`
        *,
        milestones (*)
      `)
      .eq('user_id', req.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (area) query = query.eq('area', area);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ goals: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/goals - Create a new goal
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, area, target_date, progress_mode, target_value, unit } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: req.user.id,
        title,
        description,
        area: area || 'personal',
        target_date: target_date || null,
        progress_mode: progress_mode || 'milestones',
        target_value: target_value || 100,
        unit: unit || '%',
      }])
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'goals', 'goal.created', { goal_id: data.id, title: data.title });
    res.status(201).json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/goals/:id/milestones - Add milestone to a goal
 */
router.post('/:id/milestones', async (req, res) => {
  try {
    const goalId = req.params.id;
    const { title, due_date, target_value } = req.body;
    if (!title) return res.status(400).json({ error: 'Milestone title is required' });

    const { data, error } = await supabase
      .from('milestones')
      .insert([{
        user_id: req.user.id,
        goal_id: goalId,
        title,
        due_date: due_date || null,
        target_value: target_value || 1,
      }])
      .select()
      .single();

    if (error) throw error;

    await EventBusService.recalculateGoalProgress(req.user.id, goalId);
    res.status(201).json({ milestone: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/goals/milestones/:id/toggle - Toggle milestone completion
 */
router.patch('/milestones/:id/toggle', async (req, res) => {
  try {
    const milestoneId = req.params.id;
    const { data: milestone, error: fetchErr } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !milestone) return res.status(404).json({ error: 'Milestone not found' });

    const isCompleted = milestone.completed_at !== null;
    const newCompletedAt = isCompleted ? null : new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('milestones')
      .update({
        completed_at: newCompletedAt,
        current_value: isCompleted ? 0 : 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;

    await EventBusService.recalculateGoalProgress(req.user.id, milestone.goal_id);

    if (!isCompleted) {
      await EventBusService.publish(req.user.id, 'goals', 'goal.milestone.reached', {
        goal_id: milestone.goal_id,
        milestone_id: milestone.id,
        title: milestone.title,
      });
    }

    res.json({ milestone: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
