# Sinance UI Design & Screen References Catalog

This directory maintains the visual source of truth, screen captures, component crops, and UI specifications for **Mobile** and **Web** platforms.

---

## Directory Structure

```
references/
├── mobile/
│   ├── 00_master_source/       # High-res dual-screen master mockups
│   │   └── sinance_master_reference.jpg
│   ├── 01_homescreen/          # HomeScreen full view & section crops
│   │   ├── full_screen.png
│   │   ├── hero_card.png
│   │   ├── activity_section.png
│   │   ├── brain_card.png
│   │   ├── weekly_activity_card.png
│   │   ├── saving_rules_section.png
│   │   ├── rule_automatic.png
│   │   └── rule_challenge.png
│   ├── 02_pocket/              # Pocket Detail screen & action crops
│   │   ├── full_screen.png
│   │   ├── pocket_hero_card.png
│   │   ├── quick_transfers_banner.png
│   │   └── transaction_ledger.png
│   ├── 03_stats/               # Sovereign Stats analytics screen
│   │   ├── stats_reference.png
│   │   ├── thumb_stats_reference.png
│   │   └── stats_screen_verified.png
│   ├── 04_cards/               # Cards deck & wallet management
│   │   └── cards_reference.png
│   └── 05_profile/             # Profile, identity & settings sheets
│       ├── profile_reference.png
│       ├── profile_nova_reference.png
│       └── profile_spec_4.png
└── web/
    ├── 01_dashboard/           # Executive desktop dashboard
    ├── 02_analytics/           # Full-width financial charts & projections
    ├── 03_transactions/        # Comprehensive ledger, filters & CSV export
    ├── 04_accounts_wallets/    # Multi-account balances & bank reconcile
    └── 05_settings/            # User profile, cloud sync & AI preferences
```

---

## Mobile Screen Mapping & Specifications

| Branch | Screen / Section | Component File | Key UI Spec |
| :--- | :--- | :--- | :--- |
| `01_homescreen` | Hero Card | [`SinanceHeroCard.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceHeroCard.tsx) | `#23F07D` vibrant green, 36px bottom radius, avatar greeting, onboarding banner with slide pill. |
| `01_homescreen` | Activity & Brain Cards | [`SinanceActivitySection.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceActivitySection.tsx) | Interactive Brain card (turns `#FFFFFF` on touch), 7-day bar chart with Thursday peak in green. |
| `01_homescreen` | Savings Rules | [`SinanceSavingsRulesSection.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/SinanceSavingsRulesSection.tsx) | Automatic Rule card (`$150.87`) + 1P Challenge card (`$667/yr`). |
| `02_pocket` | Pocket Detail Screen | [`SinancePocketScreen.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/SinancePocketScreen.tsx) | Dual buttons (Deposit/Withdraw), Quick Transfers banner, April transaction ledger. |
| `03_stats` | Analytics & Categories | [`StatsView.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/StatsView.tsx) | Sovereign vertical capsule bars, dashed guideline, category chips, weekly spend trends. |
| `04_cards` | Card Stack & Wallet | [`CardStack.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/CardStack.tsx) | Stacked cards with spring elastic recoil, Add Card action, and multi-currency toggle. |
| `05_profile` | Profile & Auth | [`AuthScreen.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/screens/AuthScreen.tsx) / [`ProfileModal.tsx`](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/src/components/ProfileModal.tsx) | Supabase auth integration, user profile sheet, cloud sync status. |

---

## Design System Foundations

- **Brand Primary**: `#23F07D` (Vibrant Neon Emerald Green)
- **Backgrounds**: `#000000` (OLED Pure Black Canvas), `#161616` (Deep Matte Charcoal Surface)
- **Borders & Dividers**: `#242426` / `#27272A`
- **Typography Colors**:
  - Pure White `#FFFFFF` (Headings, primary amounts)
  - Muted Zinc `#A1A1AA` / `#71717A` (Captions, dates, secondary labels)
  - Forest Ink `#07170D` (Text and icons placed over vibrant green cards)
- **Corner Radii**:
  - Large Hero Cards: `36px`
  - Container Cards: `22px` - `24px`
  - Interactive Action Capsules / Buttons: `26px` - `28px`
