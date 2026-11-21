import { supabase } from '../config/supabase.js';

export const JournalSnapshotService = {
  /**
   * Aggregate cross-module objective data for a specific day and return immutable snapshot
   */
  async generateDailySnapshot(userId, dateStr) {
    try {
      const startOfDay = `${dateStr}T00:00:00.000Z`;
      const endOfDay = `${dateStr}T23:59:59.999Z`;

      // 1. Focus Minutes
      const { data: focusSessions } = await supabase
        .from('focus_sessions')
        .select('duration_seconds, is_deep_work')
        .eq('user_id', userId)
        .gte('start_at', startOfDay)
        .lte('start_at', endOfDay)
        .eq('status', 'completed');

      const totalFocusSeconds = focusSessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
      const focusMinutes = Math.round(totalFocusSeconds / 60);

      // 2. Habits Done
      const { data: habits } = await supabase
        .from('habit_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('checkin_date', dateStr)
        .eq('kind', 'done');

      const habitsCompleted = habits?.length || 0;

      // 3. Tasks Completed
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .gte('completed_at', startOfDay)
        .lte('completed_at', endOfDay)
        .eq('status', 'done');

      const tasksCompleted = tasks?.length || 0;

      // 4. Money Spent (Transactions)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .eq('transaction_date', dateStr)
        .eq('type', 'expense');

      const totalSpent = transactions?.reduce((acc, tx) => acc + Number(tx.amount || 0), 0) || 0;

      // 5. Interviews Logged
      const { data: interviews } = await supabase
        .from('interview_rounds')
        .select('id')
        .eq('user_id', userId)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay);

      const interviewsScheduled = interviews?.length || 0;

      const snapshot = {
        date: dateStr,
        focus_minutes: focusMinutes,
        habits_completed: habitsCompleted,
        tasks_done: tasksCompleted,
        spent_amount: totalSpent,
        interviews_count: interviewsScheduled,
        generated_at: new Date().toISOString(),
      };

      return snapshot;
    } catch (err) {
      console.error('[JournalSnapshot] Generation error:', err);
      return {
        date: dateStr,
        focus_minutes: 0,
        habits_completed: 0,
        tasks_done: 0,
        spent_amount: 0,
        interviews_count: 0,
        generated_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Attach snapshot to a journal entry in context_snapshots table
   */
  async saveSnapshotForEntry(userId, entryId, snapshotData) {
    const { data, error } = await supabase
      .from('context_snapshots')
      .insert([{
        user_id: userId,
        entry_id: entryId,
        snapshot_data: snapshotData,
      }])
      .select()
      .single();

    return { data, error };
  },
};
