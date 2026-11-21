-- ====================================================================
-- LIFE OS COMPREHENSIVE POSTGRESQL SCHEMA FOR SUPABASE
-- Modules: Core, Goals/Habits, Time/Focus, Tasks/Planner,
--          Learning, Career, Finance, Journal/Mood
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 0. CORE PLATFORM & EVENT BUS TABLES
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.event_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.processed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_log(id) ON DELETE CASCADE,
    handler_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, handler_id)
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    default_currency VARCHAR(10) DEFAULT 'INR',
    week_start_day VARCHAR(10) DEFAULT 'monday',
    daily_checkin_time VARCHAR(10) DEFAULT '21:00',
    ai_features_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 1. MODULE 01: GOALS & HABITS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area VARCHAR(50) DEFAULT 'personal', -- career, health, finance, learning, personal
    status VARCHAR(30) DEFAULT 'active', -- active, completed, paused, archived
    start_date DATE,
    target_date DATE,
    parent_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    progress_mode VARCHAR(30) DEFAULT 'milestones', -- milestones, numeric, hours, manual
    target_value DECIMAL(15, 2) DEFAULT 100,
    current_value DECIMAL(15, 2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT '%',
    manual_progress DECIMAL(5, 2) DEFAULT 0,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    target_value DECIMAL(15, 2) DEFAULT 1,
    current_value DECIMAL(15, 2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency_type VARCHAR(30) DEFAULT 'daily', -- daily, weekdays, times_per_week
    weekdays JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    times_per_week INT DEFAULT 7,
    target_amount DECIMAL(10, 2) DEFAULT 1,
    target_unit VARCHAR(50) DEFAULT 'times',
    reminder_time VARCHAR(10),
    auto_check_category VARCHAR(100),
    auto_check_min_minutes INT,
    status VARCHAR(30) DEFAULT 'active', -- active, paused, archived
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.habit_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    kind VARCHAR(20) DEFAULT 'done', -- done, skipped, missed
    amount DECIMAL(10, 2) DEFAULT 1,
    note TEXT,
    source VARCHAR(30) DEFAULT 'manual', -- manual, auto_focus, ai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(habit_id, checkin_date)
);

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    goals_summary JSONB DEFAULT '{}'::jsonb,
    habits_summary JSONB DEFAULT '{}'::jsonb,
    focus_summary JSONB DEFAULT '{}'::jsonb,
    reflection TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, week_start_date)
);

-- ====================================================================
-- 2. MODULE 02: TIME & FOCUS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.focus_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#23F07D',
    category VARCHAR(50) DEFAULT 'work',
    default_flag BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.focus_projects(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'deep_work',
    start_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    end_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'completed', -- active, paused, completed, discarded
    duration_seconds INT DEFAULT 0,
    intention TEXT,
    note TEXT,
    is_break BOOLEAN DEFAULT false,
    is_deep_work BOOLEAN DEFAULT true,
    interruption_count INT DEFAULT 0,
    source VARCHAR(30) DEFAULT 'timer', -- timer, manual, split, ai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.focus_distractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.focus_sessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 3. MODULE 03: TASKS & PLANNER
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.task_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#23F07D',
    is_inbox BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.task_lists(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'open', -- open, in_progress, done, archived
    priority INT DEFAULT 2, -- 1 (Urgent), 2 (High), 3 (Medium), 4 (Low)
    quadrant VARCHAR(10) DEFAULT 'Q2', -- Q1: Do First, Q2: Schedule, Q3: Delegate, Q4: Eliminate
    due_date DATE,
    scheduled_date DATE,
    scheduled_position INT DEFAULT 0,
    estimate_minutes INT DEFAULT 30,
    actual_minutes INT DEFAULT 0,
    recurrence_rule JSONB, -- { frequency: 'daily', interval: 1, ... }
    completed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(30) DEFAULT 'manual', -- manual, ai, career, learning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    done BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_budget_minutes INT DEFAULT 480, -- 8 hours default ceiling
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- ====================================================================
-- 4. MODULE 04: LEARNING
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'technical',
    current_level INT DEFAULT 1, -- 0 (Novice) to 5 (Expert)
    target_level INT DEFAULT 5,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.learning_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'course', -- course, book, paper, project, certification
    url TEXT,
    provider VARCHAR(100),
    total_units INT DEFAULT 10,
    completed_units INT DEFAULT 0,
    unit_label VARCHAR(30) DEFAULT 'chapters',
    status VARCHAR(30) DEFAULT 'in_progress', -- to_start, in_progress, completed, abandoned
    rating INT, -- 1 to 5
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_item_id UUID REFERENCES public.learning_items(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    box_level INT DEFAULT 1, -- Leitner boxes 1 to 5
    next_review_date DATE DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 5. MODULE 05: CAREER PIPELINE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    company VARCHAR(150) NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    source VARCHAR(50) DEFAULT 'job_board', -- referral, linkedin, recruiter, company_site
    location VARCHAR(100),
    work_mode VARCHAR(30) DEFAULT 'remote', -- remote, hybrid, onsite
    salary_min INT,
    salary_max INT,
    currency VARCHAR(10) DEFAULT 'INR',
    current_stage VARCHAR(50) DEFAULT 'applied', -- wish, applied, screening, technical, interview, offer, rejected, withdrawn
    fit_score INT DEFAULT 4, -- 1 to 5
    deadline DATE,
    job_link TEXT,
    notes TEXT,
    closed_at TIMESTAMP WITH TIME ZONE,
    outcome_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.interview_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    round_type VARCHAR(50) DEFAULT 'technical', -- screening, technical, system_design, behavioral, managerial, hr
    scheduled_at TIMESTAMP WITH TIME ZONE,
    format VARCHAR(30) DEFAULT 'video', -- phone, video, onsite, assessment
    location_or_link TEXT,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(30) DEFAULT 'scheduled', -- scheduled, completed, cancelled
    debrief_notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.career_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    role VARCHAR(150),
    relationship_type VARCHAR(50) DEFAULT 'recruiter', -- recruiter, hiring_manager, referrer, peer, mentor
    email VARCHAR(150),
    phone VARCHAR(50),
    linkedin_url TEXT,
    last_contact_at DATE,
    keep_in_touch_days INT DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.career_contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.job_opportunities(id) ON DELETE SET NULL,
    type VARCHAR(30) DEFAULT 'email', -- email, message, call, coffee, interview
    occurred_at DATE DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    next_follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.star_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    situation TEXT NOT NULL,
    task TEXT NOT NULL,
    action TEXT NOT NULL,
    result TEXT NOT NULL,
    competency_tags JSONB DEFAULT '["leadership", "problem_solving"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.career_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
    base_amount BIGINT NOT NULL, -- minor currency units (paise/cents)
    bonus_amount BIGINT DEFAULT 0,
    equity_notes TEXT,
    currency VARCHAR(10) DEFAULT 'INR',
    start_date DATE,
    response_deadline DATE,
    decision VARCHAR(30) DEFAULT 'pending', -- pending, accepted, declined
    decision_reason TEXT,
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 6. MODULE 06: FINANCE ENHANCEMENTS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    period_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    limit_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    rollover BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category_id, period_month)
);

CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    target_date DATE,
    status VARCHAR(30) DEFAULT 'active', -- active, achieved, paused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 7. MODULE 07: JOURNAL & MOOD
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    title VARCHAR(255),
    body TEXT,
    status VARCHAR(30) DEFAULT 'checked_in', -- checked_in, written, skipped
    checkin_source VARCHAR(30) DEFAULT 'evening', -- morning, evening, manual
    is_locked BOOLEAN DEFAULT false,
    word_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, entry_date)
);

CREATE TABLE IF NOT EXISTS public.mood_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    mood_score INT NOT NULL, -- 1 to 5 (1=Terrible, 5=Great)
    energy_score INT NOT NULL, -- 1 to 5 (1=Exhausted, 5=Energized)
    sleep_quality INT, -- 1 to 5
    sleep_hours DECIMAL(4, 1),
    label VARCHAR(50), -- 'calm', 'focused', 'stressed', 'optimistic'
    tags JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.context_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb
    -- snapshot_data stores: { focus_minutes: 180, habits_completed: 4, tasks_done: 6, spent_inr: 2400 }
);

CREATE TABLE IF NOT EXISTS public.pattern_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL, -- sleep_vs_focus, spending_vs_mood, habits_vs_energy
    statement TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence DECIMAL(4, 2) DEFAULT 0.85,
    status VARCHAR(30) DEFAULT 'new', -- new, confirmed, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) FOR ALL LIFE OS TABLES
-- ====================================================================

ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_distractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_findings ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Generator: Ensures every user only views & modifies their own rows
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'event_log', 'processed_events', 'user_settings',
        'goals', 'milestones', 'habits', 'habit_checkins', 'weekly_reviews',
        'focus_projects', 'focus_sessions', 'focus_distractions',
        'task_lists', 'tasks', 'subtasks', 'daily_plans',
        'skills', 'learning_items', 'flashcard_decks', 'flashcards',
        'job_opportunities', 'interview_rounds', 'career_contacts', 'touchpoints', 'star_stories', 'career_offers',
        'budgets', 'savings_goals',
        'journal_entries', 'mood_records', 'context_snapshots', 'pattern_findings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can manage own %I" ON public.%I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END $$;
