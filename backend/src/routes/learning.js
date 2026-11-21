import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/learning/items - List learning items
 */
router.get('/items', async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = supabase
      .from('learning_items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/learning/items - Add a learning item
 */
router.post('/items', async (req, res) => {
  try {
    const { title, type = 'course', url, provider, total_units = 10, unit_label = 'chapters', goal_id, skill_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('learning_items')
      .insert([{
        user_id: req.user.id,
        title,
        type,
        url: url || null,
        provider: provider || null,
        total_units,
        unit_label,
        goal_id: goal_id || null,
        skill_id: skill_id || null,
        status: 'in_progress',
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/learning/items/:id/progress - Update progress units
 */
router.patch('/items/:id/progress', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { completed_units } = req.body;

    const { data: item, error: fetchErr } = await supabase
      .from('learning_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !item) return res.status(404).json({ error: 'Item not found' });

    const newCompleted = Math.min(item.total_units, Math.max(0, parseInt(completed_units)));
    const isCompleted = newCompleted >= item.total_units;
    const newStatus = isCompleted ? 'completed' : 'in_progress';

    const { data: updated, error } = await supabase
      .from('learning_items')
      .update({
        completed_units: newCompleted,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    if (isCompleted && item.status !== 'completed') {
      await EventBusService.publish(req.user.id, 'learning', 'learning.item.completed', {
        item_id: itemId,
        skill_id: item.skill_id,
        title: item.title,
      });
    }

    res.json({ item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/learning/skills - List skills (levels 0 to 5)
 */
router.get('/skills', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', req.user.id)
      .order('current_level', { ascending: false });

    if (error) throw error;
    res.json({ skills: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/learning/flashcards/:id/review - Leitner 5-box review algorithm
 */
router.post('/flashcards/:id/review', async (req, res) => {
  try {
    const cardId = req.params.id;
    const { correct } = req.body; // boolean

    const { data: card, error: fetchErr } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', cardId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !card) return res.status(404).json({ error: 'Flashcard not found' });

    let newBox = card.box_level || 1;
    let daysToAdd = 1;

    if (correct) {
      newBox = Math.min(5, newBox + 1);
      // Leitner intervals: box 1: 1d, box 2: 3d, box 3: 7d, box 4: 14d, box 5: 30d
      const intervals = [1, 3, 7, 14, 30];
      daysToAdd = intervals[newBox - 1] || 1;
    } else {
      newBox = 1; // reset to box 1 on fail
      daysToAdd = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    const { data: updated, error } = await supabase
      .from('flashcards')
      .update({
        box_level: newBox,
        next_review_date: nextDate.toISOString().split('T')[0],
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    res.json({ flashcard: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
