Module 7: Journal and Mood

Module id: journal. Depends on: Core Architecture (01). Reads summaries from: Goals and Habits (02), Time and Focus (03), Tasks and Planner (04), Learning (05), Career (06), Finance (07). Feeds: Dashboard, AI pattern engine, AI daily plan, weekly review. This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Journal and Mood is the reflective layer of the app. It gives you a short daily space to record how the day went, how you felt, what you are grateful for, and what you want to change. On its own it is a diary. Combined with the other modules, it shows how your mood, energy, sleep, focus, spending, and habits move together, which no single module can show. That connection is what turns the journal from a private record into a source of insight.

Developer: notes on what made a productive day or a bad one, and a record of the problems that drained energy.

Student: how exam pressure affects focus and sleep, and what study routines actually worked.

Future employee: a record of interview experiences, rejections handled, and lessons learned, which helps with reflection and with interview stories.

Disciplined person: a daily check-in that keeps you honest about energy and burnout, and a monthly review of what you are learning about yourself.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Entry | One journal record for one local day. One entry per day in v1 | Today's entry, written at 21:30 |
| Mood | A rating of how you felt, on a simple scale, with an optional label | 4 of 5, 'steady' |
| Energy | A rating of your energy level during the day | 2 of 5 in the afternoon |
| Check-in | A quick daily prompt that takes under a minute | Mood, energy, sleep, one line |
| Prompt | A question offered to guide reflection | What drained you today? |
| Tag | A label on an entry, used to find and compare days | interview, burnout, win, exam |
| Context snapshot | A summary of the day's data from other modules, attached to the entry, read-only | 2.5 hours focus, 3 habits kept, 450 spent |
| Pattern | A relationship the AI finds across days and modules, stated with evidence and a confidence level | Low-sleep days show lower focus the next day |


# 3. Features (v1)

## 3.1 Daily check-in

A one-minute check-in shown on the Today screen in the evening, or whenever the user opens it: mood (1 to 5), energy (1 to 5), sleep quality (1 to 5, optional), and one line about the day.

Each rating uses the same tap-to-select control with a short label, so no typing is required for the basics.

The check-in can be completed in the morning for the previous day or in the evening for the current day. The entry records which one was used.

Skipping a day is recorded as skipped, not as missing, so streaks and averages are not distorted by days the user chose not to write.

## 3.2 Full journal entry

Free-form writing area with a title (optional), body text, and up to ten tags. Formatting is limited to plain text and simple lists so entries stay portable.

Guided prompts are optional. The user can choose from a set: what went well, what drained me, what I learned, what I am grateful for, what I will change tomorrow, and what I avoided today.

Mood and energy can be adjusted at any time during the day. The last saved value is shown, and earlier values are kept in the history.

Autosave every few seconds while writing, so no text is lost if the app closes.

Word count and writing streak shown quietly, not as a score.

## 3.3 Context snapshot

Each entry carries a read-only snapshot of the day from other modules: total focus time and deep work, tasks completed and overdue, habits done and missed, spending total and budget status, learning progress, and career events such as applications sent or interviews held.

The snapshot is generated when the entry is saved and refreshed on request. The user can see exactly which figures were used.

The snapshot is never edited directly. If the user disagrees with a figure, the figure is corrected in its source module.

Snapshots are shown as small chips on the entry, so the day's facts sit next to the reflection without cluttering it.

## 3.4 Calendar and history

Month calendar where each day shows a colour for mood and a dot for entries. Tapping a day opens the entry.

Timeline view: entries in reverse order with mood, tags, and a short preview.

Search across all entries by text, tag, mood range, or date range.

On this day: entries from the same calendar date in previous years, shown as a gentle, optional card.

## 3.5 Mood and energy charts

Line chart of mood and energy over the last 30 or 90 days, with the average and the variation shown.

Weekday view: average mood and energy by day of the week, computed after at least four weeks of data.

Overlay option: mood against one chosen signal from another module, such as sleep quality against focus time, shown as two lines on one chart with the correlation explained in plain words.

## 3.6 Tags and themes

Tags are free text with autocomplete from previous tags. Tag pages show all entries with that tag and its mood average.

Recurring themes: the most used words and tags in the last 30 days, shown as a simple list. Words are computed on device and are never sent to the AI unless the user asks for pattern analysis.

## 3.7 Monthly and weekly reflection

Weekly reflection: at the end of the week, a short screen shows mood and energy averages, the number of entries, the highest and lowest days with their snapshots, and one prompt for reflection. It feeds the weekly review in Goals and Habits.

Monthly reflection: a longer review covering trends, the top three wins, the top three drains, and a free-text answer to 'what do I want to carry into next month?'.

## 3.8 Private and secure entries

Entries can be locked individually so they require the Finance lock method or a separate journal PIN to open.

Locked entries are excluded from AI requests, search results on the Today screen, and widgets. They still count toward mood averages unless the user excludes them.

Export: all entries as Markdown or PDF, with an option to include or exclude locked entries.

## 3.9 Reminders

One evening check-in reminder at a time the user chooses, with no repeats if the check-in is completed.

A gentle reminder for the weekly reflection on the chosen day.

Reminders can be paused for a period, such as a holiday.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'journal'. Entry dates are local calendar dates in YYYY-MM-DD form. Mood and energy are integers from 1 to 5. Created and updated timestamps are UTC. Entry text is stored as plain text, with Markdown-safe escaping on export.

| Table | Key fields | Notes |
| --- | --- | --- |
| journal_entries | entry_date (unique), title, body, status (checked_in | written | skipped), checkin_source (morning | evening | manual), is_locked, word_count, created_at, updated_at | One row per local day; unique on entry_date |
| mood_records | entry_id, recorded_at, mood, energy, sleep_quality, label | Multiple records per day allowed; the latest is the day's value; history kept |
| entry_prompts | entry_id, prompt_key, answer | Answers to guided prompts |
| entry_tags | entry_id, tag | Many-to-many, tag is lowercase |
| context_snapshots | entry_id, generated_at, snapshot (JSON), source_versions (JSON) | Read-only; regenerated by creating a new row, old rows kept for history |
| entry_revisions | entry_id, body_before, changed_at | Keeps prior body text for recovery; limited to the last 20 revisions per entry |
| pattern_findings | pattern_type, statement, evidence (JSON), confidence, status (new | shown | dismissed | confirmed), created_at, expires_at | Stored AI findings with the data they were based on |
| journal_settings | key, value | Check-in time, reminder days, prompt set, lock settings, locked-entry inclusion rules |


Indexes: journal_entries on (entry_date); mood_records on (entry_id, recorded_at); entry_tags on (tag); pattern_findings on (status, created_at).

# 5. Business rules

Exactly one journal entry exists per local calendar day. Creating an entry for a date that already has one opens the existing entry.

An entry's status is checked_in when only mood and energy are saved, written when body text exists, and skipped when the user chooses to skip. A written entry never becomes skipped.

The day's mood and energy values are the latest mood_records for that day. Averages use one value per day, the latest, so multiple check-ins do not weight a day more heavily.

Mood averages exclude skipped days, which have no mood. Days with check-in only are included.

Context snapshots are generated when an entry is saved and on explicit refresh. They are never regenerated silently in the background, so historical entries stay stable.

Snapshot figures come only from the query APIs of other modules. The journal never reads their tables directly.

Body text is saved in revisions when it changes by more than 50 characters or when a session ends, limited to 20 revisions per entry.

Locked entries are never included in AI requests, search suggestions on the Today screen, or home widgets. Their mood values are included in averages only if the user has set that option.

Deleting an entry is a soft delete with 30-day recovery, consistent with the Core rules. Deleting an entry removes its context snapshots from view but does not change source module data.

Pattern findings expire after 60 days unless the user confirms them. Dismissed findings are not shown again for the same pattern for 90 days.

Times are stored in UTC. Entry dates use the user's local calendar day at the time of the check-in, so late-night entries belong to the day the user is living, with the day boundary set in settings (default 04:00, so entries before 04:00 belong to the previous day).

Writing does not expose text to any other module. Only the mood, energy, tags, and snapshot figures are available to other modules, through the query API.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | journal.checkin.completed | Payload: entry id, date, mood, energy. Consumed by Dashboard and Goals (weekly review). |
| Emits | journal.entry.saved | Payload: entry id, date, tags, status, is_locked. Consumed by AI pattern engine. Body text is not included in the event. |
| Emits | journal.entry.skipped | Payload: date. Used to keep streak and average logic accurate. |
| Emits | journal.pattern.found | Fired when a new pattern finding is created that the user should see. |
| Listens | focus.session.completed | Updates the day's snapshot focus totals when a snapshot is refreshed. Does not regenerate a snapshot automatically. |
| Listens | habit.checked | Same behavior as above for habit counts. |
| Listens | finance.expense.added | Same behavior as above for spending totals. |
| Listens | goal.milestone.reached | Offers a reflection prompt about the milestone for the day's entry. |
| Listens | career.interview.scheduled | Offers a prompt for interview reflection the day after the interview. |
| Listens | career.application.updated | Adds application count to the day's snapshot when a snapshot is refreshed. |


Listeners only mark a snapshot as stale. The user chooses to refresh it, which keeps saved entries stable and avoids unexpected changes to history. All listeners are idempotent using processed_events.

# 7. Query API (read-only, for other modules)

export const queries = {

getTodayCheckin(date: LocalDate): Promise<CheckinStatus>

getMoodSeries(range: DateRange): Promise<MoodPoint[]>

getAverageMood(range: DateRange): Promise<MoodAverage>

getStreaks(): Promise<WritingStreak>

getWeeklyReflectionData(weekStart: LocalDate): Promise<WeeklyReflectionData>

getTagFrequency(range: DateRange): Promise<TagCount[]>

};

These functions return only numbers, dates, and tag names. Entry bodies, prompt answers, and locked entries are never returned by the query API.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI reads your reflections alongside your data to find patterns you cannot easily see, helps you reflect more deeply when you ask, and turns your weekly and monthly reviews into clear next steps. It treats your writing as private. It can point out a pattern, but it never diagnoses a mental health condition, and it never presents a guess as a fact.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| journal.getMoodSummary | read | Returns mood, energy, and tag summaries for a period | No |
| journal.getEntry | read | Returns one entry's text, only when the user asks about that entry | No, requires user request |
| journal.searchEntries | read | Searches entries by text or tag and returns excerpts with dates | No |
| journal.saveEntry | write | Proposes an entry or appended text from a voice or chat message | Yes, user edits before saving |
| journal.findPatterns | read | Analyses data across modules and returns findings with evidence and confidence | Findings shown; saved only if the user keeps them |
| journal.draftReflection | read | Drafts a weekly or monthly reflection from the period's data | Shown to user to edit before saving |
| journal.promptReflection | read | Offers one reflective question tied to the user's current goals or a recent event | No |


## 8.3 AI features

Pattern engine: a regular analysis that combines mood, energy, sleep, focus, habits, spending, and career events to find relationships, for example 'On days you record less than 6 hours of sleep, your focus time the next day falls by about 30 percent across the last 8 weeks. Confidence: moderate, based on 14 such days.' Every finding shows its evidence and how many data points support it.

Pattern confidence rules: a finding is shown only when it has at least 14 supporting days and the relationship is consistent. Weak or single-occurrence findings are never shown as patterns.

Reflection assistant: when you write, you can ask for a question to help you think further. The AI asks one question at a time, based on what you wrote, and never rewrites your text without your request.

Weekly and monthly reflection drafts: a summary of the period in your own terms, using your tags and words where possible, with one suggested focus for next week.

Voice to journal: speak your entry and the AI turns it into clean text for you to review, keeping your wording rather than polishing it into something else.

Connections to goals: 'You mentioned feeling stuck on your job search in three entries this month, and your applications dropped from 6 to 1 in the same weeks. Would you like to plan a smaller weekly application target?'

Gentle wellbeing check: if entries over several days show consistently low mood and energy, combined with a reduction in sleep or habit completion, the AI says so plainly, reminds you that support is available, and suggests talking to someone you trust or a professional. It does not diagnose and does not interpret your private wording beyond what you show it.

## 8.4 What the AI is given

Mood, energy, sleep quality, tags, and context snapshot figures for the period being analysed. These are the default inputs for pattern analysis.

Entry text only when the user asks the AI to work with a specific entry, or explicitly opts in to text-based pattern analysis for a period. The opt-in is a setting and is shown on every request.

Never locked entries, never prompt answers unless the user asks for them, and never the revision history.

A consent check is shown before any AI request that includes entry text, and the user can see the entries that will be included.

# 9. Safety and wellbeing

A journal can contain distressing content. The module is designed to support the user without putting them at risk or pretending to be a clinician.

If an entry contains language suggesting the user may be at risk of harming themselves, the app shows a calm, non-alarming card with crisis support information for the user's region, offers to help the user contact someone they trust, and does not analyse or summarise that entry with AI.

Pattern findings never use words such as depression, anxiety, or diagnosis. They describe observable data, such as sleep, mood ratings, and focus time, and suggest talking to a professional for concerns.

The app makes clear that it is not a substitute for medical or mental health care.

Users can turn off mood-related pattern findings completely in settings.

# 10. How this module helps you most

A two-minute daily check-in creates a reliable mood and energy record, which is the basis for every pattern the app can find.

Context next to reflection: seeing that a rough day coincided with a missed habit and two overdue tasks makes the cause visible without a long analysis.

Real patterns with evidence: the pattern engine tells you what actually affects your focus, energy, and mood, so you change the right things rather than guessing.

Reflection that feeds planning: weekly and monthly reflections feed the weekly review and the daily plan, so what you learn changes what you do next.

Early warning for burnout: a steady drop in energy alongside rising workload is visible within weeks, when a change in pace is still easy.

Interview and career stories: reflections on hard days and lessons learned become material for interview answers and STAR stories.

Privacy you control: locked entries, opt-in text analysis, and a clear consent check mean the most personal material stays yours.

# 11. Screens

| Screen | Contents |
| --- | --- |
| Today check-in | Mood, energy, sleep, one line, check-in button, snapshot preview |
| Entry editor | Title, body with autosave, prompts panel, tags, mood and energy, lock toggle, snapshot chips |
| Calendar | Month view with mood colours and entry dots, tap to open |
| Timeline | Reverse chronological entries with previews, filters for tags and mood |
| Search | Text and tag search with date and mood filters |
| Trends | Mood and energy charts over 30 and 90 days, weekday view, overlay with another module |
| Tags | Tag list with counts and mood averages, tag detail with entries |
| Weekly reflection | Averages, highest and lowest days with snapshots, reflection prompt, AI draft, save |
| Monthly reflection | Trends, top wins and drains, carry-forward question, save |
| Patterns | Findings with evidence, confidence, data points, and keep, dismiss, or confirm actions |
| Locked entries | Entries behind the lock with unlock prompt |
| Settings | Check-in and reminder times, day boundary, prompt set, AI text analysis opt-in, pattern findings on or off, export |


# 12. Build components, in order

schema.ts: journal_entries, mood_records, entry_prompts, entry_tags, context_snapshots, entry_revisions, pattern_findings, journal_settings.

types.ts: Zod schemas for check-in input, entry input, mood range, and query results.

service.ts: pure functions for day boundary calculation, daily mood value (latest record), averages, streaks, weekly and monthly aggregation, and the safety keyword check that gates AI analysis.

repository.ts: entries, mood records, revisions, snapshots, and findings, with the unique entry-date constraint.

Snapshot builder: calls query APIs of other modules and stores the result with source versions.

Pattern engine: runs on a schedule, applies the confidence rules, and writes findings only when thresholds are met.

Event listeners that mark snapshots stale, and the reflection prompt generator.

Autosave and revision logic.

screens: Today check-in, Entry editor, Calendar, Timeline, Search, Trends, Tags, Weekly reflection, Monthly reflection, Patterns, Locked entries, Settings.

Dashboard widgets: Today check-in card, mood trend mini chart, streak indicator. Locked content never appears in widgets.

ai-tools.ts: the tools in section 8.2 with Zod schemas, the consent check, and the safety gate.

index.ts: the module manifest.

# 13. Testing requirements

Unique entry-date test: creating an entry for an existing date opens it; concurrent creation never produces two rows.

Day boundary test: entries saved at 03:30 belong to the previous day; at 04:30 to the current day; a setting change applies from that point and does not rewrite history.

Mood averaging test: multiple check-ins on one day count once, using the latest value; skipped days excluded.

Status transition test: written never becomes skipped; checked_in becomes written when body text is added.

Snapshot stability test: changing a source module's data does not change saved snapshots until refresh is requested.

Revision test: revisions are created at the threshold and at session end; the 20-revision limit removes the oldest.

Locked entry test: locked entries are excluded from AI requests, widgets, and search suggestions; their mood counts only when the setting allows.

Pattern threshold test: 13 supporting days produces no finding; 14 days with consistent direction produces one; inconsistent data produces none.

Dismissal test: a dismissed pattern is not shown again for 90 days; a confirmed pattern is retained.

Safety gate test: entries matching the self-harm safety check are not sent to AI or summarised, and the support card appears.

Consent test: text is never sent to AI without the opt-in and the visible consent check.

Wording test: pattern statements never include diagnostic terms; the test checks against a list of forbidden terms.

Autosave test: text survives an app kill between autosaves.

# 14. Definition of done (v1)

A user can complete a one-minute check-in each day, with skipped days recorded separately from missing days.

Full entries save reliably with autosave, prompts, tags, and locking.

Context snapshots show accurate figures from other modules and remain stable until refreshed.

Calendar, timeline, search, and trend views are accurate and fast with at least one year of data.

Weekly and monthly reflections are pre-filled, saveable, and feed the weekly review.

The pattern engine produces findings only at the defined confidence thresholds, with visible evidence.

The safety gate, consent check, and wording rules are implemented and tested.

With AI off, every manual feature works unchanged, and no journal text is ever sent anywhere.

All tests in section 13 pass, and the module loads and unloads through the registry without breaking other modules.
