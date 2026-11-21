Module 2: Time and Focus

Module id: time-focus. Depends on: Core Architecture (01), Goals and Habits (02). Other modules that use this one: Tasks, Learning, Career, Dashboard. This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Time and Focus records where your hours actually go. You start a timer for a piece of work, study, or practice, stop it when you're done, and the module turns those sessions into a clear picture: how much real focused time you spend, on what, and whether it matches your goals. It is the source of truth for time-based goals and habits, and it is the most useful data for a developer or student.

Developer: sessions per project, per repository, or per skill. Deep work versus shallow work. Focus streaks and best hours of the day.

Student: study hours per course and per exam, with pomodoro cycles and breaks logged.

Future employee: time spent on interview prep, portfolio projects, and certifications, compared with time spent on applications.

Disciplined person: honest measurement, so planning is based on real hours, not guesses.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Session | One continuous or paused period of focused work | Coding for 52 minutes on the auth service |
| Category | A high-level type of work, used for summaries | Work, Study, Practice, Project, Admin |
| Project | A named body of work the user is actively doing | Expense tracker app, AWS course, Job search |
| Tag | A free label for filtering and AI analysis | refactor, dsa, interview |
| Pomodoro cycle | Optional timed work blocks with breaks | 25 minutes work, 5 minutes break, every 4 cycles a longer break |
| Deep work | A session at or above a set length with no interruptions recorded | Any session of 50 minutes or more with 0 interruptions |
| Interruption | A recorded pause reason during a session | Slack message, meeting, phone, other |


# 3. Features (v1)

## 3.1 Timer and session control

Start a session by choosing a project and category, optionally adding tags and a short intention, for example 'Fix login redirect bug'.

The timer runs in the foreground with a large display, and continues correctly when the app is backgrounded or the phone locks. The elapsed time is always computed from stored start time, never from a counter that can drift.

Pause and resume. Each pause records a reason from a quick list (break, interruption, or other) and the reason is optional.

Stop ends the session and opens a short summary card: duration, pauses, and a one-line note. The note is optional and can be skipped.

Only one active session can exist at a time. Starting a new one while one is running asks whether to stop the current session first.

Discard: a session can be cancelled before stopping, which removes it. A confirmation is required if the session is over 5 minutes long.

Crash recovery: if the app closes during a session, on next launch the user sees 'You have an unfinished session from 14:20. Stop it at the last known time, or continue it?'

## 3.2 Pomodoro mode

Optional mode on the timer: work length (default 25 minutes), short break (default 5 minutes), long break (default 15 minutes) after a set number of cycles (default 4).

Each work block is recorded as its own session, linked to a shared pomodoro run id, so the user sees both single blocks and the full run.

Breaks are recorded as break sessions and excluded from focus totals but included in a total 'time on task' figure.

Notifications at the end of each block and break, with a silent option.

## 3.3 Manual entry and editing

Add a session after the fact with start time, end time or duration, project, category, tags, and note. The app warns if it overlaps another session.

Edit any session: change project, category, tags, notes, or times. Every edit is recorded in an audit field so the history is honest.

Delete a session with a soft delete, recoverable from a Recently Deleted list for 30 days.

Split a session into two at a chosen time, useful when a session covered two projects.

## 3.4 Projects, categories, and tags

Create, rename, archive, and colour projects. Each project belongs to one category by default and can be linked to one or more goals in the Goals and Habits module.

Categories are a fixed set in v1 (Work, Study, Practice, Project, Admin, Break) plus user-defined ones added later.

Tags are free text, suggested from previously used tags, and autocompleted.

Default project is set in Settings, so one tap can start the most common work.

## 3.5 Summaries and analytics

Today: total focus time, sessions, longest session, and a simple timeline showing gaps between sessions.

Week and month: focus time per day as a bar chart, per project and per category as breakdowns, and comparison with the previous period.

Deep work ratio: percentage of focus time spent in sessions at or above the deep work length, with the target set in Settings.

Best hours: a heatmap of focus time by weekday and hour, computed after at least two weeks of data, showing when you are most productive.

Focus score per day: a simple, transparent measure combining total focus time, deep work ratio, and interruptions. The formula is shown to the user in full and can be adjusted in Settings. It is never a black box.

Estimate accuracy: for tasks that have estimates (from the Tasks module), compares estimated and actual time over the last 30 days.

## 3.6 Goal and habit links

A project can be linked to one or more goals. Every session in that project counts toward those goals in hours mode.

A session can be tagged to a habit, and if the duration meets the habit's minimum, the habit is auto-checked, as described in the Goals and Habits doc.

Goal detail screens show focus time per goal for the last 1, 4, and 12 weeks.

## 3.7 Targets and reminders

Daily focus target (for example 4 hours), with a progress ring on the Today screen and an end-of-day summary if the target was missed.

Weekly focus target, shown on the weekly review.

Optional reminder to start a session at a chosen time on chosen weekdays, with no nagging beyond one reminder per time.

Break reminders during long sessions, controlled by a setting.

## 3.8 Export

Export sessions as CSV for a date range, including project, category, tags, start, end, duration, and notes. Useful for invoices, reports, or a university log.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'time-focus'. Durations are stored in seconds as integers. Times are stored as UTC ISO 8601 strings.

| Table | Key fields | Notes |
| --- | --- | --- |
| projects | name, color, category, default_flag, archived_at, sort_order | Only one row can have default_flag true |
| sessions | project_id, category, start_at, end_at, status (active | paused | completed | discarded), duration_seconds, note, intention, pomodoro_run_id, is_break, is_deep_work, edited_at, source (timer | manual | split | ai) | Only one row can have status active at a time; enforced in service layer and by a partial unique index |
| session_pauses | session_id, pause_at, resume_at, reason (break | interruption | other | none) | Pause time is subtracted from duration |
| session_tags | session_id, tag | Many-to-many with tags as text |
| session_goal_links | session_id, goal_id | Created when a session's project links to a goal, or manually |
| project_goal_links | project_id, goal_id | Defines which goals a project feeds |
| session_edits | session_id, field, old_value, new_value, edited_at | Audit trail of edits to a session |
| daily_summaries | date, total_seconds, deep_work_seconds, session_count, interruption_count, focus_score | Computed nightly and on change; cached for speed |
| time_settings | key, value | Focus target, deep work length, pomodoro defaults, focus score weights |


Indexes: sessions on (start_at), sessions on (project_id, start_at), session_tags on (tag), daily_summaries on (date). A partial unique index on sessions(status) where status = 'active' guarantees one active session.

# 5. Business rules

Duration of a completed session = (end_at minus start_at) minus the sum of all pause durations. Paused time is never counted as focus.

A session cannot have end_at earlier than start_at, or a duration over 24 hours. Longer sessions are rejected with a message asking the user to split them.

Manual sessions cannot overlap existing completed sessions. If they do, the user must adjust times or explicitly choose to save anyway, which marks the session overlap_allowed.

Break sessions are excluded from focus totals, deep work ratio, and focus score. They are included in time-on-task totals.

Deep work: a session with duration at or above time_settings.deep_work_minutes (default 50) and no interruption pauses. A session with interruption pauses still counts as focus but is not deep work.

Focus score: weighted sum of normalized focus time (against the daily target), deep work ratio, and an interruption penalty. Weights and formula are stored in time_settings and displayed to the user.

Changing a session's project or category recalculates daily summaries and goal links for that session only. Past goal progress that was already reached is not reversed; a note is recorded in the audit trail.

A session's category is inherited from its project at creation and can be overridden per session.

Deleting a project does not delete its sessions. Sessions move to an 'Unassigned' project.

Times are stored in UTC. Daily summaries use the user's local calendar day, and a session that crosses midnight is split across the two days in summaries.

Changes in device timezone do not alter stored times. Summaries recompute using the timezone that was active for each session.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | focus.session.started | Payload: session id, project id, category, start time. Used by the AI context and dashboard. |
| Emits | focus.session.paused | Payload: session id, reason. |
| Emits | focus.session.completed | Payload: session id, project id, category, duration, is_deep_work, tags, goal links. Main event consumed by Goals and Habits. |
| Emits | focus.session.discarded | Payload: session id. Lets listeners reverse any early effects. |
| Emits | focus.target.reached | Fired once per day when the daily focus target is reached. |
| Emits | focus.session.edited | Payload: session id, changed fields. Lets goal progress recalculate. |
| Listens | task.started | Offers to start a focus session on that task's project. Never auto-starts a timer. |
| Listens | task.completed | Used for estimate accuracy when the task has an estimate and linked sessions. |


Rules: focus.session.completed is emitted exactly once per session, guarded by status transition. Listeners are idempotent using the processed_events table defined in the Goals and Habits doc.

# 7. Query API (read-only)

export const queries = {

getActiveSession(): Promise<ActiveSession | null>

getFocusTotals(range: DateRange, filter?: { projectId?, category?, goalId? }): Promise<FocusTotals>

getFocusMinutesForGoal(goalId: string, range: DateRange): Promise<number>

getDailySummary(date: LocalDate): Promise<DailySummary>

getTodayFocus(): Promise<TodayFocus>

getBestHours(range: DateRange): Promise<HourHeatmap>

getEstimateAccuracy(range: DateRange): Promise<AccuracyStats>

};

Other modules use these functions only. They never read the sessions table directly.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI helps you log time without friction and turns the raw hours into useful decisions. It explains patterns, flags time that doesn't match your plans, and suggests when to do deep work. It never starts or stops your timer without you pressing the button.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| focus.getSummary | read | Returns totals for a period, by project and category | No |
| focus.getActive | read | Returns the active session, if any | No |
| focus.start | write | Proposes starting a session with project, category, and intention | Yes, one tap confirm |
| focus.stop | write | Proposes stopping the active session and saving the note | Yes, one tap confirm |
| focus.addManual | write | Proposes a manual session from a natural language description | Yes, shows parsed times and project for editing |
| focus.analyzeBestHours | read | Returns the best-hours heatmap and interpretation | No |
| focus.compareToPlan | read | Compares logged time with plan time from Goals and Tasks | No |


## 8.3 AI features

Natural language logging: 'I did 90 minutes on the login bug for the expense app and 30 minutes of DSA this morning.' The AI proposes two sessions with times, project, and category. You confirm or edit each one.

Start and stop by voice or text: 'Start a study session for AWS' creates a proposed session for the matching project. The timer starts after you confirm.

Plan versus reality: the AI compares your weekly plan (for example '10 hours of study') with actual logged time, names the gap, and suggests a realistic adjusted plan.

Best hours insight: after two weeks of data, the AI explains your peak focus hours in plain language and suggests where to place your hardest task.

Interruption pattern: the AI identifies what most often interrupts you, for example 'Most of your interruptions happen between 11:00 and 12:00, which is also when your deep work sessions break.'

Burnout signal: when daily focus rises sharply for many days in a row with no breaks logged, the AI raises a gentle note suggesting a lighter day. It does not diagnose or judge.

Weekly summary: a short narrative of the week's focus, with one concrete recommendation. Shown in the weekly review.

## 8.4 What the AI is given

Session start and end times, project names, categories, durations, and pause reasons for the period being asked about.

Session notes only when the user asks a question that needs them, for example 'what did I work on for the job search'.

Active goals linked to projects, and planned hours if the user has set them.

Never the full sessions table in one request. Requests are aggregated where possible.

# 9. How this module helps you most

Real numbers, not guesses: most people overestimate their focus time. Logged sessions show the true figure, which makes every plan more accurate.

Deep work tracking: the deep work ratio makes it obvious when your day is full of short, fragmented sessions, so you can protect longer blocks.

Best hours: once you know your peak hours, you schedule the hardest study or coding work there instead of relying on willpower.

Plan against reality: comparing plan time with logged time catches an unrealistic study or job-search plan within two weeks, before you lose motivation.

Automatic progress: sessions tagged to a project move your goals and habits forward without a second entry. This is what keeps the system from becoming a chore.

Honest history: edits are audited, so the record is trustworthy when you use it for reports, invoices, or an interview conversation about what you built.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Timer (home of this module) | Project and category selector, large timer, pause and stop buttons, intention field, pomodoro toggle |
| Session summary | Duration, pauses, note field, save or discard, goal links shown |
| Today | Focus total, target ring, sessions list, timeline with gaps, active session banner |
| Week and month | Bar chart, breakdowns by project and category, comparison with previous period, deep work ratio |
| Best hours | Weekday by hour heatmap, plain-language AI note |
| Session list and edit | Filterable list, edit form with audit history, split and delete actions, overlap warnings |
| Projects | List with colours and categories, create, rename, archive, set default, linked goals |
| Settings | Focus target, deep work length, pomodoro defaults, focus score weights, reminders, export |
| Recently deleted | Soft-deleted sessions with restore option for 30 days |


# 11. Build components, in order

schema.ts: projects, sessions, session_pauses, session_tags, session_goal_links, project_goal_links, session_edits, daily_summaries, time_settings.

types.ts: Zod schemas for session input, pause input, project input, and query results.

service.ts: pure functions for duration calculation with pauses, overlap detection, deep work classification, focus score, midnight splitting, and daily summary building. Build and test these first.

repository.ts: sessions, pauses, tags, links, and summaries with the active-session constraint.

Timer engine: computes elapsed time from stored start time, handles background and lock, and restores an unfinished session on launch.

Event emitters and the goal-link listener that writes session_goal_links.

Nightly and on-change job for daily_summaries.

screens: Timer, Session summary, Today, Week and month, Best hours, Session list and edit, Projects, Settings, Recently deleted.

Dashboard widgets: Today focus with target ring, active session banner, weekly focus bar.

ai-tools.ts: the tools in section 8.2 with Zod schemas and confirmation-aware handlers.

index.ts: the module manifest.

# 12. Testing requirements

Unit tests for duration with zero, one, and many pauses, and for a pause that is never resumed (treated as the session end at stop time).

Unit tests for the active-session constraint: starting a second session asks for confirmation and never creates two active rows.

Crash recovery test: an active session survives app kill and resumes with the correct elapsed time.

Background test: elapsed time after a 30-minute lock is correct, not based on a counter.

Midnight split test: a session from 23:30 to 00:45 appears in two daily summaries with correct durations.

Overlap test: manual sessions that overlap are blocked, and the explicit save-anyway path works.

Deep work classification at 49, 50, and 51 minutes, and with and without interruption pauses.

Focus score test with default weights, changed weights, and zero focus time (must not divide by zero).

Timezone test: a session logged in one timezone is summarized correctly after the device changes timezone.

Event tests: focus.session.completed is emitted exactly once per session, even when stop is pressed twice quickly.

# 13. Definition of done (v1)

A user can start, pause, resume, stop, and discard sessions reliably, including after backgrounding, locking, or a crash.

Pomodoro mode works, with breaks excluded from focus totals.

Manual entry, editing with audit, splitting, and soft delete with recovery all work, with overlap protection.

Today, week, and month summaries show accurate totals, breakdowns, and deep work ratio.

Sessions linked to projects update linked goals and habits automatically through events.

The focus score formula is visible and adjustable.

Natural language logging, start and stop, and weekly summary work through the AI, with confirmation on every write.

With AI off, every manual feature works unchanged.

All tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
