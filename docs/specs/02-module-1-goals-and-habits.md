Module 1: Goals and Habits

Module id: goals-habits. Depends on: Core Architecture (01). Other modules that feed this one: Time and Focus, Tasks, Learning, Career, Finance, Journal. Read the Core doc first. This doc follows its module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Goals and Habits is the center of the app. Every other module exists to serve a goal or a habit. This module lets you define what you want to achieve, break it into measurable milestones, and build the daily actions that move you toward it. Each action is tracked automatically from other modules when possible, so you don't log the same thing twice.

Developer: turn 'get a backend role' into milestones such as 'finish 40 DSA problems' and 'ship two projects', with habits like 'code 90 minutes before work'.

Student: goals per course or exam, with habits like 'revise 45 minutes daily'.

Future employee: goals like 'land an offer by March', with habits like 'apply to 2 roles each weekday'.

Disciplined person: long-term goals with weekly reviews and streaks that show consistency.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Goal | A outcome with a target date and a measure of success | Pass the AWS Solutions Architect exam by 30 June |
| Milestone | A checkpoint inside a goal, either a date or a numeric target | Complete 25 practice exams by 15 May |
| Habit | A repeated action with a frequency | Practice 45 minutes, 5 days a week |
| Link | A connection between a goal or habit and a data source in another module | Focus sessions tagged 'AWS' count toward the AWS goal |
| Check-in | One recorded completion of a habit for a given day | Ticked on 14 Nov |
| Review | A weekly summary written or generated for a goal set | Week 46 review: 3 of 5 habits kept |


# 3. Features (v1)

## 3.1 Goal management

Create a goal with: title, description, area (Career, Study, Work, Health, Personal, Finance, or custom), start date, target date, and status (active, paused, completed, abandoned).

Set how progress is measured: by milestones (count of completed milestones), by numeric target (current value out of target value, with a unit such as 'problems' or 'pages'), or by linked hours (sum of focus time from linked sessions).

Add, edit, reorder, and complete milestones. Each milestone has a title, optional due date, and optional numeric target.

Progress is calculated automatically from milestones, numeric targets, and linked data. Users can override progress manually, and the override is shown clearly.

Goals can have a parent goal, so a yearly goal can contain quarterly goals. Maximum depth is three levels in v1.

Pause, resume, complete, or abandon a goal. Abandoned goals keep their history and can be reviewed later.

Goal detail screen: progress chart, milestones, linked habits, linked focus time, linked learning items, linked career items, and a timeline of activity.

## 3.2 Habit tracking

Create a habit with: name, description, frequency (daily, specific weekdays, or X times per week), target duration or count (optional), linked goal (optional), reminder time (optional), and start date.

Daily check-in: one tap to mark done, with an optional number (minutes or count) and an optional note. Undo is available for the same day.

Auto-check from other modules: a focus session tagged to a linked habit's category can mark the habit done when the session meets the habit's minimum duration. The user can turn off auto-check per habit.

Streaks: current streak, longest streak, and completion rate over 7, 30, and 90 days. A missed day that is excused (see skip rule) does not break a streak.

Skip rule: each habit has a limited number of planned skips per month (default 2). A skip is recorded separately from a miss and does not reduce the streak. Skips beyond the limit count as misses.

Habit detail screen: a calendar heatmap for the last 90 days, a completion line chart, linked goal, and history of notes.

Pause a habit without deleting it. Paused habits don't appear in daily check-ins or reduce the completion rate.

## 3.3 Weekly review

Each week (the start day is set in Core settings), the app presents a review screen with four sections: goals progress change this week, habits kept versus planned, focus time per goal, and one free-text reflection field.

The review can be completed in under two minutes. Each section pre-fills from data so the user only confirms and writes one reflection.

Completed reviews are saved as records so trends can be compared week to week.

Missing a review sends one gentle reminder, not repeated nagging. The reminder time is set in Settings.

## 3.4 Progress views

Today: due habits, goals with the next milestone due today or this week.

Overview: all active goals with progress bars, sorted by target date, with warnings for goals that are off track.

Off-track detection: a goal is flagged when its progress is below the expected progress for the elapsed share of its timeline, with a threshold of 15 percent by default. The flag explains why: for example, 'Expected 60 percent by now, you are at 38 percent. Your linked habit was missed 4 times this week.'

## 3.5 Search, filters, and archive

Filter goals by area, status, and deadline. Filter habits by status and frequency.

Archive completed or abandoned goals and their habits to keep the main lists clean. Archived items are searchable and restorable.

# 4. Data model

All tables follow the Core conventions: id, created_at, updated_at, deleted_at, module_id. Every table below uses the module_id value 'goals-habits'.

| Table | Key fields | Notes |
| --- | --- | --- |
| goals | title, description, area, status, start_date, target_date, parent_goal_id, progress_mode (milestones | numeric | hours | manual), target_value, current_value, unit, manual_progress, archived_at | parent_goal_id references goals.id; manual_progress used only when progress_mode is manual |
| milestones | goal_id, title, due_date, target_value, current_value, completed_at, sort_order | completed_at null means open |
| habits | name, description, frequency_type (daily | weekdays | times_per_week), weekdays (JSON array of 0-6), times_per_week, target_amount, target_unit, goal_id, reminder_time, auto_check_category, auto_check_min_minutes, planned_skips_per_month, status (active | paused | archived), start_date | auto_check fields are optional |
| habit_checkins | habit_id, checkin_date (YYYY-MM-DD local), kind (done | skipped | missed), amount, note, source (manual | auto_focus | ai) | Unique on (habit_id, checkin_date); a second insert updates the row |
| goal_progress_snapshots | goal_id, snapshot_date, progress_percent | One row per goal per day, written by a nightly job; used for charts |
| weekly_reviews | week_start_date, goals_summary (JSON), habits_summary (JSON), focus_summary (JSON), reflection, completed_at | Unique on week_start_date |


Indexes: habit_checkins on (habit_id, checkin_date); milestones on (goal_id, sort_order); goals on (status, target_date).

# 5. Business rules

Progress percentage for milestones mode is completed milestones divided by total milestones, rounded down. A goal with no milestones shows 0 percent and a prompt to add some.

Numeric mode progress is current_value divided by target_value, capped at 100 percent. current_value can be updated manually or by linked events.

Hours mode progress is linked focus minutes divided by target minutes, from the Time and Focus module's query API.

A habit's daily status is computed from check-ins. If no check-in exists for a due date after that day ends, it is recorded as missed at the start of the next day's job, unless it was planned as a skip.

A streak counts consecutive due days with kind done. Skips do not break it. Misses and planned skips above the monthly allowance do break it.

Changing a habit's frequency does not rewrite history. Past check-ins keep their values.

Deleting a goal soft-deletes its milestones and unlinks habits, but does not delete the habits.

Completing all milestones does not auto-complete a goal. The user confirms completion, which avoids accidental closures.

Times are stored in UTC; check-in dates use the user's local calendar date at the time of check-in.

# 6. Events

This module emits and listens to the events defined in the Core doc (section 8.1) and adds the following:

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | goal.created | Payload: goal id, area, target date. Used by the AI for planning context. |
| Emits | goal.milestone.reached | Fired when a milestone is completed. Triggers dashboard update and AI daily plan refresh. |
| Emits | goal.completed | Fired when the user confirms completion. |
| Emits | habit.checked | Fired on every done check-in. |
| Emits | habit.streak.milestone | Fired at streak lengths 7, 30, 100, and 365. |
| Listens | focus.session.completed | Adds linked focus minutes to hours-mode goals. Auto-checks matching habits. |
| Listens | task.completed | Increments goals where a task is linked to a numeric milestone. |
| Listens | learning.item.progressed | Updates numeric goals linked to learning items. |
| Listens | career.application.updated | Updates goals in the Career area when an application reaches interview or offer. |
| Listens | finance.expense.added | Only for goals with a savings target: recalculates savings progress when linked to a finance goal. |


All listeners are idempotent. Each one checks whether the source event id has already been applied, using a processed_events table, before changing progress.

# 7. Query API (read-only, for other modules and the dashboard)

export const queries = {

getActiveGoals(): Promise<GoalSummary[]>

getGoalProgress(goalId: string): Promise<GoalProgress>

getDueHabitsToday(date: LocalDate): Promise<HabitDue[]>

getHabitStreak(habitId: string): Promise<StreakInfo>

getOffTrackGoals(): Promise<OffTrackGoal[]>

getWeeklyReviewData(weekStart: LocalDate): Promise<WeeklyReviewData>

};

Return types are defined in types.ts with Zod schemas. Other modules never receive raw table rows.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI turns your goals into a plan you can follow, reads your habit data to find what is actually working, and helps you set goals that are realistic. It never sets goals or changes habits on its own.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| goals.list | read | Lists goals with progress and status, filtered by area or status | No |
| goals.create | write | Proposes a new goal with milestones | Yes, shows the full proposed goal card |
| goals.addMilestone | write | Proposes a milestone for an existing goal | Yes |
| goals.updateProgress | write | Proposes a manual progress update | Yes |
| habits.list | read | Lists habits with current streaks and completion rates | No |
| habits.create | write | Proposes a new habit linked to a goal | Yes |
| habits.checkin | write | Proposes a check-in for a habit on a date | Yes, unless the user has enabled quick confirm for this habit |
| habits.analyze | read | Returns completion by weekday and time, and correlations with focus sessions | No |
| review.draft | read | Drafts a weekly review reflection from the week's data | Shown to user to edit before saving |


## 8.3 AI features

Goal planning assistant: the user describes a goal in plain language, for example 'I want to get a data analyst job in 6 months and I can study 1 hour on weekdays and 3 hours on weekends'. The AI proposes a goal with dated milestones, two or three habits, and a weekly time budget. The user edits and approves each item.

Plan check: the AI compares the proposed time budget with the user's real focus data from the last four weeks and warns if the plan is unrealistic, for example 'Your average study time is 4.5 hours a week, but this plan needs 10.'

Habit insight: once there are at least three weeks of data, the AI reports the patterns it finds, such as 'You complete this habit 85 percent of the time on weekdays and 40 percent on Fridays.' It suggests one concrete change, such as moving the habit earlier in the day.

Weekly review draft: at the end of the week, the AI writes a short reflection draft covering wins, misses, and one suggestion. The user always edits it before saving.

Off-track recovery: when a goal is flagged, the AI proposes a smaller recovery plan, for example reducing remaining milestones or adjusting the target date. Nothing changes until the user approves.

Context for other AI features: the daily plan (from the Core Today dashboard) reads active goals and due habits through this module's queries.

## 8.4 What the AI is given

Goal titles, areas, target dates, progress, and milestone titles with due dates.

Habit names, frequencies, streaks, and check-in history for the last 90 days.

Linked focus totals per goal for the last 4 weeks (totals only, no session notes).

It is not given habit notes or review reflections unless the user asks the AI to draw on them in that request.

# 9. How this module helps you most

These are the concrete ways the module pays off day to day. The value depends on the habits you log and the links you set, so connect habits to goals from the start.

Consistency visibility: the heatmap and streak numbers show your real pattern, which is hard to see from memory. Most people find they are more consistent on some days than they assumed, and the data shows which days to protect.

Goal decomposition: big goals such as 'land a job' become weekly actions. This prevents the common failure of having a goal with no daily step.

Early warning: off-track detection flags a goal in week three, not in month five, when recovery is still cheap.

Honest weekly review: pre-filled data means the review takes two minutes, so it actually gets done, and the trend across weeks shows whether your plan is working.

Planning against reality: the plan check uses your real focus data, so you learn that a plan is unrealistic before you start it, not after you have failed it.

Fewer duplicate entries: linked focus sessions and tasks update goals automatically, so you log an action once.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Goals list | Filter chips (area, status), goal cards with progress bars and next milestone, FAB to add goal |
| Goal create/edit | Form fields from section 3.1, progress mode selector, parent goal picker, AI planning button |
| Goal detail | Header with progress, milestones list with check, linked habits and focus, chart, activity timeline |
| Habits list | Grouped by status (due today, upcoming, paused), streak badges, quick check-in buttons |
| Habit create/edit | Form fields from section 3.2, frequency picker, linked goal, auto-check settings |
| Habit detail | 90-day heatmap, completion chart, streak stats, check-in history with notes |
| Weekly review | Four sections, pre-filled, reflection input, AI draft button, save |
| Overview | All active goals sorted by target date, off-track warnings with reasons |
| Archive | Archived goals and habits with restore action |


# 11. Build components, in order

schema.ts: goals, milestones, habits, habit_checkins, goal_progress_snapshots, weekly_reviews, processed_events.

types.ts: Zod schemas for every entity and input, and the query return types.

repository.ts: extends the base repository, adds queries for due habits, streak calculation inputs, and goal progress inputs.

service.ts: pure functions for progress calculation, streak calculation, skip handling, off-track detection, and due-habit computation. Write these first and unit test them heavily.

Event handlers: one file per listened event, each idempotent, using processed_events.

Nightly job: writes goal_progress_snapshots and marks unchecked due habits as missed.

screens: Goals list, Goal create/edit, Goal detail, Habits list, Habit create/edit, Habit detail, Weekly review, Overview, Archive.

Dashboard widgets: Habits due today, Top goals, Off-track warning.

ai-tools.ts: the tools in section 8.2 with Zod input schemas and handlers.

index.ts: the module manifest, following the Core contract.

# 12. Testing requirements

Unit tests for progress calculation in all four modes, including zero milestones, zero target, and progress above 100 percent.

Unit tests for streaks: consecutive days, a planned skip, a skip above the monthly limit, a miss, a paused habit, and a frequency change.

Unit tests for off-track detection at boundaries: exactly 15 percent behind, 14 percent behind, and a goal with no target date.

Unit tests for every event handler, including replaying the same event twice to confirm no double counting.

Timezone tests: a check-in at 23:50 local time and a device that changes timezone.

Repository tests: soft delete hides rows, the habit check-in unique constraint updates instead of duplicating.

# 13. Definition of done (v1)

A user can create goals with milestones, progress modes, and parent goals, and see accurate progress.

A user can create habits, check them in daily, and see correct streaks with planned skips.

Focus sessions tagged to a linked habit or goal update the goal and habit automatically.

The weekly review is pre-filled, saveable, and reminded once when missed.

Off-track goals are flagged with a clear reason.

The AI goal planning, habit insight, and review draft features work, and every write requires approval.

The AI is fully optional: with AI off, all manual features work.

All unit tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
