import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
router.use(requireAuth);

// Deterministic keywords that immediately trigger crisis support intervention
const CRISIS_TRIGGER_WORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die', 'self harm',
  'hurt myself', 'cutting myself', 'can’t go on', "cannot go on"
];

const CRISIS_RESOURCES = {
  is_crisis: true,
  message: "We noticed you might be going through a difficult time. Please reach out to someone who can help. You don't have to carry this alone.",
  hotlines: [
    { country: 'India', name: 'KIRAN Mental Health Helpline', phone: '1800-599-0019' },
    { country: 'India', name: 'Vandrevala Foundation', phone: '+91 9999 666 555' },
    { country: 'US / Canada', name: 'Suicide & Crisis Lifeline', phone: '988' },
    { country: 'UK', name: 'Samaritans', phone: '116 123' },
    { country: 'International', name: 'Befrienders Worldwide', url: 'https://www.befrienders.org' }
  ],
};

/**
 * POST /api/ai/query - AI Assistant Proxy Endpoint
 */
router.post('/query', async (req, res) => {
  try {
    const { prompt, context = {} } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // 1. Mandatory Deterministic Safety Gate Check
    const lowerPrompt = prompt.toLowerCase();
    const isCrisisDetected = CRISIS_TRIGGER_WORDS.some(w => lowerPrompt.includes(w));

    if (isCrisisDetected) {
      console.warn(`[AI Safety Gate] Crisis keyword detected for user ${req.user.id}. Bypassing AI model.`);
      return res.json({
        type: 'safety_gate_intercept',
        ...CRISIS_RESOURCES,
      });
    }

    // 2. Fetch minimal user context (active goals, streak stats, cash balance)
    const [goalsRes, habitsRes, accountsRes] = await Promise.all([
      supabase.from('goals').select('title, current_value, target_value, unit').eq('user_id', req.user.id).eq('status', 'active').limit(5),
      supabase.from('habits').select('name, current_streak').eq('user_id', req.user.id).eq('status', 'active').limit(5),
      supabase.from('accounts').select('name, balance').eq('user_id', req.user.id),
    ]);

    const activeGoals = goalsRes.data || [];
    const activeHabits = habitsRes.data || [];
    const totalBalance = accountsRes.data?.reduce((acc, a) => acc + Number(a.balance), 0) || 0;

    // 3. Mock AI tool calling & reflection generator (extensible to Anthropic / Gemini API)
    // Write actions always return ConfirmationCard requiring user approval
    const lower = prompt.toLowerCase();

    if (lower.includes('add task') || lower.includes('create task')) {
      const taskTitle = prompt.replace(/add task|create task/i, '').trim() || 'Review weekly goals';
      return res.json({
        type: 'confirmation_card',
        action: 'tasks.createTask',
        confirmation_required: true,
        summary: `Create task: "${taskTitle}"`,
        payload: {
          title: taskTitle,
          priority: 2,
          quadrant: 'Q2',
          scheduled_date: new Date().toISOString().split('T')[0],
          estimate_minutes: 30,
        },
      });
    }

    if (lower.includes('log expense') || lower.includes('spent')) {
      const match = prompt.match(/\d+/);
      const amount = match ? parseInt(match[0]) : 500;
      return res.json({
        type: 'confirmation_card',
        action: 'finance.addTransaction',
        confirmation_required: true,
        summary: `Record expense of ₹${amount.toLocaleString('en-IN')}`,
        payload: {
          amount,
          type: 'expense',
          description: prompt,
        },
      });
    }

    // General Life OS Contextual Advice
    res.json({
      type: 'text_response',
      content: `Here is your current Life OS status: You have ${activeGoals.length} active goals and ${activeHabits.length} habits tracked. Total net cash reserve is ₹${totalBalance.toLocaleString('en-IN')}. How can I assist you with your planner, career pipeline, or habits today?`,
      context_used: {
        active_goals_count: activeGoals.length,
        habits_tracked: activeHabits.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
