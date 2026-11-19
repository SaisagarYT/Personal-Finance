import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { account_id, type, limit = 50 } = req.query;

  let query = supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      description,
      transaction_date,
      created_at,
      accounts ( id, name, type, color, currency ),
      categories ( id, name, type, icon, color )
    `)
    .eq('user_id', req.user.id)
    .order('transaction_date', { ascending: false })
    .limit(Number(limit));

  if (account_id) query = query.eq('account_id', account_id);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { account_id, category_id, amount, type, description, transaction_date } = req.body;

  if (!account_id || !amount || !type) {
    return res.status(400).json({ error: 'account_id, amount, and type are required' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('id, balance, currency')
    .eq('id', account_id)
    .eq('user_id', req.user.id)
    .single();

  if (accError || !account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const accountCurrency = (account.currency || 'USD').toUpperCase();
  const inputCurrency = (req.body.currency || accountCurrency).toUpperCase();

  let finalAmount = numAmount;
  if (inputCurrency !== accountCurrency) {
    if (inputCurrency === 'INR' && accountCurrency === 'USD') {
      finalAmount = numAmount / 83.5;
    } else if (inputCurrency === 'USD' && accountCurrency === 'INR') {
      finalAmount = numAmount * 83.5;
    }
  }
  finalAmount = parseFloat(finalAmount.toFixed(2));

  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: req.user.id,
        account_id,
        category_id: category_id || null,
        amount: finalAmount,
        type,
        description: description || '',
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
      },
    ])
    .select()
    .single();

  if (txError) return res.status(500).json({ error: txError.message });

  const currentBalance = parseFloat(account.balance);
  const newBalance = type === 'income' ? currentBalance + finalAmount : currentBalance - finalAmount;

  await supabase
    .from('accounts')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', account_id);

  res.status(201).json({ ...transaction, new_balance: newBalance });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError || !tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const { error: delError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (delError) return res.status(500).json({ error: delError.message });

  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', tx.account_id)
    .single();

  if (account) {
    const curBalance = parseFloat(account.balance);
    const reverted = tx.type === 'income' ? curBalance - parseFloat(tx.amount) : curBalance + parseFloat(tx.amount);
    await supabase.from('accounts').update({ balance: reverted }).eq('id', tx.account_id);
  }

  res.json({ message: 'Transaction deleted' });
});

export default router;
