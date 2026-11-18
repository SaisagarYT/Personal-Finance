import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/categories - Get all categories (public defaults + user custom)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${req.user.id}`)
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/categories - Create custom category
router.post('/', async (req, res) => {
  const { name, type, icon, color } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type (income/expense) are required' });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        user_id: req.user.id,
        name,
        type,
        icon: icon || 'tag',
        color: color || '#10B981',
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
