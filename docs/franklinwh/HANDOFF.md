# FranklinWH landing pages: build handoff

Task `6175fe7a-5e4e-4c78-82bf-eb0528afedab`, customer `8bbf1dbc-49fb-44b5-8c82-e1235149e809`.

## Routes

| Route | Phone (display / href) | Office mention |
| --- | --- | --- |
| `/franklinwh` (Page A) | (906) 235-0340 / `tel:+19062350340` | Marquette office |
| `/franklinwh-lower-peninsula` (Page B) | (231) 590-7305 / `tel:+12315907305` | Traverse City office |
| `/privacy` | none (shared policy) | none |

Both campaign routes render the same `FranklinPage` component and differ only in the `RouteVariant` in
`src/franklinwh/config.ts`. The protected root `/` was moved byte-for-byte into `src/app/(legacy)/`
(page, layout and globals.css are the only relocations) so the new route group has its own root layout,
CSS, font and tracking and nothing leaks into `/`.

## Structure

- `src/app/(franklinwh)/layout.tsx`: independent root layout with Inter, the MegaTag bootstrap
  (`siteKey` `sk_moeyep8q_kj6i28c0wm`, `gtmId` `GTM-WLQXZ22P`, the optimizer and tracking endpoints),
  `id="optimizer-script"` with `data-site-id`, and the universal CTM script `afterInteractive`.
- `src/franklinwh/fields.ts` is byte-identical to lp-starter `src/lib/fields.ts` at
  `e8e8d9b5c8cd4be6d65818a914c33edecdbeed69` (SHA-256
  `d25400ba6ee08423f81f50a3dda98d6bd8d110952edfd99f0618799aeeedfe89`; a test enforces it).
  `src/franklinwh/attribution.ts` is lp-starter's `src/lib/attribution.ts` at the same commit, unchanged.
- `leadFields.ts`: the six keys `{name, phone, email, utility, offGrid, message}`. Only name and phone are
  required, `offGrid` is a boolean that defaults to false, and message is capped at 1,000 characters
  (not 200). Wrongly typed programmatic input fails closed.
- `leadPayload.ts` classifies every response into exactly one of three outcomes:
  - **Accepted**: HTTP 2xx AND a parsed body with `ok === true`. Nothing else is success.
  - **Rejected** (`LeadRejectedError`): a non-2xx response, or a body with a literal `ok: false`.
    The API definitely did not take the lead.
  - **Unknown** (`LeadOutcomeUnknownError`): the fetch rejected or the response was lost, the body is
    invalid JSON or `null`, or a 2xx body never says `ok: true` or `ok: false` (missing, `"true"`, `1`,
    204). The lead may have been saved.
  `sendLeadValues` validates first; a `LeadValidationError` means nothing was sent.
- `submission.ts` (`createLeadController`, `runSubmission`, `gateSend`, `isSendLocked`) +
  `components/useLeadSubmission.ts`: one controller and one synchronous lock for both forms, taken
  before any state update, so a double click or the sibling form in the same tick never sends twice.
  - Accepted: success panel in both cards, conversion events once, lock kept for the page view. A
    throwing tracker or accepted-callback cannot undo success or release the lock.
  - Rejected or invalid input: the existing retry alert (`FormErrorAlert`, route phone, draft kept),
    lock released, one deliberate retry can succeed.
  - Unknown: no success and no conversion events. The lock is kept and both forms stay visible
    with the draft, but their fields are disabled and the submit buttons read "Request paused".
    `FormUnknownAlert` sits at the top of each form (`role="alert"` only in the sending form). It says
    delivery could not be confirmed, that the form is paused to avoid sending it twice, and offers
    the route phone. It never says the lead was not sent and never invites a resend. The floating
    quote button stops appearing. Click, Enter, the sibling form and the native
    submit backstop all go through `gateSend`, and the controller lock refuses even a stale handler.
  - **Boundary, stated honestly:** the unknown lock lives in memory for this page view only. No
    storage, hidden field, idempotency header or extra endpoint is used. A reload starts a fresh page
    view with an empty form. A reload does not prove the earlier request failed or was reconciled.
    The alert therefore steers the visitor to the phone.
- `conversionEvents.ts`: after confirmed success only, one
  `MegaTag.trackEvent('form_submit', { elementId: <form id>, formData: <all six keys> })` and one
  `dataLayer.push({ event: 'form_submission', form_id, form_provider: 'peninsula-solar-lp' })`.
  A tracker error cannot undo or unlock a confirmed lead.
- Forms: `noValidate`, visible associated labels, `type="button"` validate-first direct send, Enter
  stopped at keydown (textarea, select, button, link and IME keep their native meaning), onSubmit is
  only a backstop. Error messages are linked with `aria-describedby`/`aria-invalid`, and the first
  invalid field gets focus. A failed send shows `role="alert"` with the route phone and keeps the draft.
  Form ids are `hero-lead-form` and `final-lead-form`; the card anchors are `#hero-form` and `#form`.

## Round 2 corrections (native post-deploy findings)

- **Header (320/360/390):** `hidden` lost to the `inline-flex` that `buttonClass` always emitted, so the
  "hidden" header quote link painted and squeezed the logo. `buttonClass` now takes
  `{ surface, size, extra }`; display, gap, padding and type size live only in BASE or SIZES, and a test
  rejects any rendered or source class list with two unprefixed utilities for one property. The header
  quote link sits in a `hidden lg:block` wrapper. Every mark is `shrink-0 w-auto` with a fixed height
  (installer mark 22px tall below 640px). Budget at 320 (clientWidth 305, column 265): installer mark
  185px + 16px gap + 48px phone = 249px. The header quote appears at lg, not md: at 768 with a scrollbar
  (column 713px), both marks + phone + quote need ~718px. The hero quote action is on the first screen
  below lg.
- **CTA pairs:** one row at every width (`flex-nowrap`, 8px gap), quote `flex-1`, phone at content width.
  Below 640px the anchor reads `Free quote` and the phone shows its icon + full number (accessible name
  `Call (906) 235-0340` / `Call (231) 590-7305`), at 14px semibold with 48px height. From 640px the full
  labels and sizes return. Budget at 320 from Inter's advance widths: 92.9 + 8 + 156.5 = 257px of 265px
  (the same 257px at 360, of 305). The form submit label is unchanged. The floating CTA stays form-only. This
  supersedes the round-1 design-review suggestion to make pair buttons full width.
- **Product family at 1024:** model rows stack (name over role) from lg and pair again from xl; the
  column gap is 40px until xl. Simulated with Inter metrics (the model reproduces the controller's
  125px within 2px): 1024 -> ~103px, worst case across 1024-1279 is 103px, and 1440/1728 stay ~35px.
- **Form pairs:** each field shell spans two rows of the form grid (`grid-rows-subgrid`), so paired
  fields share a label row and a control row. Labels sit on their inputs (`self-end`), and inputs align even when
  `Utility Company (optional)` wraps. Keys, validators, order, `fields.ts` and `attribution.ts` unchanged.
- **Image density:** each srcset now starts at a file holding 2x the image's largest desktop slot (hero
  1300/1800, aGate 1200, aPower 2 + aGate 1300). `sizes` still states the true slot. The three 1x files the
  browser picked at DPR 1 (`apower-s-installation-800`, `agate-700`, `apower-2-and-agate-800`) are no longer
  referenced and were removed. `image-ledger.json` separates planned calculations (`planned_r2`) from
  the controller's round-1 receipts and lists known gaps (3x desktop; 641-1023px tablets at DPR 1).
- **Copy:** removed "From reviews our customers left on Google." and the footer marketing sentence.
  The footer keeps the installer mark, the route office phone, the privacy link and the copyright.
- **Provenance:** root `task-spec.json` (scope limited to the two routes and `/privacy`, with the legacy
  preservation boundary) and `content-sources.json` (a source for every claim, testimonial and FAQ, plus
  the installer differentiator). `tests/franklinwh/provenance.test.ts` keeps them in sync with the code.

## Source preservation (round 2)

All 47 entries of `task-evidence/6175fe7a-peninsula-intake/legacy-source-before-sha256.json` re-hashed
from this branch: 47/47 identical, with only the three approved moves (`src/app/{page.tsx,layout.tsx,
globals.css}` -> `src/app/(legacy)/`), and the old paths absent. `package.json` and `package-lock.json`
are byte-identical to `origin/main`. Round 2 touches only `src/franklinwh/**`, `tests/franklinwh/**`,
`docs/franklinwh/**`, three removed files under `public/franklinwh/`, and the two new root JSON files.

## Tests

```bash
node --import ./tests/franklinwh/register.mjs --test "tests/franklinwh/*.test.ts"
```

`package.json` is unchanged (it is in the protected manifest), so the command above is the entry point.
The loader compiles TS/TSX with the SWC that ships inside Next, so no dependency was added. All lead
and event transports are intercepted; no live lead or conversion request is ever made.

## Selling points (LP visitor copy rule 5)

1. **Everything in-house with licensed electricians, never subcontracted.** Source:
   https://peninsula-solar.com/company/ ("executed in-house by our trained and licensed team") and the
   homepage ("designed and installed by our own certified team — not subcontracted out"). Used in: hero
   subheadline, in-house process section.
2. **FranklinWH certified installer in Michigan.** Source: https://peninsula-solar.com/franklinwh/
   ("We are a proud FRANKLINWH certified installer in Michigan"). Used in: hero trust line (text only,
   no badge or mark).
3. **After-sales support.** Source: https://peninsula-solar.com/ (Google review by Keith: "after sales
   support is second to none"). Used in: customer proof section.

## FAQ sources

- FAQ: "What will my project proposal include?" from https://peninsula-solar.com/our-process/
- FAQ: "Which checks happen before activation?" from https://peninsula-solar.com/our-process/
- FAQ: "What does LFP mean?" from https://peninsula-solar.com/ and
  https://www.franklinwh.com/support/overview/components-of-franklin-home-power/

## Names, places and policy

- Name/address: none differ. "Peninsula Solar", "Marquette" and "Traverse City" match the live site.
  No street address is shown on either page.
- Privacy: no customer policy found (the parent confirmed `/privacy-policy` and `/privacy` returned 404),
  so I wrote one at `/privacy`. It lists exactly the six form fields and has no SMS section. Please have
  the customer review it. It is linked under both submit buttons and in the footer.

## Known lint results (baseline vs new)

This is not a repo-wide lint pass. Protected root debt remains and is reported, not fixed.

- Round 2, same unchanged script: the full-repo output is identical to the controller's round-1 log
  (12 errors, 3 warnings). The new-route projection again shows only the 2 errors and 2 warnings below.
  Scoped ESLint (eslint-config-next core-web-vitals + typescript, run from a temporary config outside
  the repo because the protected root has no flat config) is clean on `src/franklinwh`,
  `src/app/(franklinwh)` and `tests/franklinwh`.
- Baseline (`task-evidence/.../legacy-lint-before.log`): 17 errors, 5 warnings, all in the protected root.
- Full repo after round 1: 12 errors, 3 warnings (the 2 new-route warnings are the projection's FAVICON/OffGrid notes below). Every remaining form, phone and required-field error is the
  same protected `src/app/(legacy)/page.tsx` debt as before. The relocation removes the lint's view of
  `src/app/layout.tsx`, so `MEGATAG: Cannot read layout.tsx` replaces the two baseline MegaTag errors.
  The floating-CTA, section-CTA and duplicate-image errors disappear only because the lint reads fixed
  root paths, not because the root changed.
- New-route projection (the franklinwh layout and page copied to the root paths in a scratch copy):
  2 errors and 2 warnings, all expected. The warnings are the missing root apple-icon (route-local
  instead) and a heuristic "dark background" note on the checkbox, which has no placeholder. The errors: (1) No `src/app/icon.png`: a root icon would change the protected `/`, so
  the favicon is route-local via metadata (`/franklinwh/favicon.png`). (2) "Inter is the only font":
  FranklinWH's brand manual (p.16) mandates Inter.
- The brand `color_roles` set text `#000000` and background `#FFFFFF` (FranklinWH primary palette), which
  overrides the workspace "no pure black/white" default. Softer surfaces (`#F5F7F5`, `#FAF6EF`, charcoal
  and navy bands) carry the off-white rhythm instead.
- The design tokens' disabled state (`#58595B` on `#CCCCCC`) is 4.37:1. The pending button shows text,
  so it uses `#000000` on `#CCCCCC` to meet 4.5:1.

## Deferred to the parent (no local browser in this session)

Round 2: no browser, headless or otherwise, was launched, and no server was started. Every 320-1728
geometry statement above is a source contract or a font-metric calculation, not a native measurement.
The header and pair fit, product-family gaps, form row alignment, unknown/rejected alert rendering and
delivered image bytes all remain for the controller's deployed browser on both routes.

Visual gate DEFERRED to post-deploy (no local browser). Not run here, and not claimed:
`browser-wide-screen-gaps.js` (1024/1440/1728), `browser-line-breaks.js` and
`browser-hero-and-photos.js` (390/1024/1440/1728), `browser-copy-repetition.js`,
`browser-ccp-donts.js`, `browser-cta-targets.js`, 320/360 overflow and paired-action checks, the
failed-response alert, floating CTA overlap and availability, forward anchor arrival, and decoded
delivered pixels for every image (`docs/franklinwh/image-ledger.json`: round 1's planned ledger passed
while the served bytes failed at DPR 1, so the ledger now labels plans and receipts separately).

## CCP note for the parent

The universal CTM script stays installed per the controller contract. CCP `creative.doNotUse` says
"Google call forwarding numbers replacing on-site phone numbers". The page source authors only the two
real route numbers. Whether runtime DNI swaps them is controller/Instrumentation-owned, so this is
flagged here rather than posted on the task (the contract bars this session from task comments).

## Review verdicts

### Round 2

- simplify (4 parallel reviewers). Applied: one shared `ALERT_CLASS`; a `bodyOk` helper behind both
  body predicates; error classes set `name` once in the base; shared `readSource`/`classes` test helpers;
  one page render per contract test; the controller test harness split under 30 lines; the 2x-floor
  density test now covers all six photos. Skipped:
  - `<picture>`/media-specific delivery to keep 800px hero bytes on phones. Phones at DPR <= 2 now get the
    1300px hero (174 KB instead of 74 KB). The controller asked for a simple min-delivery policy, and a
    `<picture>` wrapper changes flex layout that could not be verified here.
  - Inflated `sizes`: forbidden.
  - Container queries for product family: a 448px list breakpoint would also stack the rows at 1440.
  - Inlining `gateSend`: the tests drive the real click/Enter path through it.
- code-review: `VERDICT: PASS` (136/136 tests, tsc clean, `fields.ts`/`attribution.ts` identical, only
  allowed paths touched). Applied its low finding: the product image's `sizes` now states the true
  639px slot at 1200-1279px (40px gap), and the ledger and test use that slot.
- design-review: `VERDICT: DEFERRED (visual gate deferred to post-deploy, no local browser)`. Applied:
  "Request paused" on disabled submits; the unknown alert at the top of both forms; shorter alert copy;
  the floating CTA hidden after an unknown outcome; the pair phone kept at 8px padding until 640px so the
  orange quote is at least as wide as the phone. Skipped:
  - 15px pair text: 270px > 265px at 320.
  - Hiding section-pair quote links after an unknown outcome: they land on the paused form, whose alert
    explains the pause and gives the phone. Making every section a client component is out of
    proportion for this round.
  - Per-review "Google review" labels: these would reintroduce the removed source narration.
  Watch mobile LCP and 320/360 pair widths at the visual gate.

### Round 1

- simplify: 4 parallel reviewers (reuse, simplification, efficiency, altitude). Applied: dropped the dead
  `ok` re-check and `isLocked` plumbing, centralized field rules, one global `Window` declaration,
  shared CONTAINER/QUOTE_CTA_LABEL/controlProps, lazy floating-CTA measurement, no backdrop blur,
  smaller logo and photo variants. Skipped: context split/memoization (small page), phone context instead
  of props (sections stay server components), building the MegaTag literals from config (the LP lint
  reads them literally from layout.tsx).
- code-review: `VERDICT: PASS`. Applied finding 1 (validate the same draft that is sent). Finding 2
  (pure #000/#FFF) is the brand's `color_roles`; see above.
- design-review: `VERDICT: DEFERRED (visual gate deferred to post-deploy, no local browser)`. Applied:
  continuous process connector, warm fill on error fields, full-width CTA buttons below 640px (reverted in round 2, see above), and a
  pending spinner. Not applied because the task spec fixes them: outcome-led H1 (the spec gives the exact
  H1), fewer section CTA pairs (every content section must end with the pair), FAQ topics (exactly the
  three ledger FAQs), checkbox wording (exact client label), the error color (token `#000000`), the
  1.5 body line-height token, the hero `min-h` (LP lint), and the manufacturer hero photo (the blueprint
  assigns it; the copy and alt never call it a Peninsula Solar job).
