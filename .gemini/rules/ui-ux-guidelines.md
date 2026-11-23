# UI/UX & Frontend Engineering Rules

Whenever working on any prompt, component, screen, or file within the `mobile/` directory:

1. **Obey `mobile/UI_UX_GUIDELINES.md`**: All instructions and constraints defined in [UI_UX_GUIDELINES.md](file:///c:/Users/saisa/Documents/Work/Projects/College/PersonalFinance/mobile/UI_UX_GUIDELINES.md) are strictly mandatory.
2. **Strict Color Theme**: Never add a new color token to `colors.ts` or write inline hex/rgba color codes without asking and obtaining the user's permission first.
3. **Reusability Check**: Reuse existing components, modals, formatters, and services across `mobile/`. Do not duplicate code. Smartly check existing files when in doubt; do not waste unnecessary tokens if already confident from context.
4. **Structural Consistency**: Use standardized border radii, spacing multiples (4/8), hairline borders, and the centralized `StatusSymbol` (no AI star/sparkle icons).
5. **Analyze Screenshots**: Inspect existing screenshots (`actual_screens/` or via Chrome DevTools MCP) to understand true visual aesthetics before designing or editing UI.
6. **Senior Engineering Standards**: Critique code for WCAG contrast, edge cases, error states, and high performance.
7. **Ask for References on New Screens**: Never blindly invent new screens or unique complex UI from scratch. Ask the user what they want and request reference images before implementing.
