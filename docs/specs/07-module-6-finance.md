Module 6: Finance

Module id: finance. Depends on: Core Architecture (01), Goals and Habits (02). Feeds: Goals (savings goals), Dashboard (money snapshot), Journal (spending context), AI daily plan. Time and Focus, Tasks, and Career are not required. This doc follows the Core module contract, database conventions, and event rules.

# 1. Purpose and who it helps most

Finance tracks where your money comes in and goes out, so you can see your real spending, stay within budgets you set, and build savings toward goals. It is designed for quick daily logging, because a finance tool that takes two minutes a day gets abandoned. Most of the value comes from fast capture, honest categories, and a monthly view that answers 'am I on track?' in seconds.

Student: a monthly budget with a small allowance, tracking of fees and learning costs, and savings for a course or exam.

Future employee: saving toward a deposit, emergency fund, or relocation, with a runway estimate between jobs.

Developer: subscriptions, tools, and hardware purchases tracked as business or learning costs where useful, and a clear view of what each learning goal costs.

Disciplined person: a weekly check against budget, with savings goals that move visibly as money is set aside.

# 2. Core concepts

| Concept | Meaning | Example |
| --- | --- | --- |
| Account | A place money is held or spent from | Bank account, card, cash wallet, savings |
| Transaction | A single movement of money in or out of an account | Lunch, 450, Food, 14 Nov |
| Category | The type of spending or income | Food, Transport, Rent, Learning, Salary |
| Budget | A planned limit for a category over a period | Food: 6,000 per month |
| Savings goal | A target amount saved toward a named purpose by a date | Laptop: 90,000 by 30 June |
| Recurring item | A transaction expected to repeat on a schedule | Rent on the 1st, Gym on the 5th |
| Transfer | Money moved between your own accounts, not income or expense | Salary account to savings account |


# 3. Features (v1)

## 3.1 Accounts

Create accounts with name, type (cash, bank, card, savings, wallet), currency, and opening balance on a chosen date.

Account balance is calculated from its transactions and the opening balance. It is never typed in directly, so it cannot drift.

Reconcile: the user enters the actual balance from their bank app. The app shows the difference, and the user can create a correction transaction in one step, clearly labelled as an adjustment.

Archive accounts that are closed. Archived accounts keep their history.

## 3.2 Fast transaction capture

Quick add: amount, category, and account, with the most recent and most frequent categories shown first. The default date is today and the default account is the last one used.

Amounts can be entered with a calculator-style keypad, for example 120 plus 35, to handle split bills.

Notes and tags are optional. Tags are free text and can be used for trips, projects, or reimbursements.

Income is recorded the same way, with the income type set to income instead of expense.

Split a transaction across categories, for example one supermarket bill with food and household items. The split amounts must add up to the total.

Reimbursable flag: a transaction can be marked as to be reimbursed, with a status of pending or received, so it does not distort monthly spending.

Attachments of receipts are not in v1. A receipt reference or note is allowed.

## 3.3 Categories

A default set of categories is created on first launch: Food, Transport, Housing, Utilities, Health, Learning, Subscriptions, Shopping, Entertainment, Personal, Gifts, Savings, Income, Other.

Categories can be renamed, grouped under a parent group (for example Essentials or Lifestyle), and archived. A category with transactions cannot be deleted; it can be archived.

Each category has an icon and colour that appear in every chart.

Learning category links to the Learning module: spending on courses and books appears in a learning cost summary.

## 3.4 Recurring items

Create a recurring item with name, amount (fixed or estimated), category, account, frequency (weekly, monthly, yearly, or custom interval), and next date.

When the next date arrives, the app creates a pending transaction for confirmation. The user confirms, edits the amount, or skips the occurrence. Nothing is added silently.

Subscriptions view: all recurring items marked as subscriptions, with a monthly and yearly total and a list of those with no usage notes for 60 days, optional for the user to fill in.

Price change detection: when a confirmed recurring amount differs from the previous amount, the app highlights it.

## 3.5 Budgets

Monthly budget per category, with the amount and an optional rollover setting (unused amount carries forward or not).

Budget progress bars show spent against budget with three states: on track, near limit (above 80 percent), and over budget.

A total budget view shows income, planned spending, actual spending, and the amount left to save.

Budget templates: copy last month's budgets, or start from a percentage split (for example 50 percent essentials, 30 percent lifestyle, 20 percent savings).

Pace warning: mid-month, the app projects end-of-month spending per category from the current daily rate and warns if it will exceed the budget.

## 3.6 Savings goals

Create a savings goal with name, target amount, currency, target date, and the account where the money is kept (optional).

Contributions: a transfer to a savings goal from another account, or a manual contribution entry. Contributions are linked to the goal and reduce the amount left.

Required monthly saving: calculated from the remaining amount and the time left, shown on the goal.

Progress and projection: the goal shows a projected completion date based on the average monthly contribution over the last three months.

Linked goal: a savings goal can be linked to a goal in Goals and Habits, and its progress percentage feeds that goal's progress in finance mode.

Emergency fund: a special savings goal type, with a target expressed as months of essential spending, calculated from the last three months.

## 3.7 Reports and insights

Monthly summary: total income, total spending, net, savings rate (saved divided by income), top five categories, and comparison with the previous month.

Trend charts: spending and income over the last 6 or 12 months, by category and total.

Category breakdown: a donut chart with drill-down to the transactions for each slice.

Learning cost summary: total spent on learning in a period, grouped by item or course, linked to the Learning module.

Cash runway: the number of months the current cash balance covers at the average essential spending rate. Shown only when the user has marked categories as essential.

Export: CSV of all transactions for a date range, compatible with spreadsheets and accountants.

## 3.8 Import

Import a bank statement CSV: the user maps columns (date, description, amount, debit and credit if separate), previews the rows, and confirms. Duplicate detection uses date, amount, and description to avoid double entry.

Imports never categorise silently. Rows are imported as uncategorised and shown in a review list. Rules can be created from the review list so similar rows are categorised next time.

Category rules: a rule matches a description pattern and sets a category, for example 'contains TESCO' becomes Food. Rules are visible and editable.

## 3.9 Privacy and security

Finance data is stored on the device by default. Cloud sync is not part of v1.

A PIN or device biometric lock can be turned on for the module. The lock is required to open the finance screens; other modules remain usable.

Amounts can be hidden on the dashboard with a single tap, for use in public places.

# 4. Data model

All tables follow the Core conventions. Every table uses module_id value 'finance'. Money is stored as integers in minor currency units (for example paise, cents, or fils) with a currency code on every row. Transaction dates are local calendar dates. Created and updated timestamps are UTC.

| Table | Key fields | Notes |
| --- | --- | --- |
| accounts | name, type, currency, opening_balance_minor, opening_date, status (active | archived), sort_order | Balance is derived, never stored |
| categories | name, group_name, icon, color, kind (expense | income | transfer | savings), status (active | archived), is_essential, learning_link_flag | Kind controls which reports include it |
| transactions | account_id, date, amount_minor, currency, direction (in | out), category_id, payee, note, tags (JSON), transfer_pair_id, recurring_item_id, status (confirmed | pending | reconciled), is_adjustment, reimbursement_status (none | pending | received), import_batch_id, dedupe_key | Amounts are always positive; direction gives the sign |
| transaction_splits | transaction_id, category_id, amount_minor | Sum must equal transaction amount |
| recurring_items | name, amount_minor, currency, category_id, account_id, frequency, interval, next_date, is_subscription, status (active | paused | ended), last_amount_minor | Generates pending transactions |
| budgets | category_id, period_month (YYYY-MM), amount_minor, rollover (boolean) | Unique on (category_id, period_month) |
| savings_goals | name, target_minor, currency, target_date, account_id, goal_type (standard | emergency_fund), months_target, linked_goal_id, status | linked_goal_id references Goals and Habits |
| savings_contributions | savings_goal_id, transaction_id, amount_minor, date | Links to a transfer or manual entry |
| category_rules | pattern, match_type (contains | starts_with | exact), category_id, priority, status | Applied in priority order on import |
| import_batches | file_name, imported_at, row_count, duplicate_count, status | For undo of an import |
| finance_settings | key, value | Default currency, week start, lock settings, rollover defaults |


Indexes: transactions on (date); transactions on (account_id, date); transactions on (category_id, date); transactions on (dedupe_key); budgets on (period_month).

# 5. Business rules

Money is never stored as floating point. All arithmetic is done in integer minor units. Display formatting happens only in the UI.

A transaction's amount is always positive. Direction (in or out) determines its effect on the account balance.

Account balance = opening balance plus all in-transactions minus all out-transactions for confirmed and reconciled transactions. Pending transactions are shown separately and do not change the balance until confirmed.

A transfer creates two linked transactions (out from one account, in to the other) sharing a transfer_pair_id. Transfers are excluded from income and spending totals.

Savings contributions are transfers into a savings account with a savings goal link. They count as savings, not as spending, in the monthly summary.

Split transactions: the split amounts must equal the transaction total. Splits are validated before saving.

Income is any transaction with category kind income. Savings rate = (income minus spending) divided by income, computed only when income is greater than zero.

Budgets are measured against expense transactions only. Reimbursements pending are excluded from spending; once received, they are excluded from spending as well, because they were paid by someone else.

Rollover: if enabled, a category's unused budget from the previous month is added to the next month's budget. Overspending carries forward as a negative amount only if the user has enabled that setting.

Recurring items never auto-post. Each occurrence becomes a pending transaction that must be confirmed. Skipping an occurrence records a skip and advances the next date.

Import dedupe: a row is flagged as a duplicate when an existing transaction has the same account, date, amount, and normalized description. Duplicates are not imported unless the user overrides.

Editing a confirmed transaction's amount or date is allowed and recorded in an audit field. Reconciled transactions require a note when edited.

Deleting a category is only possible when it has no transactions. Otherwise it is archived.

Currency: each account has one currency. Cross-currency transfers require the exchange amount on both sides, entered by the user. The app never fetches exchange rates in v1.

Savings goal progress = sum of contributions divided by target, capped at 100 percent for display. Projection uses the average of the last three full months of contributions and is shown only with three months of data.

Emergency fund target = months_target multiplied by average monthly essential spending over the last three months, recalculated monthly and shown with the calculation.

# 6. Events

| Direction | Event | Behavior |
| --- | --- | --- |
| Emits | finance.expense.added | Payload: transaction id, amount_minor, currency, category id, date. Consumed by Dashboard and Goals (savings progress). |
| Emits | finance.income.added | Payload: transaction id, amount_minor, currency, date. Consumed by Dashboard and AI. |
| Emits | finance.budget.exceeded | Fired once per category per month when spending first passes the budget. |
| Emits | finance.budget.nearLimit | Fired once per category per month at 80 percent of budget. |
| Emits | finance.savings.contributed | Payload: goal id, amount_minor. Consumed by Goals and Dashboard. |
| Emits | finance.savings.goalReached | Fired once when a savings goal reaches its target. |
| Emits | finance.recurring.due | Fired when a recurring item creates a pending transaction. |
| Listens | learning.item.started | Offers to link a learning expense to the new item when a learning-category transaction is recorded. |
| Listens | career.offer.decided | Offers to create a savings goal for relocation or a new role when an offer is accepted with a relocation note. |
| Listens | goal.completed | Offers to archive linked savings goals when the Goals module completes a goal. |


Finance events are emitted only after the transaction is saved. Budget threshold events use a processed_events record per category and month, so they fire once even after edits.

# 7. Query API (read-only)

export const queries = {

getMonthSummary(month: YearMonth): Promise<MonthSummary>

getBudgetStatus(month: YearMonth): Promise<BudgetStatus[]>

getSavingsProgress(goalId: string): Promise<SavingsProgress>

getMoneySnapshot(): Promise<MoneySnapshot>

getLearningSpend(range: DateRange): Promise<LearningSpend>

getCashRunway(): Promise<RunwayEstimate | null>

getSubscriptionTotals(): Promise<SubscriptionTotals>

};

Other modules receive only summarized figures. No other module ever receives individual transactions, payees, or account names from this module.

# 8. AI integration

## 8.1 Purpose of AI in this module

The AI makes money tracking less effort and more useful. It categorises transactions, explains where money went, warns early about budget problems, and suggests realistic savings plans. It never moves money, never changes balances, and never sends your financial data outside the device unless you enable AI and ask for a financial feature that needs it.

## 8.2 AI tools exposed

| Tool | Type | What it does | Confirmation |
| --- | --- | --- | --- |
| finance.getMonthSummary | read | Returns totals, categories, and comparisons for a month | No |
| finance.getBudgetStatus | read | Returns budget status and pace warnings | No |
| finance.searchTransactions | read | Searches transactions by text, category, amount range, or date | No |
| finance.addTransaction | write | Proposes one or more transactions from a natural language description | Yes, editable list |
| finance.suggestCategory | read | Suggests a category for an uncategorised transaction | Shown inline, user taps to apply |
| finance.createRule | write | Proposes a category rule from a pattern | Yes |
| finance.proposeBudget | write | Proposes monthly budgets from history and goals | Yes, user edits each line |
| finance.proposeSavingsPlan | write | Proposes a monthly contribution schedule for a savings goal | Yes |
| finance.explainChange | read | Explains why spending changed compared with a previous period | No |


## 8.3 AI features

Natural language entry: 'Paid 1,250 for groceries and 300 for a Udemy course on my card.' The AI proposes two transactions with categories, accounts, and dates. The Learning link is offered for the course.

Smart categorisation: uncategorised transactions get a suggested category based on payee and past behaviour. Confirmed suggestions become category rules after three consistent choices, always visible in the rules list.

Spending explanation: 'Food spending is up 22 percent this month. Most of the increase is delivery orders on weekends, which rose from 4 to 9 orders.' Explanations use real transaction counts and amounts.

Early budget warning: 'At your current pace you will spend 7,400 on Food this month against a budget of 6,000. Reducing weekend delivery by 3 orders brings you back within budget.'

Budget proposal: a starting budget based on the last three months, with the essentials and lifestyle split, shown line by line for editing.

Savings plan: a realistic monthly contribution for a goal, given the target date, the cash runway, and the budget. If the plan is not achievable without cutting a category, the AI says so and names the category.

Subscription review: a list of subscriptions with the monthly total and a question for each one, such as 'Used this in the last 60 days?' The answer is only saved if the user gives it.

Money and goals link: 'Your laptop savings goal is on track. Its date depends on keeping Shopping under 1,500 a month.' This connects finance to Goals and Habits without changing either automatically.

## 8.4 What the AI is given

Category totals and counts for the period being asked about, rather than every transaction, unless the user asks a question that needs individual transactions.

Payees and notes only for transactions involved in the request.

Budgets, savings goal targets, and dates. Account names are never sent. Balances are sent only when a cash runway or savings question needs them.

Nothing is sent when AI is off. The user can see exactly which data categories a request uses before it is sent.

# 9. How this module helps you most

You stop guessing: a two-minute daily habit gives an accurate monthly picture. Most people find their actual spending in one or two categories is far higher than expected, and the data makes that visible.

Early warnings: pace warnings catch an overspent category in the second week, when a change still matters.

Savings that actually happen: a savings goal with a required monthly amount and a projected date turns 'I want to save' into a concrete number you can check each month.

Learning and career spend in view: course and certification costs are linked to Learning, so you know the real cost of each skill and whether it was worth it.

Clear subscriptions: a total and a review question for each subscription usually reveals several forgotten ones.

Runway between jobs: cash runway tells you how long you can afford to be selective in a job search, which affects how calmly you negotiate.

Privacy by default: data stays on the device, and the AI sees summaries unless you ask for detail.

# 10. Screens

| Screen | Contents |
| --- | --- |
| Money home | Balance snapshot (hideable), this month's income, spending, and savings rate, budget status summary, quick add button |
| Quick add | Amount keypad, category grid with recent first, account selector, date, note, split option |
| Transactions | Searchable list grouped by day, filters by account, category, tags, and status, uncategorised queue |
| Transaction detail | All fields, splits, reimbursement status, audit history, linked recurring item |
| Accounts | Account list with balances, reconcile action, archive |
| Budgets | Monthly budget list with progress bars, pace warnings, templates, rollover settings |
| Savings | Goals with progress and projection, contribution history, emergency fund calculator |
| Recurring and subscriptions | Recurring list, pending confirmations, subscription totals, price changes |
| Reports | Monthly summary, trend charts, category breakdown, learning cost summary, cash runway, export |
| Import | File picker, column mapping, preview, duplicate review, uncategorised review, rules |
| Categories and rules | Category list with groups and icons, rule editor with priority order |
| Settings | Default currency, lock, amount hiding, rollover defaults, week start, data export |


# 11. Build components, in order

schema.ts: accounts, categories, transactions, transaction_splits, recurring_items, budgets, savings_goals, savings_contributions, category_rules, import_batches, finance_settings.

money.ts: integer arithmetic helpers, currency formatting, and validation. Every other file uses these helpers. Build and test first.

types.ts: Zod schemas for accounts, transactions, splits, budgets, goals, rules, and import rows.

service.ts: pure functions for balance calculation, transfer pairing, split validation, budget status and pace projection, savings projection, emergency fund calculation, runway, savings rate, and dedupe keys.

repository.ts: data access with the default category seeding on first launch.

Import pipeline: CSV parsing, column mapping, dedupe, rule application, and batch undo.

Recurring engine: creates pending transactions on due dates and records skips.

Event emitters and listeners, with budget threshold events guarded by processed_events.

screens: Money home, Quick add, Transactions, Transaction detail, Accounts, Budgets, Savings, Recurring, Reports, Import, Categories and rules, Settings.

Dashboard widgets: Money snapshot, Budget status, Savings goal progress, Pending recurring confirmations.

Lock and privacy layer: PIN or biometric gate for finance screens and amount hiding.

ai-tools.ts: the tools in section 8.2 with Zod schemas. Write tools never post transactions without confirmation.

index.ts: the module manifest.

# 12. Testing requirements

Money tests: all arithmetic in integer minor units; rounding never loses or creates a unit across splits; currencies with zero, two, and three decimal places format correctly.

Balance tests: pending transactions do not change balance; opening balance on a past date; reconciled adjustment creates the correct difference.

Transfer tests: transfers create two linked rows, are excluded from income and spending, and deleting one deletes its pair.

Split tests: sum mismatch is rejected; a split of one unit across three categories is handled exactly.

Budget tests: spending exactly at budget, at 80 percent, and one unit above; rollover on and off; pace projection on day 1 and day 31.

Savings tests: contribution reduces remaining amount; projection requires three months of data; goal reached event fires once; emergency fund calculation with fewer than three months.

Recurring tests: monthly on the 31st moves to the last day of shorter months; skip advances the date; price change is detected; no transaction posts without confirmation.

Import tests: dedupe on repeated import; a rule applies by priority; undo of a batch removes exactly its rows; malformed rows are reported, not silently dropped.

Timezone test: a transaction logged late at night in one timezone appears on the correct local date after the device timezone changes.

Privacy test: account names and balances never appear in AI requests unless the request type allows them; nothing is sent when AI is off.

Lock test: finance screens require unlock after the lock timeout; other modules remain available.

# 13. Definition of done (v1)

Accounts, transactions, transfers, splits, and reconciliation work with correct balances.

Quick add takes under ten seconds for a typical expense, measured on a test device.

Categories, recurring items with confirmation, and budgets with pace warnings work end to end.

Savings goals show required monthly amounts and projections, and link to Goals and Habits.

Monthly summary, trend charts, learning cost summary, cash runway, and export are accurate and tested against fixed sample data.

CSV import with dedupe, review queue, and category rules works, with batch undo.

The lock and amount-hiding features work.

The AI entry, categorisation, spending explanation, budget and savings proposals, and subscription review work, with confirmation on every write and no data sent when AI is off.

All tests in section 12 pass, and the module loads and unloads through the registry without breaking other modules.
