# Sinance Visual Design & Screen References Catalog

This repository maintains the permanent visual source of truth, screen captures, component crops, and UI specifications for both **Mobile** and **Web** platforms.

---

## Directory Hierarchy & Screen Breakdown

```
references/
├── mobile/
│   ├── 00_master_source/       # High-res dual-screen master mockups
│   │   ├── sinance_master_reference.jpg
│   │   ├── left_phone_full.png
│   │   └── home_screen_precise.png
│   ├── 01_homescreen/          # HomeScreen full view & section crops
│   │   ├── full_screen.png
│   │   ├── high_contrast_home_verified.png
│   │   ├── new_theme_home_verified.png
│   │   ├── sinance_home_cropped.png
│   │   ├── hero_card.png
│   │   ├── activity_section.png
│   │   ├── brain_card.png
│   │   ├── weekly_activity_card.png
│   │   ├── saving_rules_section.png
│   │   ├── rule_automatic.png
│   │   └── rule_challenge.png
│   ├── 02_pocket/              # Pocket Detail screen & action crops
│   │   ├── full_screen.png
│   │   ├── cloud_synced_pocket_verified.png
│   │   ├── sinance_pocket_reference.png
│   │   ├── pocket_hero_card.png
│   │   ├── quick_transfers_banner.png
│   │   └── transaction_ledger.png
│   ├── 03_stats/               # Sovereign Stats analytics screen
│   │   ├── stats_reference.png
│   │   ├── stats_screen_verified.png
│   │   ├── high_contrast_stats_verified.png
│   │   ├── new_theme_stats_verified.png
│   │   └── thumb_stats_reference.png
│   ├── 04_cards/               # Cards deck & wallet management
│   │   └── cards_reference.png
│   └── 05_profile/             # Profile, identity & settings sheets
│       ├── profile_reference.png
│       ├── profile_nova_reference.png
│       └── profile_spec_4.png
└── web/
    ├── 01_dashboard/           # Executive desktop dashboard (Overview tab)
    │   └── dashboard_screen.png
    ├── 02_analytics/           # Full-width financial charts & projections
    │   └── analytics_chart_view.png
    ├── 03_transactions/        # Comprehensive ledger, filters & CSV export (Activity tab)
    │   └── activity_table_view.png
    ├── 04_accounts_wallets/    # Multi-account balances & bank reconcile (Account tab)
    │   └── accounts_settings_view.png
    ├── 05_auth/                # Fullscreen desktop authentication portal
    │   └── auth_view.png
    └── 05_settings/            # User profile, cloud sync & security
        └── settings_view.png
```

---

## Screen Mapping & Specifications

### Mobile Screens
| Branch | Screen / Section | Component File | Key UI Spec |
| :--- | :--- | :--- | :--- |
| `01_homescreen` | Hero Card | [`SinanceHeroCard.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceHeroCard.tsx) | `#23F07D` vibrant green, 36px bottom radius, avatar greeting, onboarding banner with slide pill. |
| `01_homescreen` | Activity & Brain Cards | [`SinanceActivitySection.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceActivitySection.tsx) | Interactive Brain card (turns `#FFFFFF` on touch), 7-day bar chart with Thursday peak in green. |
| `01_homescreen` | Savings Rules | [`SinanceSavingsRulesSection.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceSavingsRulesSection.tsx) | Automatic Rule card (`$150.87`) + 1P Challenge card (`$667/yr`). |
| `02_pocket` | Pocket Detail Screen | [`SinancePocketScreen.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/SinancePocketScreen.tsx) | Dual buttons (Deposit/Withdraw), Quick Transfers banner, April transaction ledger. |
| `03_stats` | Analytics & Categories | [`StatsView.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/StatsView.tsx) | Sovereign vertical capsule bars, dashed guideline, category chips, weekly spend trends. |
| `04_cards` | Card Stack & Wallet | [`CardStack.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/CardStack.tsx) | Stacked cards with spring elastic recoil, Add Card action, and multi-currency toggle. |
| `05_profile` | Profile & Auth | [`AuthScreen.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/AuthScreen.tsx) / [`ProfileModal.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/ProfileModal.tsx) | Supabase auth integration, user profile sheet, cloud sync status. |

### Web Screens
| Branch | Screen / Section | Component / View | Key UI Spec |
| :--- | :--- | :--- | :--- |
| `01_dashboard` | Executive Overview | `frontend/src/App.tsx` | Total Balance card (7/12) + 2x2 Metric Cards (5/12), Recent Activities table, Spending Limit card. |
| `02_analytics` | Cash Flow & Analytics | `IncomeChartWithLimitCard.tsx` | Recharts 6-month Profit & Loss bars, monthly spending limits, pace indicators. |
| `03_transactions` | Full Activity Ledger | `ActivityView.tsx` | Search, category filters, type filters (income/expense), pagination, and CSV export. |
| `04_accounts_wallets` | Accounts & Wallets | `AccountSettingsView.tsx` | Bank accounts list, currency selectors (INR/USD/EUR/GBP), reconcile balances. |
| `05_auth` | Authentication Portal | `AuthView.tsx` | Split hero brand showcase + sign-in/sign-up forms with Supabase auth. |
