import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import all module routes
import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import categoriesRoutes from './routes/categories.js';
import transactionsRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';
import budgetsRoutes from './routes/budgets.js';
import savingsRoutes from './routes/savings.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import goalsRoutes from './routes/goals.js';
import habitsRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import tasksRoutes from './routes/tasks.js';
import learningRoutes from './routes/learning.js';
import careerRoutes from './routes/career.js';
import journalRoutes from './routes/journal.js';
import eventsRoutes from './routes/events.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 0. Core Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'life-os-api',
    modules: [
      'core_event_bus',
      '01_goals_and_habits',
      '02_time_and_focus',
      '03_tasks_and_planner',
      '04_learning',
      '05_career_pipeline',
      '06_finance',
      '07_journal_and_mood',
      'ai_assistant_safety_proxy'
    ],
    timestamp: new Date().toISOString(),
  });
});

// 1. Finance & Auth
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// 2. Life OS Modules
app.use('/api/goals', goalsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/journal', journalRoutes);

// 3. Core Event Bus & AI Proxy
app.use('/api/events', eventsRoutes);
app.use('/api/ai', aiRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: 'Server Error', message: err.message });
});

export default app;
