import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/transactions - List all transactions with optional filters
router.get('/', async (req, res) => {
  const { account_id, type, start_date, end_date, limit = 50 } = req.query;

  let query = supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      description,
      transaction_date,
      created_at,
      accounts ( id, name, type, color ),
      categories ( id, name, type, icon, color )
    `)
    .eq('user_id', req.user.id)
    .order('transaction_date', { ascending: false })
    .limit(Number(limit));

  if (account_id) query = query.eq('account_id', account_id);
  if (type) query = query.eq('type', type);
  if (start_date) query = query.gte('transaction_date', start_date);
  if (end_date) query = query.lte('transaction_date', end_date);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/transactions - Create transaction and adjust account balance
router.post('/', async (req, res) => {
  const { account_id, category_id, amount, type, description, transaction_date } = req.body;

  if (!account_id || !amount || !type) {
    return res.status(400).json({ error: 'account_id, amount, and type are required' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  // 1. Verify account belongs to user
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('id, balance')
    .eq('id', account_id)
    .eq('user_id', req.user.id)
    .single();

  if (accError || !account) {
    return res.status(404).json({ error: 'Account not found or unauthorized' });
  }

  // 2. Insert transaction
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: req.user.id,
        account_id,
        category_id: category_id || null,
        amount: numAmount,
        type,
        description: description || '',
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
      },
    ])
    .select()
    .single();

  if (txError) return res.status(500).json({ error: txError.message });

  // 3. Update account balance (income increases, expense decreases)
  const currentBalance = parseFloat(account.balance);
  const newBalance = type === 'income' ? currentBalance + numAmount : currentBalance - numAmount;

  await supabase
    .from('accounts')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', account_id);

  res.status(201).json({ ...transaction, new_account_balance: newBalance });
});

// DELETE /api/transactions/:id - Delete transaction and revert balance
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // 1. Get existing transaction
  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError || !tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // 2. Delete transaction
  const { error: delError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (delError) return res.status(500).json({ error: delError.message });

  // 3. Revert balance on account
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', tx.account_id)
    .single();

  if (account) {
    const currentBalance = parseFloat(account.balance);
    const revertedBalance = tx.type === 'income' ? currentBalance - parseFloat(tx.amount) : currentBalance + parseFloat(tx.amount);

    await supabase
      .from('accounts')
      .update({ balance: revertedBalance, updated_at: new Date().toISOString() })
      .eq('id', tx.account_id);
  }

  res.json({ message: 'Transaction deleted successfully' });
});

export default router;
