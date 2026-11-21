import { supabase } from '../config/supabase.js';

export const EventBusService = {
  /**
   * Publish an event into event_log and execute all registered reactive handlers
   */
  async publish(userId, moduleId, eventType, payload = {}) {
    try {
      // 1. Insert into event_log table
      const { data: eventRecord, error } = await supabase
        .from('event_log')
        .insert([{
          user_id: userId,
          module_id: moduleId,
          event_type: eventType,
          payload,
        }])
        .select()
        .single();

      if (error) {
        console.error(`[EventBus] Failed to log event ${eventType}:`, error.message);
        return null;
      }

      console.log(`[EventBus] Published: ${eventType} (#${eventRecord.id}) for user ${userId}`);

      // 2. Execute handlers asynchronously (do not block the caller)
      this.handleEvent(eventRecord).catch(err => {
        console.error(`[EventBus] Handler execution failed for ${eventType}:`, err);
      });

      return eventRecord;
    } catch (err) {
      console.error('[EventBus] Publish error:', err);
      return null;
    }
  },

  /**
   * Internal reactive handler dispatcher
   */
  async handleEvent(eventRecord) {
    const { id: eventId, user_id: userId, event_type: eventType, payload } = eventRecord;

    switch (eventType) {
      // Focus session completed -> auto check linked habits and roll up to goals
      case 'focus.session.completed': {
        const { duration_seconds, category, goal_id } = payload;
        const minutes = Math.floor((duration_seconds || 0) / 60);

        // Check if any habit matches category and min minutes
        if (category && minutes > 0) {
          const { data: matchingHabits } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .eq('auto_check_category', category)
            .lte('auto_check_min_minutes', minutes);

          if (matchingHabits && matchingHabits.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            for (const h of matchingHabits) {
              await supabase
                .from('habit_checkins')
                .upsert([{
                  user_id: userId,
                  habit_id: h.id,
                  checkin_date: today,
                  kind: 'done',
                  amount: 1,
                  source: 'auto_focus',
                }], { onConflict: 'habit_id,checkin_date' });

              await this.recalculateStreak(userId, h.id);
            }
          }
        }

        // If goal linked, add hours to goal current_value
        if (goal_id && minutes > 0) {
          const hours = Number((minutes / 60).toFixed(2));
          const { data: goal } = await supabase.from('goals').select('current_value, progress_mode').eq('id', goal_id).single();
          if (goal && goal.progress_mode === 'hours') {
            await supabase
              .from('goals')
              .update({
                current_value: Number(goal.current_value || 0) + hours,
                updated_at: new Date().toISOString()
              })
              .eq('id', goal_id);
          }
        }
        break;
      }

      // Task completed -> update linked goal milestone and recalculate goal progress
      case 'task.completed': {
        const { goal_id, milestone_id } = payload;
        if (milestone_id) {
          await supabase
            .from('milestones')
            .update({
              completed_at: new Date().toISOString(),
              current_value: 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', milestone_id);
        }

        if (goal_id) {
          await this.recalculateGoalProgress(userId, goal_id);
        }
        break;
      }

      // Learning item completed -> update skill level if linked
      case 'learning.item.completed': {
        const { skill_id } = payload;
        if (skill_id) {
          const { data: skill } = await supabase.from('skills').select('current_level, target_level').eq('id', skill_id).single();
          if (skill && skill.current_level < (skill.target_level || 5)) {
            await supabase
              .from('skills')
              .update({
                current_level: skill.current_level + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', skill_id);
          }
        }
        break;
      }

      // Habit checked -> recalculate streak
      case 'habit.checked': {
        const { habit_id } = payload;
        if (habit_id) {
          await this.recalculateStreak(userId, habit_id);
        }
        break;
      }

      default:
        break;
    }

    // Mark processed
    await supabase.from('processed_events').insert([{
      event_id: eventId,
      handler_id: 'core_orchestrator',
      user_id: userId,
    }]);
  },

  /**
   * Recalculate streak for a habit based on consecutive checkin dates
   */
  async recalculateStreak(userId, habitId) {
    const { data: checkins } = await supabase
      .from('habit_checkins')
      .select('checkin_date, kind')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('checkin_date', { ascending: false });

    if (!checkins || checkins.length === 0) {
      await supabase.from('habits').update({ current_streak: 0 }).eq('id', habitId);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build a map of dates done or skipped
    const dateMap = new Set();
    checkins.forEach(c => {
      if (c.kind === 'done' || c.kind === 'skipped') {
        dateMap.add(c.checkin_date);
      }
    });

    let checkDate = new Date(today);
    const todayStr = checkDate.toISOString().split('T')[0];

    // If today not logged yet, start checking from yesterday so streak doesn't break prematurely
    if (!dateMap.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateMap.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const { data: habit } = await supabase.from('habits').select('best_streak').eq('id', habitId).single();
    const bestStreak = Math.max(habit?.best_streak || 0, currentStreak);

    await supabase
      .from('habits')
      .update({
        current_streak: currentStreak,
        best_streak: bestStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId);
  },

  /**
   * Recalculate goal progress percentage
   */
  async recalculateGoalProgress(userId, goalId) {
    const { data: goal } = await supabase.from('goals').select('*').eq('id', goalId).single();
    if (!goal) return;

    if (goal.progress_mode === 'milestones') {
      const { data: milestones } = await supabase.from('milestones').select('completed_at').eq('goal_id', goalId);
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter(m => m.completed_at !== null).length;
        const pct = Math.round((completed / milestones.length) * 100);
        await supabase.from('goals').update({ current_value: completed, manual_progress: pct, updated_at: new Date().toISOString() }).eq('id', goalId);
      }
    }
  },
};
