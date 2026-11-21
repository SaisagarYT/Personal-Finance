Module 4: Learning

Module id: learning. Depends on: Core Architecture (01), Goals and Habits (02), Time and Focus (03), Tasks and Planner (04). Other modules that use this one: Career (skills and certifications), Journal, Dashboard. This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Learning is where you keep everything you are trying to learn and track how far you have got. It holds courses, books, skills, certifications, and the notes you take along the way. Each item has a clear progress state, a place in a learning path, and links to the focus time and goals that move it forward. The result is that you can always answer 'what am I learning, how far along am I, and what should I review next?'

Developer: languages and frameworks, tutorial series, system design reading, and a skill map that shows strengths and gaps.

Student: courses by semester, textbook chapters, lecture notes, spaced revision of key concepts before exams.

Future employee: certifications with exam dates, interview topics (DSA patterns, system design, behavioural stories), and portfolio skill evidence.

Disciplined person: a reading list that is actually read, with notes that can be found months later.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Learning item | Anything you learn from: course, book, article, video series, certification, or custom | AWS Solutions Architect course, Designing Data-Intensive Applications |
| Unit | A part of an item, such as a chapter, module, lesson, or exam topic | Chapter 4: Replication |
| Skill | A competence you are building, tracked by level | TypeScript, SQL, Dynamic programming |
| Path | An ordered set of items that leads to a skill or outcome | Backend path: SQL, then Node, then system design |
| Note | Something you wrote or captured while learning, linked to an item or unit | Key idea: leader election uses consensus |
| Review | A scheduled return to a note or unit to strengthen memory | Review in 3 days, then 7, then 21 |
| Certification | An item with an exam date and a passing requirement | AWS SAA, exam on 15 March |


# 3. Features (v1)

## 3.1 Learning items

Create an item with: title, type (course, book, article, video series, certification, custom), author or provider, link (optional), total units, status (planned, active, paused, completed, dropped), start date, target date, and linked goal (optional).

Import the unit structure: for a book, enter total pages; for a course, enter total lessons. Units are created automatically in bulk and can be edited afterwards.

Progress is recorded per unit or by a page or minute counter. The user chooses one progress mode per item: units completed, pages read, or minutes watched or read.

Pause, resume, complete, or drop an item. Dropping keeps all notes and history.

Rating and review: when an item is completed, the user can rate it from 1 to 5 and write a short review. These feed future recommendations.

## 3.2 Units and sessions

Mark a unit complete from the item screen or the Today card. Completing a unit records the date and, if focus time was logged against the item, the total time spent on it.

Reading and watching sessions: a quick log of pages or minutes, with an optional note. This is separate from Time and Focus, so a reading log does not require a timer, but a timer session can be linked to an item and its minutes are counted.

Reading streak per item and overall: consecutive days with any logged progress, shown on the item and in the module summary.

## 3.3 Notes and highlights

Create a note linked to an item and optionally a unit, with a title, body text, page or timestamp reference, and tags.

Highlights: a short quote or idea with a page reference. Stored as a note with type highlight. Copying quotes from ebooks is done by the user, not by the app scanning files.

Notes are searchable across all items with full text search.

Notes can be linked to other notes, creating a simple personal knowledge graph. Backlinks are shown on each note.

## 3.4 Spaced review

Any note can be added to the review queue. The review schedule uses fixed intervals in v1: 1 day, 3 days, 7 days, 21 days, and 60 days, adjusted if the user marks a review as hard (repeat sooner) or easy (move to the next interval).

Daily review card on the Today screen: up to five notes due for review, with 'remembered' or 'need more time' actions.

Review session: a focused screen showing one note at a time, the answer or details hidden until tapped, then the user grades it.

Exam mode: a deadline can be set for a certification or course exam. Review intervals shorten automatically in the final two weeks, and the plan shows how many review sessions remain.

## 3.5 Skills

Create a skill with a name, category (language, framework, concept, tool, soft skill), and a level from 0 to 5 with defined criteria: 0 not started, 1 aware, 2 can follow examples, 3 can build with reference, 4 can build independently, 5 can teach or explain in depth.

Skill levels are updated manually by the user, or proposed by the AI from evidence such as completed units, notes, and projects, always with a reason.

Link items and projects to skills. A completed certification or project can raise a skill's evidence count.

Skill map: a visual grid of skills grouped by category, showing level and last practised date, with gaps highlighted.

Skill decay: skills not practised in 90 days show a 'fading' indicator and suggest a review, not a level drop.

## 3.6 Paths

A path is an ordered list of items and skills with an outcome, for example 'Backend engineer foundation'.

The path shows the next recommended item, percentage complete across its items, and estimated remaining time based on past pace.

Paths can be linked to a goal in Goals and Habits, so completing path items moves that goal.

## 3.7 Certifications

A certification item has an exam date, a passing score or requirement (text), an exam booking reference (optional), and a readiness checklist (created from its units and practice tests).

Practice test results can be logged with date, score, and weak topics. Weak topics are linked to units and notes for review.

A countdown appears on the Today screen once the exam is within 60 days.

## 3.8 Library and search

Library view: all items grouped by status with progress bars and streaks.

Want-to-learn list: items the user plans to start, sortable by priority and linked goal.

Global search across items, notes, and skills.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'learning'. Progress counters are stored as integers in their chosen unit. Review dates are local calendar dates.

| Table | Key fields | Notes |
| --- | --- | --- |
| items | title, type, author, link, status, progress_mode (units | pages | minutes), total_units, total_pages, total_minutes, current_value, start_date, target_date, rating, review_text, goal_id, exam_date, exam_requirement | current_value is in the progress_mode unit |
| units | item_id, title, sort_order, completed_at, estimated_minutes | Completed when completed_at is not null |
| progress_logs | item_id, log_date (local), amount, unit_type (page | minute | unit), note, focus_session_id | Append-only; current_value on items is derived from logs and manual completions |
| notes | item_id, unit_id, title, body, note_type (note | highlight), page_ref, tags (JSON), created_at | Full text search index on title and body |
| note_links | from_note_id, to_note_id | Creates backlinks |
| review_items | note_id, interval_index, next_review_date, last_reviewed_at, status (active | suspended) | One row per note in review |
| review_logs | review_item_id, reviewed_at, outcome (remembered | hard | easy | again) | Used to adjust intervals |
| skills | name, category, level, criteria_version, last_practised_at, notes | level is an integer 0 to 5 |
| skill_evidence | skill_id, source_type (item | project | manual | ai), source_id, reason, created_at | Explains every AI-proposed level change |
| item_skills | item_id, skill_id | Many-to-many |
| paths | name, outcome, goal_id, status | Ordering handled in path_items |
| path_items | path_id, item_id, skill_id, sort_order | Either item_id or skill_id is set per row |
| practice_tests | item_id, taken_on, score, max_score, weak_topics (JSON) | Used for readiness |


Indexes: progress_logs on (item_id, log_date); notes full text on (title, body); review_items on (next_review_date, status); skill_evidence on (skill_id).

# 5. Business rules

Item progress: in units mode, progress is completed units divided by total units. In pages or minutes mode, progress is the sum of progress_logs amounts divided by the total, capped at 100 percent. A manual completion marks the item as complete at 100 percent regardless of logs.

Total units can be changed. Progress recalculates, and a warning is shown if progress drops because the total increased.

Progress logs are never edited in place. A correction is a new log with a negative amount and a note, keeping history honest.

An item cannot be completed while it has no units and no progress logs, unless the user confirms a manual completion.

Review scheduling: a new review item starts at interval 0 (next review tomorrow). 'Remembered' moves to the next interval. 'Hard' repeats the current interval. 'Easy' skips one interval. 'Again' resets to interval 0.

Exam mode shortens the interval ladder to 1, 2, and 4 days during the final 14 days before exam_date.

Skill level changes from the AI are never applied automatically. They are stored as a proposal with evidence, and only the user's approval updates the level.

Skill fading: a skill is marked fading when last_practised_at is more than 90 days ago. Fading never lowers the stored level.

A note can belong to one item or to no item, but never to more than one.

Dropping an item suspends its review items. Completing an item does not suspend them, so long-term review continues.

Times are stored in UTC. Review due dates and log dates use local calendar dates.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | learning.item.started | Payload: item id, type, goal id. Used by AI context. |
| Emits | learning.item.progressed | Payload: item id, amount, unit type, linked goal ids. Consumed by Goals and Tasks. |
| Emits | learning.item.completed | Payload: item id, rating, skill ids, goal id. Consumed by Goals, Career, and Dashboard. |
| Emits | learning.review.due | Fired once per day when review items become due. |
| Emits | learning.skill.levelUp | Fired when the user approves a skill level increase. |
| Emits | learning.exam.scheduled | Fired when an exam date is set. Consumed by Tasks to create preparation tasks. |
| Listens | focus.session.completed | If the session is linked to a learning item, adds its minutes to progress_logs as a minute entry, once per session. |
| Listens | goal.milestone.reached | Surfaces related items in the Today card when a learning-linked goal reaches a milestone. |
| Listens | career.application.updated | Suggests learning items for a skill gap when an application is rejected with a stated reason. Suggestion only. |


All listeners are idempotent. The focus-session listener checks focus_session_id on progress_logs to avoid double counting.

# 7. Query API (read-only)

export const queries = {

getActiveItems(): Promise<ItemSummary[]>

getItemProgress(itemId: string): Promise<ItemProgress>

getDueReviews(date: LocalDate, limit: number): Promise<ReviewCard[]>

getSkillMap(): Promise<SkillSummary[]>

getPathProgress(pathId: string): Promise<PathProgress>

getUpcomingExams(withinDays: number): Promise<ExamSummary[]>

getReadingStreak(): Promise<StreakInfo>

};

Other modules use these functions only. Career reads skills through getSkillMap. The Dashboard reads due reviews and upcoming exams.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI helps you choose what to learn next, turns your notes into review material, and keeps your skill map honest. It is a study partner that works from your own notes and progress, not from generic advice. It never marks something learned or changes a skill level without your approval.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| learning.listItems | read | Lists items with status and progress, filtered by type or skill | No |
| learning.searchNotes | read | Full text search across notes, returning excerpts and source items | No |
| learning.createItem | write | Proposes a new item with units, skills, and goal link | Yes, editable card |
| learning.logProgress | write | Proposes a progress log from a natural language description | Yes, shows parsed amount and item |
| learning.createNote | write | Proposes a note from text the user provides or dictates | Yes |
| learning.proposePath | write | Proposes an ordered path toward a skill or outcome | Yes, user edits order before saving |
| learning.proposeSkillLevel | write | Proposes a skill level change with evidence | Yes, shows evidence and reason |
| learning.makeReviewQuiz | read | Generates review questions from selected notes, shown only in the review session | No (not saved) |
| learning.explainFromNotes | read | Explains a concept using only the user's notes for an item, with citations to the notes | No |


## 8.3 AI features

Next step recommendation: 'You have finished the SQL basics path and are 40 percent through Node. Your notes show weak understanding of indexes. Next: the indexes unit in your database course, then a review of your two index notes.'

Review questions: from a set of notes, the AI writes questions for the review session. Questions are generated only from the user's own notes, so the user studies what they captured, not generic content.

Explain from my notes: the user asks about a concept and receives an explanation grounded in notes they have already written, with references to each note. If the notes don't cover it, the AI says so and offers a general explanation clearly labelled as not from the user's notes.

Skill level proposals: 'You completed two practice projects and one certification on Python. Proposed level: 3 (can build with reference). Evidence: project A, project B, certification exam score 84 percent.' You approve or change it.

Study plan for an exam: given an exam date and the items linked to it, the AI proposes a schedule of review sessions and practice tests across the remaining days, and creates tasks in Tasks and Planner once approved.

Note cleanup suggestions: the AI proposes tags and links between notes that discuss the same idea, which the user accepts or ignores.

Skill gap from career: when a job application is rejected with a stated reason, the AI suggests learning items that address the gap, marked as suggestions.

## 8.4 What the AI is given

Item titles, types, statuses, progress, and skill links. Notes only for the item or topic the user asks about, never the whole notes library at once.

Review performance per note in aggregate, for example the share of reviews marked hard, rather than full content.

Exam dates and linked items when preparing a study plan.

Career rejection reasons only when the user enables that suggestion feature.

# 9. How this module helps you most

Nothing you learn is forgotten: spaced review turns notes into a memory system, which is far more effective than rereading. Most people find that reviewing five notes a day keeps months of material fresh.

Clear progress: with progress per item and a skill map, you can see that you are advancing, not just busy.

Exam readiness: the countdown, review ladder, and study plan show whether you are on track for an exam or certification weeks before it.

Your own notes as the textbook: AI explanations drawn from your notes make the knowledge you actually captured the main source, which improves recall and makes the notes worth writing.

Career evidence: completed items and skill levels with evidence form a record you can use in interviews and in your portfolio write-up.

Gap-driven learning: rejected applications and skill map gaps point to what to study next, so effort goes where it matters for your career.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Learning home | Due reviews card, active items with progress bars, reading streak, upcoming exams, quick log button |
| Library | Items grouped by status, filters by type and skill, want-to-learn list |
| Item create/edit | Form fields from section 3.1, unit import, progress mode, skill links, goal link |
| Item detail | Progress, units list with check off, progress log, notes for this item, rating and review after completion, linked focus time |
| Quick log | Amount, unit type, note, optional timer link |
| Notes list and editor | Search, tags, backlinks, highlight type, link to item and unit |
| Review session | One card at a time, reveal, grade buttons, progress through the day's queue |
| Skill map | Grid by category with level and fading indicator, skill detail with evidence and proposals |
| Paths | Path list, path detail with ordered items and next step, progress |
| Certifications | Exam countdown, readiness checklist, practice test log, weak topics linked to notes |
| Settings | Default review intervals, exam mode defaults, suggestion toggles, reading streak rules |


# 11. Build components, in order

schema.ts: items, units, progress_logs, notes, note_links, review_items, review_logs, skills, skill_evidence, item_skills, paths, path_items, practice_tests.

types.ts: Zod schemas for item input, progress log input, note input, and review grade input.

service.ts: pure functions for progress calculation, the review interval ladder, exam-mode interval shortening, skill fading, and streak calculation. Build and test these first.

repository.ts: items, units, logs, notes with full text search, review items, and skills.

Review engine: builds the daily queue, applies grades, and schedules next dates.

Event emitters and listeners, including the idempotent focus-session listener.

screens: Learning home, Library, Item create/edit, Item detail, Quick log, Notes, Review session, Skill map, Paths, Certifications, Settings.

Dashboard widgets: Due reviews, Active learning progress, Next exam countdown.

ai-tools.ts: the tools in section 8.2 with Zod schemas, and the grounded-explanation tool enforces citations to notes.

index.ts: the module manifest.

# 12. Testing requirements

Unit tests for progress in all three modes, including manual completion, total unit increase, and progress capped at 100 percent.

Progress log correction test: a negative log reduces progress and history keeps both entries.

Review ladder tests: remembered, hard, easy, and again from every interval, including the last interval.

Exam mode test: intervals shorten exactly 14 days before the exam date and return to normal after it.

Skill proposal test: a proposal never changes the stored level until approved; fading never lowers a level.

Note-link test: a note cannot belong to two items; backlinks appear on both notes.

Full text search test with special characters and partial words.

Focus-session listener test: the same focus session delivered twice adds minutes once.

Grounded explanation test: when no notes match, the response says so and does not present general content as the user's notes.

# 13. Definition of done (v1)

A user can add items, import units, log progress, and complete items with ratings and reviews.

Notes can be created, linked, tagged, searched, and reviewed through spaced repetition.

The daily review queue works, with grades updating the schedule correctly.

Skills, the skill map, and paths work, with level changes only after approval.

Certifications show a countdown, a readiness checklist, and practice test results.

Focus time linked to items and goals is counted exactly once.

Next-step recommendations, review questions, grounded explanations, and skill proposals work through the AI, with confirmation on every write.

With AI off, every manual feature works unchanged.

All tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
