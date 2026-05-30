# Mortgage Tracker — Design Document

**Date:** 2026-05-30  
**Status:** Approved  

---

## Problem

Track monthly mortgage payments for a family-shared home loan. Need to know:
1. Whether each of the **4 regular members** (angah, daddy, sha, kaklong) has paid their **RM638/month** share
2. Whether **mama** has chipped in any **extra amount** that month
3. Whether the month's payment (including extras) has been **paid to the bank**
4. Track **extra payments** (amounts > RM2,552/month) that accelerate principal reduction

### Loan Details

| Field | Value |
|---|---|
| Monthly payment | RM2,552.00 |
| Members | mama, angah, daddy, sha, kaklong |
| Regular members (RM2,552 ÷ 4) | angah, daddy, sha, kaklong → RM638/mo each |
| Mama | Occasional extra contributor (amount varies) |
| Jumlah diluluskan | RM596,558.00 |
| Interest rate | 3.8% p.a. |
| Current outstanding | RM566,717.61 |

---

## Findings by Branch

### Data Model

**Decision: Two MongoDB collections**

**`mortgage_months`** — one document per calendar month

```typescript
interface MortgageMonth {
  _id: string;
  year: number;           // e.g. 2026
  month: number;          // 1-12
  monthlyAmount: number;  // 2552
  isPaidToBank: boolean;  // whether this month was remitted to the bank
  paidDate: string | null; // ISO date when paid to bank
  totalCollected: number; // sum of all member contributions for this month
  extraAmount: number;    // totalCollected - 2552 (if > 0)
  createdAt?: string;
  updatedAt?: string;
}
```

**`mortgage_contributions`** — one document per member per month

```typescript
interface MemberContribution {
  _id: string;
  memberName: string;     // mama | angah | daddy | sha | kaklong
  month: number;          // 1-12
  year: number;           // e.g. 2026
  amountPaid: number;     // how much this member paid
  paidAt: string | null;  // ISO date when they paid
  createdAt?: string;
  updatedAt?: string;
}
```

**Why two collections:**
- Clean separation: bank-facing lifecycle vs. member tracking
- Easy to query "who paid for May 2026" (query contributions by year+month)
- Easy to query "is May 2026 paid to bank" (single doc lookup)
- Document size stays small — 360 months × 5 members = 1,800 contribution docs

### Business Logic

**The 4 regular members (angah, daddy, sha, kaklong):**
- Each pays RM638/month (RM2,552 ÷ 4)
- "Pay full share" button available — one click sets `amountPaid: 638`
- Can still manually adjust amount if someone pays more/less

**Mama:**
- No fixed share — she chips in extra amounts voluntarily
- Manual amount input (no "full share" button)

**Month-level:**
- **Cannot** mark "paid to bank" until total collected ≥ RM2,552
- **Extra payment** = totalCollected − RM2,552 (tracked for interest-saving visibility)
- `mortgage_months.isPaidToBank` is toggled manually when the user confirms the bank received the money

**Future KIV:**
- Auto-calculate outstanding balance via amortization
- Interest-saved projection from extra payments
- Estimated payoff date

### UI / Layout

**Three-panel split (responsive):**

1. **Loan Summary** (top strip)
   - 4 stat cards: Monthly Target (RM2,552), Total Loan (RM596,558), Outstanding (RM566,717.61), Interest Rate (3.8%)
   - **Extra Payments Summary**: total extra paid across all months, shown as a highlighted stat

2. **Payment Timeline** (middle section)
   - Month-by-month grid/table
   - Columns: Month | Member 1-4 (paid/unpaid) | Mama (amount) | Total Collected | Status (paid to bank ✓)
   - Rows sorted newest-first
   - Click/tap a row → shows member details for that month

3. **Member Contribution Detail** (bottom section)
   - Shows the 5 members for the selected month
   - Each member shows: name, amount paid, status badge (paid/unpaid)
   - Actions: "Pay RM638" button (for regular 4), amount input (for mama), edit/delete

**Mobile:** Panels stack vertically. Timeline becomes a card-per-month layout.

### Integration

| Integration | Action |
|---|---|
| **Route** | `app/mortgage/page.tsx` (top-level, like `/salary`) |
| **Sidebar** | Add navItem to `components/sidebar.tsx`: `{ href: "/mortgage", label: "Mortgage", icon: Home }` |
| **Server actions** | `app/mortgage/actions.ts` (dedicated file, following separation pattern) |
| **Types** | `types/mortgage.ts` — `MortgageMonth`, `MemberContribution` interfaces |
| **Middleware** | Add `"/mortgage/:path*"` to `middleware.ts` config.matcher |
| **Revalidation** | `revalidatePath("/mortgage")` after all mutations |
| **Collections** | `mortgage_months`, `mortgage_contributions` in the existing `kaklong-debt` database |
| **MongoDB** | Reuse existing `lib/mongodb.ts` client singleton |

### File Structure

```
app/
  mortgage/
    page.tsx              — async server component (main page)
    mortgage-form.tsx     — client component (add monthly record)
    mortgage-table.tsx    — client component (timeline + member grid)
    actions.ts            — server actions
types/
  mortgage.ts             — MortgageMonth, MemberContribution interfaces
```

---

## Recommendation

**Build in this order:**

1. **Types file** (`types/mortgage.ts`) — define `MortgageMonth`, `MemberContribution`
2. **Server actions** (`app/mortgage/actions.ts`) — `getMortgageMonths()`, `getMonthContributions(year, month)`, `addContribution()`, `togglePaidToBank()`, `deleteContribution()`
3. **Page** (`app/mortgage/page.tsx`) — async server component fetching data, rendering cards + child components
4. **Mortgage table** (`app/mortgage/mortgage-table.tsx`) — client component with the timeline grid, member detail panel
5. **Form** (`app/mortgage/mortgage-form.tsx`) — client component for adding/editing contributions (reuse Dialog pattern)
6. **Sidebar** — add nav item
7. **Middleware** — protect route
8. **Seed data** — optionally add starting balance / past months

### Key UX Flows

**Recording a regular member's payment:**
1. Open the mortgage page → see timeline with current month highlighted
2. Click the current month row → member detail panel opens
3. Click "Pay RM638" next to e.g. "Angah" → contribution saved instantly
4. Card updates: total collected increases, month status may change

**Recording mama's extra:**
1. Same flow, but type amount in mama's input field and click "Add"
2. Extra payment is tracked as any amount contributed by mama

**Marking month as paid to bank:**
1. Once total collected ≥ RM2,552, a "Mark as Paid to Bank" button appears
2. Click it → sets `isPaidToBank: true` with current date

### Quick View: Extra Payments

A dedicated stat card shows **"Total Extra Paid: RM X,XXX"** — the sum of `extraAmount` across all paid months. This gives visibility into how much extra is going toward principal.
