Module 3: Tasks and Planner

Module id: tasks-planner. Depends on: Core Architecture (01), Goals and Habits (02), Time and Focus (03). Other modules that use this one: Career (follow-up tasks), Learning (study tasks), Dashboard. This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Tasks and Planner answers one question every day: what should I do now, and what do I do today to move my goals forward? It holds every task you need to do, plans them across days, and connects each one to a goal so that work always has a reason. It also tracks what is overdue and what is slipping, so nothing important disappears.

Developer: bugs, features, and code reviews, planned against project deadlines and linked to goals like 'ship portfolio project'.

Student: assignments and revision items with due dates, sorted by how close the exam is.

Future employee: application follow-ups, interview prep tasks, and portfolio items, generated automatically from the Career module.

Disciplined person: a daily plan of realistic size that fits within the time available, not an endless list.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Task | A single action that can be completed | Write unit tests for the sync service |
| Subtask | A smaller step inside a task | Mock the network layer |
| List | A group of tasks by context or project | Expense app, Job search, University |
| Priority | How important a task is, independent of date | P1 urgent, P2 important, P3 normal, P4 someday |
| Due date | The date the task should be finished by | Friday 28 November |
| Scheduled day | The day the user plans to work on it, which may differ from the due date | Scheduled Tuesday, due Friday |
| Estimate | Expected time to complete, in minutes | 90 minutes |
| Daily plan | The set of tasks chosen for a given day, within a time budget | Three tasks totalling 4 hours |


# 3. Features (v1)

## 3.1 Task capture and editing

Create a task with: title, notes, list, priority, due date, scheduled day, estimate, linked goal (optional), tags, and recurrence (optional).

Quick capture: a single input at the top of the screen that creates a task with the title only, placed in the Inbox list. Sorting it later takes seconds.

Subtasks: unlimited checklist items inside a task. A task can be completed with incomplete subtasks only after confirmation.

Edit any field. Changing a due date keeps the original in history so slippage can be measured.

Attachments are not in v1. Links to files or URLs can be stored in notes.

## 3.2 Lists and organisation

Lists group tasks by context: Inbox (default), plus user-created lists such as 'Expense app', 'Job search', or 'University'.

Each list can be linked to a project in Time and Focus, so starting a task starts the right timer.

Lists can be archived. Archived lists keep their history and are hidden from the main views.

Labels (tags) are free text, filterable across lists.

## 3.3 Today and daily planning

Today view has three sections: Overdue, Planned for today, and Suggested. Overdue tasks are never hidden; they stay at the top until handled.

Each day has a time budget, set in Settings (default 6 hours of planning time). The planner shows total estimated minutes against the budget, so overloading is visible before it happens.

Drag to reorder tasks inside the day. Drag a task to a different day to reschedule it. Each reschedule is recorded.

Plan the day in a 60-second flow: the app presents suggested tasks based on due date, priority, and goal urgency, and the user accepts, moves, or removes each one.

End-of-day wrap-up: unfinished planned tasks are listed, and the user chooses for each one: move to tomorrow, reschedule to a chosen day, or leave in backlog.

## 3.4 Upcoming and calendar view

Upcoming: a seven-day list of scheduled and due tasks, grouped by day, with the time load for each day.

Month view: a calendar showing due dates and scheduled counts per day. Tapping a day opens its plan.

Calendar sync is not in v1. This is a planned extension.

## 3.5 Recurrence

Recurring tasks: daily, weekdays, weekly on chosen days, monthly on a date, or every N days.

Completing a recurring task creates the next occurrence with the same settings. Skipping an occurrence is allowed and recorded.

Recurring tasks are for chores, reviews, and routines. Recurring habits belong in Goals and Habits; the doc rule below explains the difference.

## 3.6 Priority and suggestion engine

Suggested tasks are ranked by a visible score: due date urgency (overdue and due today rank highest), priority level, goal urgency (linked goals with off-track status rank higher), and age (older unfinished tasks rise slowly so they are not forgotten).

The ranking formula is shown in Settings and can be adjusted, as in the Time and Focus module.

Suggestions never exceed the day's time budget unless the user chooses to override.

## 3.7 Goal links

A task can link to a goal or a milestone. Completing a linked task increments a numeric milestone where configured, and emits task.completed for the Goals module.

Goal detail screens show linked tasks, completed count, and open count.

## 3.8 Reminders

Morning plan reminder at a set time, showing the day's plan count and total time.

Due-soon reminders: one notification the evening before a due date and one on the due morning. No repeated reminders for the same task.

Reminders can be turned off per list.

## 3.9 Completion and history

Completing a task records completed_at and, when a focus session was active on the same project, the session total for that task.

Completed view: a searchable history grouped by week, with a count and a total of estimated versus actual time.

Completed tasks can be reopened within 30 days, which restores their previous fields.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'tasks-planner'. Estimates are stored in minutes. Due and scheduled dates are stored as local calendar dates in YYYY-MM-DD form; timestamps for completion and events are stored in UTC.

| Table | Key fields | Notes |
| --- | --- | --- |
| lists | name, color, linked_project_id, archived_at, sort_order, is_inbox | Exactly one row has is_inbox true; it cannot be deleted |
| tasks | list_id, title, notes, status (open | done | archived), priority (1-4), due_date, scheduled_date, scheduled_position, estimate_minutes, goal_id, milestone_id, recurrence_rule (JSON), recurrence_parent_id, completed_at, reopened_at, source (manual | ai | career | learning | recurrence) | scheduled_position orders tasks within a day |
| subtasks | task_id, title, done, sort_order | Completion of subtasks is tracked, not required |
| task_tags | task_id, tag | Many-to-many |
| task_history | task_id, field, old_value, new_value, changed_at, reason | Records reschedules, due date changes, and status changes |
| daily_plans | date (local), time_budget_minutes, notes | One row per day that has been planned |
| recurrence_skips | task_id, occurrence_date, skipped_at | Records skipped occurrences |
| tasks_settings | key, value | Default time budget, priority weights, reminder times |


Indexes: tasks on (status, due_date), tasks on (scheduled_date, scheduled_position), tasks on (list_id), task_tags on (tag), task_history on (task_id).

# 5. Business rules

A task belongs to exactly one list. Deleting a list moves its tasks to Inbox, not to deletion.

A task's status is open until completed (done) or archived. Archived tasks are hidden from all views except the archive search.

Due date and scheduled date are independent. A scheduled date after the due date is allowed but shows a warning.

A task is overdue when status is open and due_date is before today (local date).

Daily time budget check: the sum of estimate_minutes for tasks scheduled on a day, where no estimate counts as 30 minutes, is compared with that day's budget. Over-budget days show a warning, never a block.

Recurring tasks: completing an occurrence creates the next occurrence in a new row linked by recurrence_parent_id. Past occurrences are never edited to change their history.

Recurring tasks are for chores and routines. Any task that is repeated with a streak or daily check-in should be a habit in Goals and Habits. The app suggests moving a recurring task to a habit when it has been completed daily for 14 days.

Reopening a completed task within 30 days restores its previous fields and clears completed_at. Reopening after 30 days creates a new task that references the original.

Deleting a task is a soft delete with a 30-day Recently Deleted list, consistent with the Core rules.

Priority ties are broken by due date, then by creation time, so the order is always deterministic.

Estimates are never changed automatically. Only the user or an approved AI proposal changes them.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | task.created | Payload: task id, list id, goal id. Used by AI context. |
| Emits | task.completed | Payload: task id, goal id, milestone id, estimate, linked focus minutes. Main event consumed by Goals and Habits. |
| Emits | task.rescheduled | Payload: task id, old date, new date. Used by AI for slippage analysis. |
| Emits | task.overdue | Fired once per task per day when it first becomes overdue. |
| Emits | plan.overloaded | Fired when a day's estimated total exceeds its budget. |
| Listens | focus.session.completed | Adds actual focus minutes to the task's history when a session is linked to the task's list project. |
| Listens | career.application.updated | Creates a follow-up task when an application moves to Interview or Applied with a 7-day gap. |
| Listens | learning.item.progressed | Creates a revision task when a course module is completed, if the user has turned this on. |
| Listens | goal.milestone.reached | Surfaces related open tasks in the Today suggestions. |


All listeners are idempotent using processed_events. Automatically created tasks are tagged with the source field so they can be found, reviewed, or bulk-removed.

# 7. Query API (read-only)

export const queries = {

getTodayTasks(date: LocalDate): Promise<TodayPlan>

getOverdueCount(): Promise<number>

getOpenTasksForGoal(goalId: string): Promise<TaskSummary[]>

getCompletedInRange(range: DateRange): Promise<CompletedStats>

getDayLoad(date: LocalDate): Promise<DayLoad>

getSuggestions(date: LocalDate, limit: number): Promise<RankedTask[]>

};

Other modules read tasks only through these functions. The Dashboard reads TodayPlan for the Today widget.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI turns a brain dump into a clean list, plans your day realistically within your time, and reschedules intelligently when things slip. It helps you decide, and it never reorganizes your tasks silently.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| tasks.list | read | Lists tasks filtered by list, status, date, or goal | No |
| tasks.getToday | read | Returns today's plan, overdue items, and load | No |
| tasks.create | write | Proposes one or more tasks from text, with list, priority, due date, and estimate | Yes, shows all proposed tasks in an editable list |
| tasks.reschedule | write | Proposes new scheduled dates for one or more tasks | Yes, shows before and after |
| tasks.updateEstimate | write | Proposes a new estimate based on similar past tasks | Yes |
| tasks.planDay | write | Proposes a full day plan within the time budget | Yes, user accepts, moves, or removes each item |
| tasks.breakDown | write | Proposes subtasks for a large task | Yes |
| tasks.analyzeSlippage | read | Explains which tasks slip and why, from history data | No |


## 8.3 AI features

Brain dump to tasks: paste or speak a messy list such as 'Need to fix the login bug, call the recruiter back, read chapter 4, finish the README, pay rent'. The AI splits it into tasks, assigns lists and due dates where mentioned, estimates time, and asks for missing details in one question at most.

Smart day plan: each morning the AI proposes a day plan that fits your time budget, mixes deep work with small tasks, and puts overdue items first. You accept, move, or remove each one in under a minute.

Estimate learning: after enough completed tasks, the AI proposes estimate adjustments based on your actual times, for example 'Tasks labelled API integration take you about 1.6 times longer than estimated.'

Breakdown: for a large task such as 'Build payment module', the AI proposes subtasks you can edit before saving.

Slippage analysis: the AI explains why tasks keep moving, for example 'Five tasks in the Job search list were rescheduled more than twice, usually on days with more than 6 hours planned.'

End-of-day wrap-up: the AI suggests where each unfinished task should go, based on its due date and the next day's load. You confirm the moves.

## 8.4 What the AI is given

Open tasks with title, list, priority, due date, scheduled date, and estimate. Notes are sent only when the user asks for a breakdown or a plan that needs them.

Completion history with estimated and actual times for the past 30 days, aggregated where possible.

Goal titles and their open-task counts, plus the day's time budget.

# 9. How this module helps you most

One place for every action: tasks from Career, Learning, and your own brain dumps all land here, so you stop keeping three separate lists in your head.

A plan that fits your day: the time budget stops the common mistake of planning eight hours of work into a six-hour day, and warns you before you start.

Overdue tasks stay visible: they are never silently pushed away, which is where most to-do apps lose their value.

Realistic estimates: learning from your own history makes each plan more accurate over time, without you tracking anything extra.

Work linked to goals: each task that moves a goal shows up in progress, so the list always answers 'why am I doing this?'

Automatic follow-ups: a job application that has been quiet for seven days produces a follow-up task, so opportunities don't go cold.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Today | Quick capture bar, Overdue section, Planned for today with time total against budget, Suggested section, Plan my day button |
| Plan my day | Guided flow showing suggestions with accept, move, and remove for each task, then confirm |
| Wrap-up | Unfinished tasks with move, reschedule, or backlog choices |
| Upcoming | Seven-day list grouped by day with load per day |
| Month | Calendar with due and scheduled counts, tap a day to open its plan |
| Lists | All lists with counts, create, rename, archive, link to project |
| List detail | Tasks grouped by status or priority, filter by tags, bulk actions |
| Task create/edit | Form fields from section 3.1, recurrence picker, subtasks, history |
| Completed | Searchable history by week, totals of estimated versus actual time, reopen action |
| Settings | Time budget per day, priority weights, reminder times, recurrence defaults |
| Recently deleted | Soft-deleted tasks with restore for 30 days |


# 11. Build components, in order

schema.ts: lists, tasks, subtasks, task_tags, task_history, daily_plans, recurrence_skips, tasks_settings.

types.ts: Zod schemas for task input, list input, recurrence rule, and query results.

service.ts: pure functions for overdue detection, day load calculation, suggestion ranking, recurrence next-date calculation, and end-of-day wrap-up rules. Build and test these first.

repository.ts: tasks, lists, subtasks, history, and daily plans, including Inbox protection.

Recurrence engine: generates next occurrences on completion and handles skips.

Event emitters and listeners for focus, career, learning, and goal events.

Reminder scheduler: morning plan and due-soon notifications, with one reminder per task per trigger.

screens: Today, Plan my day, Wrap-up, Upcoming, Month, Lists, List detail, Task create/edit, Completed, Settings, Recently deleted.

Dashboard widgets: Today plan with load bar, Overdue count, Next due tasks.

ai-tools.ts: the tools in section 8.2 with Zod schemas and confirmation-aware handlers.

index.ts: the module manifest.

# 12. Testing requirements

Unit tests for overdue detection at midnight boundaries and for tasks due today.

Unit tests for day load: no estimate defaults to 30 minutes, over-budget warning triggers at exactly budget plus one minute.

Unit tests for suggestion ranking, including deterministic tie-breaking.

Recurrence tests: weekly on Monday and Thursday, monthly on the 31st (moves to last day of shorter months), every 3 days, skip then complete.

Inbox protection: the Inbox cannot be deleted or archived, and deleting another list moves its tasks there.

Reopen rules: within 30 days restores fields, after 30 days creates a referenced new task.

Event tests: each listener is idempotent, and automatic follow-up tasks are not created twice for the same application.

Soft delete and restore tests, consistent with the Core repository tests.

Timezone test: a task due 'today' changes to overdue at local midnight, not UTC midnight.

# 13. Definition of done (v1)

A user can capture tasks instantly, organize them into lists, and edit all fields including subtasks.

The Today screen shows overdue, planned, and suggested tasks, with load against the daily budget.

Plan my day and end-of-day wrap-up work end to end, with rescheduling recorded in history.

Recurring tasks create the next occurrence reliably, with skips recorded.

Tasks linked to goals update progress, and focus time links to task lists.

Career and Learning events create follow-up tasks without duplicates, marked by source.

The AI brain dump, day planning, and breakdown features work, with confirmation on every write.

With AI off, every manual feature works unchanged.

All tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
