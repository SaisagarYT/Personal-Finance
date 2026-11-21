import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/career/opportunities - Get Kanban opportunities
 */
router.get('/opportunities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('job_opportunities')
      .select(`
        *,
        interview_rounds (*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ opportunities: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/career/opportunities - Create a job opportunity
 */
router.post('/opportunities', async (req, res) => {
  try {
    const { company, role_title, source = 'job_board', location, work_mode = 'remote', salary_min, salary_max, current_stage = 'applied', fit_score = 4, deadline, job_link, goal_id } = req.body;
    if (!company || !role_title) return res.status(400).json({ error: 'Company and role title are required' });

    const { data, error } = await supabase
      .from('job_opportunities')
      .insert([{
        user_id: req.user.id,
        company,
        role_title,
        source,
        location: location || null,
        work_mode,
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        current_stage,
        fit_score,
        deadline: deadline || null,
        job_link: job_link || null,
        goal_id: goal_id || null,
      }])
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'career', 'career.application.created', {
      opportunity_id: data.id,
      company: data.company,
      role: data.role_title,
      stage: data.current_stage,
    });

    res.status(201).json({ opportunity: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/career/opportunities/:id/stage - Move opportunity stage
 */
router.patch('/opportunities/:id/stage', async (req, res) => {
  try {
    const oppId = req.params.id;
    const { stage, outcome_reason } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage is required' });

    const isClosed = ['offer', 'rejected', 'withdrawn'].includes(stage);

    const { data: updated, error } = await supabase
      .from('job_opportunities')
      .update({
        current_stage: stage,
        outcome_reason: outcome_reason || null,
        closed_at: isClosed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', oppId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'career', 'career.application.updated', {
      opportunity_id: oppId,
      company: updated.company,
      new_stage: stage,
    });

    res.json({ opportunity: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/career/opportunities/:id/rounds - Schedule an interview round
 */
router.post('/opportunities/:id/rounds', async (req, res) => {
  try {
    const oppId = req.params.id;
    const { round_name, round_type = 'technical', scheduled_at, format = 'video', location_or_link, duration_minutes = 60 } = req.body;
    if (!round_name) return res.status(400).json({ error: 'Round name is required' });

    const { data, error } = await supabase
      .from('interview_rounds')
      .insert([{
        user_id: req.user.id,
        opportunity_id: oppId,
        round_name,
        round_type,
        scheduled_at: scheduled_at || new Date().toISOString(),
        format,
        location_or_link: location_or_link || null,
        duration_minutes,
        status: 'scheduled',
      }])
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'career', 'career.interview.scheduled', {
      round_id: data.id,
      opportunity_id: oppId,
      scheduled_at: data.scheduled_at,
    });

    res.status(201).json({ round: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/career/stories - Get STAR story bank
 */
router.get('/stories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('star_stories')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ stories: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/career/stories - Add STAR story
 */
router.post('/stories', async (req, res) => {
  try {
    const { title, situation, task, action, result, competency_tags } = req.body;
    if (!title || !situation || !task || !action || !result) {
      return res.status(400).json({ error: 'Title, Situation, Task, Action, and Result are all required.' });
    }

    const { data, error } = await supabase
      .from('star_stories')
      .insert([{
        user_id: req.user.id,
        title,
        situation,
        task,
        action,
        result,
        competency_tags: competency_tags || ['problem_solving'],
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ story: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
