Core Architecture

This document defines the shared foundation that every module depends on. It is written so that an AI coding assistant can implement it directly. Read sections 1 to 4 before any module doc.

# 1. Purpose

The Core is the platform on which all modules run. It provides the module registry, the shared data layer, navigation, the event bus that lets modules talk to each other, the AI service, and the cross-module dashboard. No module contains its own navigation, storage setup, or AI plumbing. Modules only implement their own data models, screens, and logic.

# 2. Tech stack (fixed, do not change)

| Layer | Choice | Notes |
| --- | --- | --- |
| App framework | Expo (managed workflow), SDK latest stable | Use expo-router for file-based navigation |
| Language | TypeScript, strict mode | tsconfig strict: true, noImplicitAny: true |
| Styling | NativeWind v4 (Tailwind for React Native) | Use className props; define theme tokens in tailwind.config.js |
| Local database | expo-sqlite with Drizzle ORM | Drizzle gives typed queries and migrations |
| State | Zustand for UI state; Drizzle/SQLite is the source of truth for data | Do not store persistent data only in Zustand |
| Validation | Zod | Every input from the user or AI is validated with Zod before writing |
| Date handling | date-fns | Store all timestamps as ISO 8601 UTC strings; display in local time |
| AI | Anthropic Claude API via a backend proxy | Never call the AI API directly from the app with the API key in the client |
| Backend (later) | Node.js with Hono or Express | Hosts the AI proxy and sync. Not needed for v1 offline features |
| Testing | Jest with jest-expo; Maestro for end-to-end | Unit tests for every module's logic and repository layer |


# 3. Project structure

Create exactly this folder layout. Every module lives in its own folder under src/modules and follows the same internal structure.

life-os/

app/                          expo-router screens (thin wrappers only)

_layout.tsx                 root layout: providers, DB init, nav

(tabs)/_layout.tsx          bottom tab navigator

(tabs)/index.tsx            Today dashboard

src/

core/

db/                       client, migrations, base repository

registry/                 module registry and types

events/                   typed event bus

ai/                       AI service client and prompt router

ui/                       shared components (Card, Button, ProgressBar, etc.)

theme/                    NativeWind tokens and dark mode

utils/                    date helpers, id generation, formatting

modules/

goals-habits/

schema.ts               Drizzle table definitions

repository.ts           data access functions

service.ts              business logic (pure functions where possible)

types.ts                Zod schemas and TypeScript types

ai-tools.ts             functions the AI can call for this module

screens/                React components for this module

index.ts                module manifest (registration)

time-focus/               same structure

tasks-planner/            same structure

learning/                 same structure

career/                   same structure

finance/                  same structure

journal/                  same structure

drizzle/                      generated migrations

__tests__/                    mirrors src/ structure

# 4. Module contract

Every module exports one manifest object from src/modules/<name>/index.ts. The registry reads these manifests and does everything else. A module must satisfy this interface exactly:

export interface ModuleManifest {

id: string;                    // kebab-case, unique, e.g. 'goals-habits'

name: string;                  // display name

icon: string;                  // icon name from the icon set

version: number;               // increments when schema changes

schema: DrizzleTableMap;       // tables this module owns

migrations: Migration[];       // ordered, append-only

routes: RouteDefinition[];     // screens to register with expo-router

tabPosition?: number;          // if it appears in the bottom tab bar

events: {

emits: string[];             // event names this module publishes

listens: string[];           // event names this module subscribes to

};

aiTools: AiToolDefinition[];   // functions the AI assistant may call

dashboardWidgets: WidgetDefinition[]; // cards shown on the Today screen

onInstall?: (ctx: ModuleContext) => Promise<void>;

}

Rules:

Modules never import from each other directly. They communicate only through the event bus or through the read-only query API in section 8.

Modules never import from app/. Screens in app/ are thin wrappers that render components from src/modules/<name>/screens.

A module with a schema change must bump its version and add one new migration. Existing migrations are never edited.

# 5. Database layer

## 5.1 Conventions for every table

Every table defined by any module must include these columns. This is enforced by a shared helper, not copied by hand:

| Column | Type | Rule |
| --- | --- | --- |
| id | text (primary key) | UUID v4 generated on insert |
| created_at | text | ISO 8601 UTC, set on insert, never changed |
| updated_at | text | ISO 8601 UTC, set on every update |
| deleted_at | text, nullable | Soft delete. Queries exclude rows where deleted_at is not null |
| module_id | text | Module that owns the row, for export and debugging |


## 5.2 Base repository

Implement a generic base repository in src/core/db/base-repository.ts with: findById, findMany(filter), insert, update, softDelete, and restore. Each module repository extends it and adds domain queries. No module writes raw SQL for basic CRUD.

## 5.3 Migrations

Migrations are generated by Drizzle Kit and stored in /drizzle.

The core runs all pending migrations for every installed module at app start, in order of module id, then migration number.

A migration table tracks applied migrations per module (module_id, version, applied_at).

If a migration fails, the app shows a recovery screen with the error and does not continue to load modules.

## 5.4 Backups

v1: export the full database as a JSON file to the device's Files app, on demand, from Settings.

Later: scheduled export and restore.

# 6. Module registry

The registry is the single place that knows which modules exist and in what state they are.

On app start, import the manifest list from src/modules/*/index.ts (a single generated file lists them, e.g. src/modules/index.ts).

Validate each manifest against the ModuleManifest type at startup. A manifest that fails validation is logged and skipped, and the Settings screen shows it as 'failed to load' with the reason.

Each module has an enabled flag stored in the core settings table. Disabled modules keep their data but hide their tabs, widgets, and AI tools.

Expose these functions: getModules(), getEnabledModules(), getModule(id), setModuleEnabled(id, enabled).

# 7. Navigation

Bottom tab bar with five tabs: Today, Goals, Focus, Learn, More. Tab icons and labels come from the manifest where tabPosition is set.

'More' opens a list of all remaining enabled modules (Tasks, Career, Finance, Journal, plus any later modules) and the Settings screen.

Every module screen is registered through its manifest's routes array. The core never hard-codes module screens.

Deep links use the pattern life-os://<module-id>/<path>, so the AI and notifications can open a specific screen.

# 8. Event bus and cross-module queries

## 8.1 Events

Events are how modules react to each other without importing each other. Events are typed with a single union type in src/core/events/types.ts. Each event has a name, a payload, and a timestamp.

Initial events every module can use:

| Event | Emitted when | Typical listeners |
| --- | --- | --- |
| focus.session.completed | A time session stops | Goals (progress), Habits (auto-tick), Dashboard |
| task.completed | A task is marked done | Goals (progress), Dashboard |
| habit.checked | A habit is ticked for the day | Dashboard, Journal (context) |
| goal.milestone.reached | A goal milestone is completed | Dashboard, AI daily plan |
| learning.item.progressed | A course, book, or lesson is updated | Goals, Dashboard |
| career.application.updated | An application changes status | Tasks (follow-up task created), Dashboard |
| finance.expense.added | An expense is saved | Dashboard, Goals (savings goal progress) |
| journal.entry.saved | A daily entry is saved | AI pattern engine |


## 8.2 Rules

Publishing is synchronous to the bus; handlers run asynchronously and must not throw. Errors are caught and logged by the bus.

Event handlers must be idempotent. The same event can be delivered twice after a crash.

Events are also written to an event_log table so the AI and history views can read them.

## 8.3 Read-only query API

When a module needs data from another module (for example, Goals showing focus hours), it calls a read-only function exposed in that module's index.ts under a queries object. It never queries another module's tables directly.

# 9. AI service

## 9.1 Architecture

The mobile app sends requests to a backend AI proxy. The proxy holds the Anthropic API key and forwards requests to Claude.

For v1, while the backend is not built, use a development-only direct call behind a feature flag. The key must never be committed or bundled in a production build.

All AI requests include only the data needed for that task, never the entire database.

## 9.2 Tool calling

The AI works by calling tools. Each module declares its tools in ai-tools.ts. Every tool has a name, a description written for the model, a Zod input schema, and a handler. Example tool names: goals.create, goals.list, habits.check, focus.start, focus.stop, tasks.create, journal.saveEntry.

Read tools run immediately. Write tools return a proposed change, and the app shows a confirmation card the user approves or edits before anything is saved.

Each write tool result must be recorded in the event log with a flag showing it came from the AI and that the user approved it.

The AI can never delete data. Deletion only happens from the user's own screens.

## 9.3 Assistant context

Each request includes: today's date and local time, the user's active goals (titles and progress only), enabled module list, and the last 7 days of summary data relevant to the request. Keep requests small to control cost and latency.

## 9.4 Failure behavior

If the AI is offline or fails, every feature still works without it. The app shows a clear 'AI unavailable' message and never blocks a manual action.

Responses are validated against the Zod schema of the tool. Invalid responses are discarded and logged, not partially saved.

## 9.5 Privacy

Journal text and finance details are sent to the AI only when the user asks for an AI feature that needs them.

A setting lets the user turn off AI completely. When off, no data leaves the device.

# 10. Home (Today) dashboard

The Today screen is built from widgets. Each module returns a WidgetDefinition with a size (small or large), a priority number, and a render component that reads through its query API. The Today screen shows:

Greeting and the date, with the AI daily plan card at the top when enabled.

Today's focus summary: total focus time and current streak.

Habits due today with one-tap check-in.

Top goals with progress bars and the next milestone.

Today's tasks and upcoming deadlines (from Tasks and Career).

Money snapshot: spending this month against budget (from Finance), if enabled.

Quick actions: start focus, log expense, add journal entry, ask the AI.

Widgets from disabled modules are not rendered. Widget order can be changed by the user in Settings.

# 11. Shared UI components

Build these in src/core/ui before any module screens. Every module uses them so the app looks consistent:

Card, Section, Button (primary, secondary, ghost, destructive), TextField, NumberField, DatePicker, TimePicker.

ProgressBar, StreakBadge, Chip (for tags and categories), EmptyState, ErrorState, LoadingState.

ConfirmationCard: used for AI proposals showing the proposed change with Approve, Edit, and Reject.

ListItem with swipe actions for complete and delete.

Every component supports light and dark themes through NativeWind tokens (for example bg-surface, text-primary, accent).

# 12. Settings

Profile: name, timezone (defaults to device timezone), week start day.

Modules: list of modules with enable and disable toggles and version numbers.

AI: master on/off switch, which data categories may be sent, and usage of AI requests this month.

Data: export to JSON, import from JSON, and a 'delete all data' action that requires typing a confirmation word.

Notifications: daily plan time, habit reminder time, focus session reminders.

Appearance: light, dark, or system theme.

# 13. Notifications

Use expo-notifications with local scheduled notifications. No push server is needed for v1.

Notifications are scheduled by modules through a core function scheduleReminder(id, time, title, body, deepLink).

Users can disable each category of notification separately.

# 14. Definition of done for the Core (v1)

The app launches on iOS and Android via Expo with NativeWind working in light and dark themes.

The module registry loads manifests, validates them, and enables or disables modules from Settings.

The database initializes, runs migrations per module, and recovers gracefully from a failed migration.

The base repository and soft-delete rules are implemented and unit tested.

The bottom tab bar and the More screen navigate correctly, and deep links open the right screen.

The typed event bus publishes and delivers events, and the event_log table records them.

The shared UI components exist and are visually consistent.

The Today screen renders widgets from enabled modules, with an empty state when there are none.

Settings supports module toggles, theme, data export and delete, and the AI on/off switch.

A test suite covers the registry, repository, event bus, and migration runner, and passes.
