# Sinance Actual Implemented Screens (Live App Screenshots)

This folder contains **ONLY screenshots taken directly from our running, implemented applications** (both Mobile and Web).

---

## Directory Structure

```
actual_screens/
├── mobile/                                   # Real screenshots of mobile app (390x844)
│   ├── 01_homescreen/
│   │   └── homescreen.png                    # Live HomeScreen (Hero Card, Activity & Brain Cards, Savings Rules)
│   ├── 02_pocket/
│   │   └── pocket_screen.png                 # Live Pocket screen (Deposit/Withdraw, Quick Transfers, April Ledger)
│   ├── 03_stats/
│   │   └── stats_screen.png                  # Live Stats view (Capsule charts, Category pills, Trend metrics)
│   ├── 04_profile/
│   │   └── profile_screen.png                # Live Profile modal (Identity, Cloud Sync, Currency switch)
│   ├── 05_auth/
│   │   └── auth_screen.png                   # Live Auth screen (Supabase sign in & sign up)
│   └── 06_task_manager/
│       ├── 01_section1_dark.png              # Header & Calendar Week Strip (Dark mode)
│       ├── 01_section1_light.png             # Header & Calendar Week Strip (Light mode)
│       ├── 02_section2_dark.png              # Pinned Projects 2x2 Grid (Dark mode)
│       ├── 02_section2_light.png             # Pinned Projects 2x2 Grid (Light mode)
│       ├── 03_section3_dark.png              # Task List & Today Dropdown (Dark mode)
│       ├── 03_section3_light.png             # Task List & Today Dropdown (Light mode)
│       ├── 04_section4_detail_dark.png       # Project Detail Screen & Tasks Checklist (Dark mode)
│       └── 04_section4_detail_light.png      # Project Detail Screen & Tasks Checklist (Light mode)
└── web/                                      # Real screenshots of web desktop app (1440x900)
    ├── 01_dashboard/
    │   └── dashboard_screen.png              # Live Executive Overview dashboard
    ├── 02_analytics/
    │   └── analytics_chart_view.png          # Live Recharts Profit & Loss and Spending Limits
    ├── 03_transactions/
    │   └── activity_table_view.png           # Live Transactions ledger with filters & pagination
    ├── 04_accounts_wallets/
    │   └── accounts_settings_view.png        # Live Multi-account wallet balances & reconcile
    └── 05_auth/
        └── auth_view.png                     # Live Fullscreen authentication portal
```

---

## Regeneration Script
Whenever you modify frontend code and want to re-capture all actual screens:
- **Mobile**: `npm run export` in `mobile/` and capture via headless Chrome at `390x844`.
- **Web**: `npm run build` in `frontend/` and capture via headless Chrome at `1440x900`.
