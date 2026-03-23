# FinMentor India — AI-Powered Personal Finance Mentor

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- **Money Health Score**: 5-minute onboarding quiz across 6 dimensions (emergency fund, insurance, investments, debt, tax efficiency, retirement). Outputs a 0–100 score per dimension and overall, with actionable suggestions.
- **FIRE Path Planner**: User inputs age, income, monthly expenses, existing investments, and target retirement age. App calculates required corpus, monthly SIP needed, asset allocation roadmap, and projected milestones year-by-year.
- **Tax Wizard**: User inputs salary components (basic, HRA, LTA, special allowance, other). App calculates tax under old vs. new regime, shows which is better, and lists missing deductions (80C, 80D, NPS, HRA, LTA) with estimated savings.
- **Life Event Advisor**: User selects a life event (bonus, marriage, new baby, inheritance, home purchase). App asks contextual questions and generates a prioritized financial action plan.
- **Dashboard**: Landing page showing all 4 tools, user's last Money Health Score if available, and quick-access cards.

### Modify
- None (new project)

### Remove
- None

## Implementation Plan
1. Backend: Store user financial profiles, Money Health Score results, FIRE calculations, and life event plans in Motoko stable storage.
2. Backend: Expose query and update methods for each feature module.
3. Frontend: Multi-tab/module layout with Dashboard, Money Health Score wizard, FIRE Planner, Tax Wizard, Life Event Advisor.
4. Frontend: All calculations done client-side with rule-based logic; results persisted via backend.
5. All monetary values in INR (₹). Indian tax slabs and financial norms applied.
