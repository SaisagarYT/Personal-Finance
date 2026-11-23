# Mobile UI/UX & Frontend Engineering Guidelines

> **IMPORTANT & NON-NEGOTIABLE:**
> All agents, developers, and contributors working on the `mobile` codebase must strictly adhere to these rules. No exceptions.

---

## 1. Strict Theme Consistency (Zero Unapproved Colors)
- **Use Theme Tokens Exclusively**: Every single visual property (background, text color, border color, icon tint, badge background) must pull directly from the active theme defined in `mobile/src/theme/colors.ts`.
- **Absolute Ban on Arbitrary Hex / RGBA Codes**:
  - Never write inline hex values (e.g. `#10B981`, `#000000`, `rgba(0,0,0,0.05)`) directly inside stylesheets or component props.
  - **Permission Gate**: Before adding **any** new color token to `colors.ts` or introducing any single hex/color code into a single line of code anywhere in the project, the agent **MUST explicitly ask the user for permission** first. Explain why existing palette tokens are insufficient and wait for user approval before touching code.

---

## 2. Reusability Over Reinvention (Smart Context-Aware Verification)
- **Do Not Recreate Existing Functions or Components**:
  - If a component, modal, sheet, badge, button, format helper, or API service already exists in the `mobile` directory, it must be imported and reused.
  - Never author a duplicate utility (e.g., date formatting, currency formatting, toast triggers, auth headers).
- **Smart Verification (Token & Performance Efficient)**:
  - Do **not** run expensive whole-codebase searches or multi-file scans on every simple turn.
  - Rely on your active conversation context, project knowledge, and established directories (`src/components/`, `src/services/`, `src/context/`, `src/theme/`).
  - **Rule of Thumb**:
    - If you are confident it already exists or doesn't, act cleanly.
    - If you have reasonable doubt whether a component or function already exists, do a quick targeted check before implementing.
    - Never blindly implement something without being sure.

---

## 3. Structural & Visual Consistency (No Random UI)
- **Design Language**:
  - Maintain consistent border radii (e.g. 12px for standard cards/inputs, 16px for prominent cards/sheets, 9999px for status pills/chips).
  - Standardize paddings and margins (multiples of 4/8: 8px, 12px, 16px, 20px, 24px).
  - Use clean hairline borders (`borderWidth: 1`, `borderColor: theme.borderSubtle` or `theme.borderMedium`) instead of heavy artificial drop shadows or high elevations.
- **Iconography**:
  - Do not use generic AI-style star/sparkle icons (`Sparkles`, glitter, magic stars).
  - For status indicators, system symbols, or brand badges, use the centralized `StatusSymbol` component (`mobile/src/components/StatusSymbol.tsx`) or clear functional Lucide icons.
- **Permission Gate for Component Structure**:
  - Do not invent arbitrary structural variations (e.g. different button styles, random segmented controls, mismatched card wrappers) without user agreement. Components must feel like part of the exact same unified product.

---

## 4. Visual Grounding via Screenshots
- **Analyze Real Visuals Before & After**:
  - Always review existing app screenshots (located in `actual_screens/`, uploaded user media, or captured via Chrome DevTools MCP) to understand how screens and components actually look and feel before writing code.
  - Do not make assumptions about visual balance, text hierarchy, or spacing. Verify the rendered output.
  - After completing major UI work, inspect the rendered component on the active preview (e.g., `http://localhost:8081` via Chrome DevTools MCP) to guarantee visual fidelity.

---

## 5. Professional Senior Engineering Standards (Continuous Refinement)
- **Never Settle for "Just Satisfied"**:
  - Do not assume that code is finished just because it compiles or renders.
  - Think like a senior staff software engineer:
    - **Accessibility & Contrast**: Verify text contrast against dark/light backgrounds (WCAG compliant).
    - **Performance & Cleanup**: Avoid redundant re-renders, clean up timers and listeners, avoid inline arrow functions in tight render loops where inappropriate.
    - **Error Handling**: Gracefully handle empty states, loading skeletons, network errors, and offline fallbacks.
    - **Defensive Typing**: Strictly type component props, service responses, and hook states. No lazy `any`.

---

## 6. Never Blindly Code: Ask for User References for New/Unique Screens
- **Mandatory Alignment Before Execution**:
  - If a task involves creating a new screen, a distinct user flow, or a unique/complex component, **never blindly guess or invent the UI**.
  - **Inquire First**: Ask the user what layout, hierarchy, and features they envision.
  - **Request References**: Encourage or ask the user to provide reference images, mockups, or inspiration.
  - Once aligned, build strictly according to the reference and existing project patterns.
