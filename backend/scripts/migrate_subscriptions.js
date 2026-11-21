import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- 1. Subscriptions & Recurring Bills Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'streaming',
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'quarterly', 'weekly'
    next_due_date DATE NOT NULL,
    is_auto_pay BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Users manage own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Seed Initial Subscriptions for user saisagarsylada@gmail.com
INSERT INTO public.subscriptions (user_id, name, category, amount, currency, billing_cycle, next_due_date, is_auto_pay)
VALUES
    ('cd46d24f-b343-4a04-a4c0-b6ae53da9373', 'Netflix Premium', 'streaming', 649.00, 'INR', 'monthly', CURRENT_DATE + INTERVAL '3 days', true),
    ('cd46d24f-b343-4a04-a4c0-b6ae53da9373', 'Airtel Xstream Fibre', 'internet', 999.00, 'INR', 'monthly', CURRENT_DATE + INTERVAL '7 days', false),
    ('cd46d24f-b343-4a04-a4c0-b6ae53da9373', 'Bescom Electricity Bill', 'utility', 1450.00, 'INR', 'monthly', CURRENT_DATE + INTERVAL '12 days', false)
ON CONFLICT DO NOTHING;
`;

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');
  console.log('Applying subscriptions table migration...');
  await client.query(sql);
  console.log('Subscriptions table & RLS policies created successfully!');

  const res = await client.query('SELECT id, name, category, amount, next_due_date, is_auto_pay FROM public.subscriptions;');
  console.log('Current subscriptions in database:');
  console.table(res.rows);
  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
