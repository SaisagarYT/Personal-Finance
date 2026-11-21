import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { EventBusService } from '../services/eventBusService.js';
import { JournalSnapshotService } from '../services/journalSnapshotService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/journal/today - Check-in status & live cross-module snapshot
 */
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [entryRes, snapshotData] = await Promise.all([
      supabase
        .from('journal_entries')
        .select(`
          *,
          mood_records (*),
          context_snapshots (*)
        `)
        .eq('user_id', req.user.id)
        .eq('entry_date', today)
        .maybeSingle(),
      JournalSnapshotService.generateDailySnapshot(req.user.id, today),
    ]);

    const entry = entryRes.data;
    const isCheckedIn = Boolean(entry && entry.mood_records && entry.mood_records.length > 0);

    res.json({
      date: today,
      is_checked_in: isCheckedIn,
      entry: entry || null,
      live_snapshot: snapshotData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/journal/checkin - 1-minute daily check-in
 */
router.post('/checkin', async (req, res) => {
  try {
    const { mood_score, energy_score, sleep_quality = 4, sleep_hours = 7.5, label, tags = [] } = req.body;
    if (!mood_score || !energy_score) {
      return res.status(400).json({ error: 'Mood score (1-5) and Energy score (1-5) are required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Upsert today's journal entry
    const { data: entry, error: entryErr } = await supabase
      .from('journal_entries')
      .upsert([{
        user_id: req.user.id,
        entry_date: today,
        status: 'checked_in',
        checkin_source: 'evening',
      }], { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (entryErr) throw entryErr;

    // 2. Insert mood record
    const { data: moodRecord, error: moodErr } = await supabase
      .from('mood_records')
      .insert([{
        user_id: req.user.id,
        entry_id: entry.id,
        mood_score: parseInt(mood_score),
        energy_score: parseInt(energy_score),
        sleep_quality: parseInt(sleep_quality),
        sleep_hours: parseFloat(sleep_hours),
        label: label || null,
        tags: tags || [],
      }])
      .select()
      .single();

    if (moodErr) throw moodErr;

    // 3. Generate and attach immutable cross-module snapshot
    const snapshotData = await JournalSnapshotService.generateDailySnapshot(req.user.id, today);
    await JournalSnapshotService.saveSnapshotForEntry(req.user.id, entry.id, snapshotData);

    // 4. Emit event for AI pattern engine and dashboard
    await EventBusService.publish(req.user.id, 'journal', 'journal.checkin.completed', {
      entry_id: entry.id,
      date: today,
      mood: mood_score,
      energy: energy_score,
    });

    res.status(201).json({
      entry,
      mood: moodRecord,
      snapshot: snapshotData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/journal/entry - Save or edit full journal entry
 */
router.post('/entry', async (req, res) => {
  try {
    const { title, body, is_locked = false, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const wordCount = body ? body.trim().split(/\s+/).length : 0;

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .upsert([{
        user_id: req.user.id,
        entry_date: targetDate,
        title: title || null,
        body: body || null,
        status: 'written',
        is_locked: Boolean(is_locked),
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      }], { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (error) throw error;

    await EventBusService.publish(req.user.id, 'journal', 'journal.entry.saved', {
      entry_id: entry.id,
      date: targetDate,
      word_count: wordCount,
      is_locked: entry.is_locked,
    });

    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/journal/timeline - List past entries with mood records
 */
router.get('/timeline', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        mood_records (*),
        context_snapshots (*)
      `)
      .eq('user_id', req.user.id)
      .order('entry_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;
    res.json({ entries: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
