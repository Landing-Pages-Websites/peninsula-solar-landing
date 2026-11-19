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
- `leadPayload.ts`: success requires an HTTP 2xx and a parsed body with `ok === true`. A missing, false
  or null `ok`, invalid JSON, a non-2xx response or a network failure never counts as success.
- `submission.ts` + `components/useLeadSubmission.ts`: one synchronous lock for both forms. A duplicate
  click or a sibling form in the same tick never sends twice. The lock is kept after success (one lead
  per page view) and released after a failure so the visitor can retry.
- `conversionEvents.ts`: after confirmed success only, one
  `MegaTag.trackEvent('form_submit', { elementId: <form id>, formData: <all six keys> })` and one
  `dataLayer.push({ event: 'form_submission', form_id, form_provider: 'peninsula-solar-lp' })`.
  A tracker error cannot undo or unlock a confirmed lead.
- Forms: `noValidate`, visible associated labels, `type="button"` validate-first direct send, Enter
  stopped at keydown (textarea, select, button, link and IME keep their native meaning), onSubmit is
  only a backstop. Error messages are linked with `aria-describedby`/`aria-invalid`, and the first
  invalid field gets focus. A failed send shows `role="alert"` with the route phone and keeps the draft.
  Form ids are `hero-lead-form` and `final-lead-form`; the card anchors are `#hero-form` and `#form`.

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

- Baseline (`task-evidence/.../legacy-lint-before.log`): 17 errors, 5 warnings, all in the protected root.
- Full repo after: 12 errors, 3 warnings (the 2 new-route warnings are the projection's FAVICON/OffGrid notes below). Every remaining form, phone and required-field error is the
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

Visual gate DEFERRED to post-deploy (no local browser). Not run here, and not claimed:
`browser-wide-screen-gaps.js` (1024/1440/1728), `browser-line-breaks.js` and
`browser-hero-and-photos.js` (390/1024/1440/1728), `browser-copy-repetition.js`,
`browser-ccp-donts.js`, `browser-cta-targets.js`, 320/360 overflow and paired-action checks, the
failed-response alert, floating CTA overlap and availability, forward anchor arrival, and decoded
delivered pixels for every image (`docs/franklinwh/image-ledger.json` has the planned slots and
srcset picks: every image passes at 2x on desktop and at 2x/3x on mobile; on a rare 3x desktop display
the hero and the two manufacturer renders fall 5-44% short, which is above the required density of 2).

## CCP note for the parent

The universal CTM script stays installed per the controller contract. CCP `creative.doNotUse` says
"Google call forwarding numbers replacing on-site phone numbers". The page source authors only the two
real route numbers. Whether runtime DNI swaps them is controller/Instrumentation-owned, so this is
flagged here rather than posted on the task (the contract bars this session from task comments).

## Review verdicts

- simplify: 4 parallel reviewers (reuse, simplification, efficiency, altitude). Applied: dropped the dead
  `ok` re-check and `isLocked` plumbing, centralized field rules, one global `Window` declaration,
  shared CONTAINER/QUOTE_CTA_LABEL/controlProps, lazy floating-CTA measurement, no backdrop blur,
  smaller logo and photo variants. Skipped: context split/memoization (small page), phone context instead
  of props (sections stay server components), building the MegaTag literals from config (the LP lint
  reads them literally from layout.tsx).
- code-review: `VERDICT: PASS`. Applied finding 1 (validate the same draft that is sent). Finding 2
  (pure #000/#FFF) is the brand's `color_roles`; see above.
- design-review: `VERDICT: DEFERRED (visual gate deferred to post-deploy, no local browser)`. Applied:
  continuous process connector, warm fill on error fields, full-width CTA buttons below 640px, and a
  pending spinner. Not applied because the task spec fixes them: outcome-led H1 (the spec gives the exact
  H1), fewer section CTA pairs (every content section must end with the pair), FAQ topics (exactly the
  three ledger FAQs), checkbox wording (exact client label), the error color (token `#000000`), the
  1.5 body line-height token, the hero `min-h` (LP lint), and the manufacturer hero photo (the blueprint
  assigns it; the copy and alt never call it a Peninsula Solar job).
