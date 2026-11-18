import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/accounts - List all accounts for current user
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/accounts - Create an account
router.post('/', async (req, res) => {
  const { name, type, balance, currency, color } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and account type are required' });
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert([
      {
        user_id: req.user.id,
        name,
        type,
        balance: balance || 0.0,
        currency: currency || 'USD',
        color: color || '#3B82F6',
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/accounts/:id - Update an account
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, balance, color } = req.body;

  const { data, error } = await supabase
    .from('accounts')
    .update({ name, type, balance, color, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/accounts/:id - Delete an account
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Account deleted successfully' });
});

export default router;
