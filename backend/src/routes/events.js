import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/events/log - View recent event bus log
 */
router.get('/log', async (req, res) => {
  try {
    const { limit = 50, module_id } = req.query;
    let query = supabase
      .from('event_log')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (module_id) query = query.eq('module_id', module_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ events: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/events/publish - Manually dispatch an event to the bus
 */
router.post('/publish', async (req, res) => {
  try {
    const { module_id, event_type, payload } = req.body;
    if (!module_id || !event_type) {
      return res.status(400).json({ error: 'module_id and event_type are required' });
    }

    const eventRecord = await EventBusService.publish(
      req.user.id,
      module_id,
      event_type,
      payload || {}
    );

    res.status(201).json({ event: eventRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
