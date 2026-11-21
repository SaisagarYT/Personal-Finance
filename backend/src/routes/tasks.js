import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/tasks - List tasks with filters
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'open', quadrant, scheduled_date, priority } = req.query;
    let query = supabase
      .from('tasks')
      .select(`
        *,
        subtasks (*)
      `)
      .eq('user_id', req.user.id)
      .is('deleted_at', null)
      .order('scheduled_position', { ascending: true })
      .order('priority', { ascending: true });

    if (status) query = query.eq('status', status);
    if (quadrant) query = query.eq('quadrant', quadrant);
    if (scheduled_date) query = query.eq('scheduled_date', scheduled_date);
    if (priority) query = query.eq('priority', parseInt(priority));

    const { data, error } = await query;
    if (error) throw error;
    res.json({ tasks: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tasks/planner/today - Get today's plan with time budget
 */
router.get('/planner/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [tasksRes, planRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('scheduled_date', today)
        .is('deleted_at', null)
        .order('scheduled_position', { ascending: true }),
      supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('date', today)
        .maybeSingle(),
    ]);

    if (tasksRes.error) throw tasksRes.error;

    const tasks = tasksRes.data || [];
    const totalAllocatedMinutes = tasks.reduce((acc, t) => acc + (t.estimate_minutes || 0), 0);
    const budgetMinutes = planRes.data?.time_budget_minutes || 480; // 8 hrs default

    res.json({
      date: today,
      time_budget_minutes: budgetMinutes,
      allocated_minutes: totalAllocatedMinutes,
      remaining_minutes: Math.max(0, budgetMinutes - totalAllocatedMinutes),
      is_over_budget: totalAllocatedMinutes > budgetMinutes,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tasks - Create a task
 */
router.post('/', async (req, res) => {
  try {
    const { title, notes, priority = 2, quadrant = 'Q2', due_date, scheduled_date, estimate_minutes = 30, goal_id, milestone_id, list_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: req.user.id,
        title,
        notes: notes || null,
        priority,
        quadrant,
        due_date: due_date || null,
        scheduled_date: scheduled_date || null,
        estimate_minutes,
        goal_id: goal_id || null,
        milestone_id: milestone_id || null,
        list_id: list_id || null,
        status: 'open',
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ task: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/tasks/:id/toggle - Toggle task status done / open
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { data: task, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !task) return res.status(404).json({ error: 'Task not found' });

    const isDone = task.status === 'done';
    const newStatus = isDone ? 'open' : 'done';
    const completedAt = isDone ? null : new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    if (!isDone) {
      await EventBusService.publish(req.user.id, 'tasks', 'task.completed', {
        task_id: taskId,
        goal_id: task.goal_id,
        milestone_id: task.milestone_id,
        title: task.title,
      });
    }

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tasks/planner/budget - Set today's time budget ceiling
 */
router.post('/planner/budget', async (req, res) => {
  try {
    const { date, time_budget_minutes = 480, notes } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_plans')
      .upsert([{
        user_id: req.user.id,
        date: targetDate,
        time_budget_minutes,
        notes: notes || null,
      }], { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    res.json({ plan: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
