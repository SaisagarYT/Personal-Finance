Life Operating System: Project Plan

# 1. Vision

A personal operating system for your life: one app that helps you plan your day, track what you do, understand where your time and money go, and grow toward your goals. The AI's job is to turn your daily logging into insight and gentle direction, not to add more work for you.

# 2. Who it is for

You fit several of these at once, so the app should serve all of them:

Developer: coding sessions, projects, skills being learned, focus time.

Student: courses, assignments, exam dates, study hours, notes.

Future employee: job applications, interview prep, certifications, portfolio work, networking contacts.

Goal setter and disciplined person: habits, streaks, weekly reviews, long-term goals with milestones.

# 3. Modules

Modules are listed in order of value. Build them one at a time on a shared core.

| Priority | Module | What it does |
| --- | --- | --- |
| 1 | Goals and habits (core) | Goals broken into milestones, daily habits with streaks. Ties all other modules together. |
| 2 | Time and focus log | Start and stop timers for work, study, or practice, tagged by project. |
| 3 | Tasks and planner | Today's list with priorities pulled from your goals. |
| 4 | Learning | Courses, books, skills, notes, and reading progress. |
| 5 | Career pipeline | Job applications with status, deadlines, interview prep, and contacts. |
| 6 | Finance | Expenses, savings goals, and monthly summary. |
| 7 | Journal and mood | Short daily entry that helps the AI spot patterns. |


# 4. Technical direction

Mobile app: React Native with Expo and TypeScript, styled with NativeWind (Tailwind for React Native).

Shared core: one data layer, one module registry, and one navigation shell that the future web dashboard will reuse.

Web dashboards (later): React with the same TypeScript types and data models, so logic is written once.

Storage: start on-device (SQLite via Expo), then add a sync backend when you need multi-device use.

# 5. How the AI adds value

Daily plan: each morning, the top three things to do, based on goals, deadlines, and yesterday's gaps.

Weekly review: time spent per goal, habits kept, money spent, and one specific suggestion for next week.

Quick capture: type or speak "studied DSA for 1 hour, applied to two jobs, spent 300 on food" and each item is filed in the right module.

Pattern alerts: for example, "You study less on days after late coding sessions." These need a few weeks of data first.

The AI confirms before it writes data, at least in the first version.

# 6. Build roadmap

Week 1: Set up the Expo TypeScript project, NativeWind, navigation shell, and module registry.

Week 2: Build Goals and Habits, the core module.

Week 3: Build the Time and focus log.

Week 4: Add the AI daily plan using the first week of real data.

Weeks 5 to 8: Add Tasks, Learning, Career pipeline, Finance, and Journal, one at a time.

After v1: Build the web dashboard on the shared core, then add the weekly review and pattern alerts.

# 7. Open decisions

Start with the study and developer side, or the career side?

Manual logging first, or voice and chat entry from the start?

Single user on-device, or accounts with cloud sync from the beginning?
