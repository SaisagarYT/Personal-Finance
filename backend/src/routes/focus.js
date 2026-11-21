import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/focus/today - Get today's total focus metrics
 */
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    const { data: sessions, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('start_at', startOfDay)
      .lte('start_at', endOfDay)
      .eq('status', 'completed');

    if (error) throw error;

    const totalSeconds = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
    const deepWorkSeconds = sessions?.filter(s => s.is_deep_work).reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
    const totalMinutes = Math.round(totalSeconds / 60);
    const deepWorkRatio = totalSeconds > 0 ? Math.round((deepWorkSeconds / totalSeconds) * 100) : 100;

    res.json({
      date: today,
      total_minutes: totalMinutes,
      session_count: sessions?.length || 0,
      deep_work_ratio: deepWorkRatio,
      sessions: sessions || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/focus/sessions/start - Start a new focus session
 */
router.post('/sessions/start', async (req, res) => {
  try {
    const { project_id, goal_id, category = 'deep_work', intention, is_deep_work = true } = req.body;

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([{
        user_id: req.user.id,
        project_id: project_id || null,
        goal_id: goal_id || null,
        category,
        intention: intention || null,
        is_deep_work,
        status: 'active',
        start_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ session: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/focus/sessions/:id/stop - Complete an active focus session
 */
router.post('/sessions/:id/stop', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { note, distraction_count = 0 } = req.body;

    const { data: session, error: fetchErr } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !session) return res.status(404).json({ error: 'Session not found' });

    const endAt = new Date();
    const startAt = new Date(session.start_at);
    const durationSeconds = Math.max(60, Math.floor((endAt.getTime() - startAt.getTime()) / 1000));

    const { data: updated, error } = await supabase
      .from('focus_sessions')
      .update({
        end_at: endAt.toISOString(),
        duration_seconds: durationSeconds,
        status: 'completed',
        note: note || session.note,
        interruption_count: distraction_count,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Fire event to auto-check habits and update goal hours
    await EventBusService.publish(req.user.id, 'time_focus', 'focus.session.completed', {
      session_id: sessionId,
      duration_seconds: durationSeconds,
      category: session.category,
      goal_id: session.goal_id,
      is_deep_work: session.is_deep_work,
    });

    res.json({ session: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/focus/sessions/:id/distraction - Log an interruption/distraction
 */
router.post('/sessions/:id/distraction', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason is required' });

    const { data, error } = await supabase
      .from('focus_distractions')
      .insert([{
        user_id: req.user.id,
        session_id: sessionId,
        reason,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ distraction: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
