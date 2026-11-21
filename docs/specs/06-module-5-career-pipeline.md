Module 5: Career Pipeline

Module id: career. Depends on: Core Architecture (01), Goals and Habits (02), Tasks and Planner (04), Learning (05). Time and Focus (03) is used for prep time. Other modules that use this one: Dashboard, Journal, Learning (skill gaps). This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Career Pipeline tracks every opportunity you are pursuing, from the first application to an offer or a rejection, and everything around it: contacts, interview rounds, preparation, follow-ups, and lessons learned. It replaces the scattered spreadsheet, inbox searches, and memory that most people use during a job search. It also keeps longer-term career work visible, such as portfolio projects, certifications, and networking, so the job search is not the only career activity you track.

Future employee: a single board of applications with status, deadlines, next actions, and interview prep for each company.

Developer: portfolio projects, open-source contributions, and technical write-ups, tracked as career evidence.

Student: internship and graduate applications with recruiting-season deadlines and assessment dates.

Disciplined person: a weekly pipeline review that shows whether the search is moving, not just busy.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Opportunity | A role or program you are pursuing or considering | Data Engineer at Acme, graduate scheme at Bank X |
| Stage | The current position of an opportunity in the process | Saved, Applied, Screening, Interview, Offer, Accepted, Rejected, Withdrawn |
| Round | One step within the interview stage | Recruiter call, technical screen, system design, final panel |
| Contact | A person connected to an opportunity or to your network | Recruiter Sam, former colleague now at Acme |
| Touchpoint | A logged interaction with a contact or company | Emailed the hiring manager on 3 Nov |
| Asset | A reusable career item: resume version, portfolio project, cover letter, case study | Resume v3 (backend focus) |
| Prep | Work done to get ready for a specific opportunity | Practise 10 system design questions |


# 3. Features (v1)

## 3.1 Opportunity board

Create an opportunity with: company, role title, source (job board, referral, company site, recruiter, event, other), location and work mode (remote, hybrid, onsite), salary range (optional), job link, application deadline, current stage, priority (high, medium, low), fit score (1 to 5), and linked goal.

Board view: kanban columns for each stage, with cards showing company, role, days in stage, next action, and next deadline. Cards can be dragged between stages; each move is recorded with a timestamp.

List view: a sortable table of the same data with filters for stage, priority, source, and work mode.

Quick add: paste a job link and the app pre-fills company, role, and location from the page, which the user confirms. No data is saved without confirmation.

Archive: rejected, withdrawn, and closed opportunities move to the archive after 30 days in a closed stage, with their full history kept.

## 3.2 Stage history and rounds

Every stage change is logged with date and an optional note. The timeline on each opportunity shows the full sequence.

Interview rounds: each round has type, date and time, format (phone, video, onsite, take-home, assessment), interviewers (linked to contacts), duration, status (scheduled, done, cancelled), and a debrief note.

Take-home and assessment deadlines are tracked as due items with reminders.

Rounds appear in Tasks and Planner as prep tasks automatically, and in the calendar view of this module.

## 3.3 Contacts and networking

Contacts store name, company, role, relationship type (recruiter, hiring manager, referrer, peer, mentor, interviewer), how you know them, and last contact date.

Touchpoints log each interaction with type (email, message, call, coffee, event), date, summary, and next follow-up date.

Follow-up reminders: contacts with no touchpoint for a set period (default 60 days) appear in a 'keep in touch' list.

Network map per opportunity: which contacts are connected to which company, so referrals are visible.

## 3.4 Preparation

Each opportunity has a prep checklist generated from its round types and the role's skill requirements (from the job description, which the user pastes or links).

Prep items can link to Learning items, skills, or notes so that revision happens inside the existing learning system.

Question bank: a personal list of interview questions with answer notes, tagged by topic (DSA pattern, system design, behavioural, role-specific). Mock interview practice logs date, topic, self-rating, and what to improve.

STAR story bank: a reusable set of stories (situation, task, action, result) tagged by competency such as leadership, conflict, or delivery under pressure. Stories can be attached to opportunities.

Prep time is recorded through Time and Focus, linked to the opportunity, so the user knows how many hours each application cost.

## 3.5 Assets and portfolio

Resume versions: store each version with a name, target role type, date, and a link or file reference. Each opportunity records which version was sent.

Portfolio projects: title, summary, stack, link, status, outcome, and the skills it demonstrates. Projects link to Learning skills so the skill map and portfolio agree.

Cover letter and answer drafts: stored as assets, reused across opportunities, never sent automatically.

## 3.6 Pipeline health and weekly review

Pipeline summary: count per stage, conversion between stages, average days per stage, and response rate by source.

Weekly pipeline review: new applications this week, interviews done and upcoming, follow-ups due, and overdue next actions. It takes under three minutes and feeds the Goals weekly review.

Stale opportunity warning: an opportunity with no stage change or touchpoint for 14 days is flagged with a suggested next action.

Goal link: a goal such as 'Land an offer by March' shows application volume, interview rate, and offer count from this module.

## 3.7 Reminders and deadlines

Application deadline reminders: 3 days before and on the day.

Interview reminders: the evening before and one hour before each round, with the link or location.

Follow-up reminders: suggested 7 days after an application with no response, and 2 days after an interview, for a thank-you touchpoint.

Offer deadline reminders: a clearly marked countdown, since offers often have response deadlines.

## 3.8 Offers and decisions

Offer record: base salary, bonus, equity, benefits notes, start date, currency, location, and the deadline to respond.

Comparison view: up to four offers side by side with total compensation estimated from the fields the user enters, and the user's own weighted criteria such as growth, team, and location.

Decision log: when an offer is accepted or declined, the reason is recorded. This is useful for future decisions and for reflection.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'career'. Money values are stored as integers in minor currency units with a currency code. Dates for deadlines are local calendar dates; event times are UTC.

| Table | Key fields | Notes |
| --- | --- | --- |
| opportunities | company, role_title, source, location, work_mode, salary_min, salary_max, currency, job_url, job_description, deadline_date, stage, stage_changed_at, priority, fit_score, goal_id, resume_version_id, closed_at, outcome_reason | stage is one of the enumerated values in section 2 |
| stage_history | opportunity_id, from_stage, to_stage, changed_at, note | Append-only |
| interview_rounds | opportunity_id, round_type, scheduled_at, format, location_or_link, duration_minutes, status, debrief, sort_order | Format and status are enumerated |
| round_interviewers | round_id, contact_id | Many-to-many |
| contacts | name, company, role, relationship_type, how_we_know, email, phone, linkedin_url, last_contact_at, keep_in_touch_days | Contact details are stored only as entered |
| touchpoints | contact_id, opportunity_id, type, occurred_at, summary, next_follow_up_date | Either contact_id or opportunity_id or both |
| prep_items | opportunity_id, title, status, linked_learning_item_id, linked_skill_id, due_date, source (checklist | manual | ai) | source shows AI-generated items |
| questions | question, answer_notes, topic, tags (JSON), last_practised_at | Personal bank |
| mock_sessions | question_id, practised_at, self_rating, improvement_note | Log of practice |
| stories | title, situation, task, action, result, competencies (JSON) | STAR format |
| story_links | story_id, opportunity_id | Many-to-many |
| resume_versions | name, target_role_type, created_on, reference (link or file id), notes | Referenced by opportunities |
| portfolio_projects | title, summary, stack (JSON), link, status, outcome, skill_ids (JSON) | Skill links use learning skills |
| offers | opportunity_id, base_amount, bonus_amount, equity_notes, currency, start_date, response_deadline, location, decision (pending | accepted | declined), decision_reason, decided_at | Money in minor units |
| offer_criteria | offer_id, criterion, weight, score | Used for weighted comparison |


Indexes: opportunities on (stage, deadline_date); touchpoints on (contact_id, occurred_at); interview_rounds on (scheduled_at); stage_history on (opportunity_id, changed_at).

# 5. Business rules

Stage transitions are free in both directions, except that a move to Accepted or Rejected requires a note or a reason so the record explains itself.

Moving an opportunity to Offer creates an offer record with decision pending and, if the user entered a response deadline, a reminder.

Accepting an offer sets all other open offers for the same opportunity family to closed, after confirmation. Opportunities at other companies are not changed automatically.

An opportunity is 'active' when its stage is Saved, Applied, Screening, Interview, or Offer. Only active opportunities appear in the main board and the stale warning.

Stale warning: active opportunities with no stage change or touchpoint for 14 days are flagged. The warning is suppressed while an interview round is scheduled within 7 days.

Keep-in-touch: a contact with last_contact_at older than keep_in_touch_days (default 60) appears in the keep-in-touch list. Logging any touchpoint resets the date.

Interview rounds with scheduled_at in the past and status still scheduled are shown as needing a status update, not changed automatically.

Prep items generated by the checklist are not duplicated when the round is rescheduled. They are matched by round id and type.

Money values are never converted between currencies automatically. Comparison view uses a user-entered exchange rate, stored with the comparison.

Deleting an opportunity soft-deletes its rounds, touchpoints, prep items, and offers, consistent with the Core rules. Contacts are never deleted by deleting an opportunity.

Resume versions cannot be deleted while referenced by an opportunity; they can be archived.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | career.opportunity.created | Payload: opportunity id, company, goal id. Used by AI for context. |
| Emits | career.application.updated | Payload: opportunity id, from stage, to stage, deadline. Consumed by Tasks (follow-ups), Goals (career goals), Dashboard. |
| Emits | career.interview.scheduled | Payload: round id, scheduled_at, prep item ids. Consumed by Tasks (prep tasks) and Time and Focus (suggested prep block). |
| Emits | career.offer.received | Payload: offer id, response deadline. Consumed by Dashboard and Tasks. |
| Emits | career.offer.decided | Payload: offer id, decision. Consumed by Goals (goal completion suggestion). |
| Emits | career.contact.followUpDue | Fired once per contact when the keep-in-touch date passes. |
| Listens | learning.item.completed | Marks linked prep items as done when the learning item was a prep item. |
| Listens | learning.skill.levelUp | Updates the requirement match for open opportunities that need that skill. |
| Listens | focus.session.completed | Adds prep minutes to the opportunity when the session is linked to it. |
| Listens | task.completed | Marks related follow-up actions done when the task was created from this module. |


All listeners are idempotent using processed_events. Follow-up and prep tasks are created with source 'career' so they can be traced and removed in bulk.

# 7. Query API (read-only)

export const queries = {

getActiveOpportunities(): Promise<OpportunitySummary[]>

getUpcomingRounds(range: DateRange): Promise<RoundSummary[]>

getPipelineStats(range: DateRange): Promise<PipelineStats>

getStaleOpportunities(): Promise<StaleItem[]>

getKeepInTouchList(): Promise<ContactSummary[]>

getOpenOffers(): Promise<OfferSummary[]>

getOpportunityPrepStatus(opportunityId: string): Promise<PrepStatus>

getCareerGoalProgress(goalId: string): Promise<CareerGoalProgress>

};

Other modules never read career tables directly. Contact details are not exposed to other modules; only names and counts.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI helps you apply faster with better-fitting applications, prepare for each interview from the actual job description and your own stories, and keep the pipeline moving. It drafts; you send. It never contacts a recruiter, submits an application, or accepts an offer on your behalf.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| career.listOpportunities | read | Lists opportunities by stage, deadline, or priority | No |
| career.getPipeline | read | Returns pipeline stats and stale items | No |
| career.createOpportunity | write | Proposes a new opportunity from a pasted job description or link text | Yes, editable card |
| career.updateStage | write | Proposes a stage change with a note | Yes |
| career.scheduleRound | write | Proposes an interview round and prep items | Yes |
| career.fitCheck | read | Compares a job description with the user's skills, projects, and learning items, returning matches and gaps | No |
| career.draftMessage | read | Drafts an application note, follow-up email, thank-you, or contact message for the user to copy | Not saved, shown to user only |
| career.prepPlan | write | Proposes a prep plan with questions, stories to use, and study tasks | Yes, user edits before tasks are created |
| career.mockInterview | read | Runs a practice interview in the app, asking one question at a time and giving feedback on answers | Feedback saved only if the user chooses |
| career.compareOffers | read | Explains a comparison of offers using the user's criteria | No |


## 8.3 AI features

Opportunity intake: paste a job description and the AI extracts company, role, location, requirements, and deadline into a proposed card for confirmation.

Fit check: the AI compares the job's requirements with your skills, learning items, and portfolio projects, and states honestly where the match is strong and where it is weak. Example: 'Strong match on Python and SQL. Gap: no evidence for Kafka. Learning item suggested: Kafka basics.' Gaps link to Learning.

Tailored resume suggestions: the AI proposes which bullet points from your portfolio and experience best fit the role. It does not invent experience. Every suggestion cites the source item it came from.

Interview preparation: from the job description and the round type, the AI proposes likely questions, matches each to a story in your story bank, and points out gaps where you have no story yet.

Mock interviews: the AI asks one question at a time, gives specific feedback on structure, clarity, and evidence, and suggests a stronger phrasing. Your answers are saved only if you choose.

Follow-up drafts: thank-you notes and follow-up emails drafted from the interview debrief and the contact's history. You copy and send them yourself.

Pipeline coaching: a weekly note on what is working, such as 'Referrals convert to interviews at three times the rate of cold applications. Two of your three active referrals have no follow-up scheduled.'

Offer comparison: explains the trade-offs between offers using the criteria and weights you set, without deciding for you.

## 8.4 What the AI is given

Opportunity company, role, stage, dates, and fit notes. Job descriptions are sent only for the opportunity being worked on.

Your skills, learning items, portfolio project summaries, and story bank, only for the relevant request.

Interview round types, dates, and debrief notes for prep and follow-up drafts.

Contact names and relationship types, never contact email or phone numbers.

Offer figures only when the user asks for a comparison. Offer data is never sent in other requests.

# 9. How this module helps you most

Nothing gets lost: every application, follow-up, and deadline is in one board, so missed deadlines and forgotten follow-ups become rare.

Better applications: fit checks show where to spend effort. Applying to a role where you have a strong match beats sending fifty generic applications.

Honest gap analysis: each gap becomes a learning item, so job search and skill building drive each other.

Interview readiness: each round has prep built from the actual job description and your own stories, which is much stronger than generic practice.

Data on your search: conversion by source and stage shows whether referrals, portfolio work, or cold applications are working, so you change tactics based on evidence.

Better decisions: offers are compared on your own criteria, and every decision is recorded with its reason.

Long-term career evidence: portfolio projects and stories remain useful after the search ends.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Pipeline board | Kanban by stage, cards with next action and deadline, quick add from job link |
| Pipeline list | Sortable table with filters for stage, priority, source, work mode |
| Opportunity detail | Header with stage and deadline, timeline, rounds, prep checklist, contacts, linked goal, offer section, AI fit check |
| Round create/edit | Form for type, time, format, interviewers, duration, debrief |
| Contacts | Contact list with last contact date, keep-in-touch list, contact detail with touchpoints |
| Prep hub | Question bank, mock interview, story bank, prep time per opportunity |
| Assets | Resume versions, portfolio projects, drafts library |
| Offers | Open offers with deadlines, offer detail, comparison view with weighted criteria, decision log |
| Pipeline review | Weekly summary: new, interviews, follow-ups due, stats by source and stage |
| Archive | Closed opportunities with outcome reasons, restore action |
| Settings | Stale threshold, keep-in-touch default, reminder timings, default source options |


# 11. Build components, in order

schema.ts: opportunities, stage_history, interview_rounds, round_interviewers, contacts, touchpoints, prep_items, questions, mock_sessions, stories, story_links, resume_versions, portfolio_projects, offers, offer_criteria.

types.ts: Zod schemas for opportunity, round, contact, touchpoint, offer, and story input, including the enumerated stages and formats.

service.ts: pure functions for active-stage filtering, stale detection, keep-in-touch calculation, stage conversion stats, offer weighted score, and prep checklist generation. Build and test these first.

repository.ts: all tables with stage history appended on every change.

Reminder scheduler: deadlines, interviews, follow-ups, offer deadlines, with one reminder per trigger.

Event emitters and listeners, including the prep-item completion listener.

screens: Pipeline board, Pipeline list, Opportunity detail, Round create/edit, Contacts, Prep hub, Assets, Offers, Pipeline review, Archive, Settings.

Dashboard widgets: Upcoming interviews, Application deadlines, Open offer countdown, Pipeline summary.

ai-tools.ts: the tools in section 8.2 with Zod schemas. The draft and mock interview tools never write to the database without explicit user action.

index.ts: the module manifest.

# 12. Testing requirements

Stage history test: every move creates one history row, and changes made from the board and from the detail screen produce identical history.

Active filter test: each stage is classified correctly, and closed stages are excluded from the board.

Stale detection test: exactly 14 days without change or touchpoint, with and without a scheduled round within 7 days.

Keep-in-touch test: a touchpoint on the boundary day resets the list correctly.

Offer test: accepting one offer does not change offers at other companies, and the confirmation is required before closing other offers.

Money test: minor-unit arithmetic for weighted comparison, no currency conversion without a stored rate.

Prep checklist test: rescheduling a round does not duplicate its prep items.

Privacy test: contact email and phone never appear in AI requests or other module queries.

Deadline and timezone test: a deadline on the local date reminds on the correct day across a timezone change.

Fit check test: gaps are reported when a requirement has no matching evidence; the AI cannot mark a gap as covered without a linked item.

# 13. Definition of done (v1)

A user can create opportunities, move them across the board, and see accurate stage history.

Interview rounds, prep items, contacts, touchpoints, and follow-ups work and feed Tasks and Time and Focus.

Stale and keep-in-touch lists are accurate and reset correctly.

Offers can be recorded, compared with weighted criteria, and decided with a logged reason.

Reminders for deadlines, interviews, follow-ups, and offers fire once each, at the right local time.

The AI intake, fit check, prep plan, mock interview, follow-up drafts, and offer explanations work, with no write to the database without confirmation.

Contact details are never sent to the AI or other modules.

With AI off, every manual feature works unchanged.

All tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
