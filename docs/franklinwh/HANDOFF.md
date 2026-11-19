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

## Client photo withdrawal (2026-11-19): governs the active build

**Authority.** Atlas comment `a32ba639-6d55-47a2-a595-160fb4c32e5c` (2026-11-19T19:46:45.590Z), relaying an
email from Rachel Raak with Ian Olmsted (Nov 19, ~19:45 UTC, Peninsula Solar case
`b8ffdb51-f7a1-4d18-a032-cc6987193fdf`, inbound `msg_3a6vgmqm`): "Please don't use the Arnold install photos I sent
earlier." "All ads should be FranklinWH-focused." "Please take them off both regional pages (Upper and northern Lower
Peninsula) and use FranklinWH product imagery until the client's replacement photos arrive." Ian had also said at
17:56 UTC not to use their solar panel photos. The comment is retained in
`task-evidence/6175fe7a-peninsula-intake/comments-pre-final-handoff.json`.

**Superseded.** The original content request ("The three attached photos are from Peninsula Solar's own aPower S
install near Marquette - use them") and the Stage 0 research and attached archive that carry
`Arnold_IMG_6898.jpg`, `Arnold_IMG_9068.jpg` and `Arnold_IMG_0800.jpg` are historical pre-withdrawal input only. They
are not current image permission. Anything below in this file about the Marquette project section, the landscape or
racking photos, or the "racking cap" is history from rounds 1-3 and no longer describes the build.

**Removed from both routes** (`/franklinwh`, `/franklinwh-lower-peninsula`, one shared `FranklinPage`):

- Section `#marquette-project` (`components/sections/MarquetteProject.tsx`): heading "A FranklinWH project near
  Marquette", its paragraph, the three figures and captions, and its CTA pair.
- `IMAGES.marquetteEquipment`, `marquetteArray`, `marquetteRacking` and their 15 task-derived WebPs in
  `public/franklinwh/` (`marquette-{franklinwh-equipment,rooftop-array,racking-detail}-*.webp`). Their hashes were
  re-verified against `image-ledger.json` before deletion. The files stay in git history (no rewrite). The originals
  are untouched in `website-lp-build-research-data/8bbf1dbc-49fb-44b5-8c82-e1235149e809/client-assets/`.
- The gallery-specific tests: the three images' delivery sweeps and desktop-slot pins, and the racking-frame contract.

**Unchanged.** The other seven sections in their order (`hero`, `backup-benefits`, `product-family`,
`in-house-process`, `customer-proof`, `faq`, `final-quote`) and every remaining CTA pair. The three FranklinWH
manufacturer images (hero `apower-s-installation`, backup-benefits `agate`, product-family `apower-2-and-agate`) keep
their files, crops, captions, `sizes`, band delivery and layout. The repo never had a fourth product image, so none
was added. Forms, events, tracking, `fields.ts`, `attribution.ts`, phones, brand and all other copy are unchanged,
and so is the protected root `/`. Its own solar imagery is outside this task. No placeholder, "photos coming soon"
copy, stock or new photo was added.

**Contract.** `task-spec.json` (`sections_in_dom_order`, `imagery.clientWithdrawal`), `content-sources.json`
(`withdrawnClaims`) and `image-ledger.json` (`withdrawn_client_photos`) record the withdrawal.
`tests/franklinwh/page.test.ts` asserts, on both routes, the seven section ids in order, no Arnold, Marquette-project,
rooftop, array, racking or solar-panel reference anywhere in the markup, and that the only photos are the three
product images, each in its own section. `imageDelivery.test.ts` still sweeps 320-1728 for those three.

**Verification (this change).** Tests 158/158: 173 before, minus 19 gallery-specific cases (three images x five
delivery cases, three desktop-slot pins, the racking-frame contract), plus 4 new withdrawal cases (two per route). The
new cases fail on `origin/main` (6 failures with the section-order case) and pass here. `npx tsc --noEmit
--incremental false` and `next build` pass. The rendered markup of both routes on `origin/main`, with only the
`#marquette-project` section cut out, is byte-identical to this branch. The canonical LP lint is unchanged from the
pre-withdrawal controller log: 12 errors and 3 warnings, all inherited protected-root or fixed-path debt, so it is not
clean. `npx eslint` has no repo `eslint.config.*` and was not run. The 47/47 protected hashes match. Form, event,
tracking, `fields.ts`, `attribution.ts` and their tests are byte-identical to `origin/main`. simplify removed an unused
test import and derives the test's image bases from `IMAGES`. code-review: `VERDICT: PASS`, and its two stale
racking-frame requests in this file are now labeled historical.

**Pending, not blocking.** Client replacement photos (Leda's new photos and another FranklinWH photo) are expected
later. Adding them is a separate change. The customer approves both pages before ads launch, and that approval is
not the merge gate. Native visual and layout evidence for this change is DEFERRED to the controller (no local browser).

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

## Unknown alert whitespace fix (after round 3)

The controller's native r2 UNKNOWN captures (`task-evidence/6175fe7a-peninsula-intake/unknown-*-r2.{json,png}`)
showed `(906) 235-0340and` / `(231) 590-7305and` in the alert's `innerText`. The JSX space after the
`PhoneNumber` link was dropped by the compiler. `FormUnknownAlert.tsx` now has an explicit `{" "}` after the
link. Wording, phone link, role gating and every form mechanic are unchanged. `tests/franklinwh/forms.test.ts`
asserts that the static markup text contains `0340 and` / `7305 and` and never `0340and` / `7305and` on both
routes. Tests 173/173, tsc and scoped ESLint clean, 47/47 protected hashes, package files untouched.
No browser was used. Native capture of the corrected alert is DEFERRED to the controller. This fix makes no
visual claim. simplify: one redundant assertion removed. code-review: `VERDICT: PASS`. design-review: visual
DEFERRED (copy spacing only, no local browser).

## Round 3 corrections (native r2 image receipts)

_Historical. The Marquette photos and racking cap below were removed by the 2026-11-19 client withdrawal (see top)._

The controller's r2 matrix (`task-evidence/6175fe7a-peninsula-intake/{a,b}-{320..1728}-r2-images.json`, decoded
`currentSrc`, DPR 1, target 2) failed at narrow and tablet widths. At DPR 1 a browser picks the smallest srcset file
at least as wide as the slot, so the round-2 policy (every srcset starts at 2x the *desktop* slot) still served 1x files
wherever the single-column slot is wider than the desktop slot. Failures: racking 600px file at 360/390 (1.017/1.117);
at 768 the hero and aPower 2 1300px files (1.097), both landscapes 900px (1.584) and racking 1000px (1.426).
1024/1440/1728 passed and are unchanged.

- **Band policy** (`src/franklinwh/images.ts`): each image declares its largest CSS slot per viewport band
  (`VIEWPORT_BANDS` 320-479, 480-639, 640-767, 768-1023, 1024+, taken at the band's widest viewport with no scrollbar).
  `deliveryBands` gives each band a srcset of only the real files >= 2x that slot. Neighbouring bands with the same
  list merge, and a missing file throws at render. `ResponsiveImage` renders the wider bands as
  `<source media="(min-width: N px)">` in a `<picture class="contents">`, so the `<img>` stays the flex/grid item
  with its classes, `width`/`height` and object-fit. aGate needs one band, so it stays a plain `<img>`. Every `<source>`
  repeats the true `sizes`.
- **Floors (DPR 1 pick per band):** hero and aPower 2: 900 / 1300 / 1500 / 2000 / 1300 (desktop). Landscapes:
  900 / 1200 / 1500 / 2000 / 900. Racking: 900 / 1200 / 1500 (640-1023) / 600. aGate: 1200 everywhere.
  New variants come from the retained originals with no upscale or crop change: hero 900/1500/2000 from
  4032x3024, aPower 2 900/1500/2000 from the existing 4123x3115 crop (top-left, verified against the 1300 file),
  landscapes 1500 and 2000 (the full 2000x1500 originals), racking 900 and 1500 (the full 1500x2000 original).
  WebP q80, effort 6.
- **Portrait slot constraint:** below lg the racking figure is `max-lg:mx-auto max-lg:w-full max-lg:max-w-[750px]`,
  the widest slot the 1500px original covers at 2x. It binds from 790px (no scrollbar), and its `sizes` says
  `(min-width: 790px) 750px`. Crop, caption, order and the lg flex share are unchanged. The two landscapes are not capped.
- **sizes:** aGate now states its 440px cap from 544px (it said `calc(100vw - 104px)`). All other `sizes` are
  unchanged. A test holds every `sizes` between the modelled slot and 12% above it at every viewport.
- **Tests** (`tests/franklinwh/imageDelivery.test.ts`, 33 cases): a CSS slot model per image, checked against the r2
  receipts at 768/1024/1440. It sweeps every integer viewport 320-1728 and each band edge - 0.01px (479.99, 639.99,
  767.99, 1023.99) on both routes. At each width it takes the `<source>`/`<img>` that applies and checks that the
  smallest file in it holds 2x the slot by width and height. Each file's dimensions are read from its WebP header,
  so a descriptor cannot claim a width the file does not have. The declared band slots are checked against the
  model, and an unreferenced variant fails the run. Putting the round-2 single-srcset delivery back fails 10 of
  these (for example racking at 341px from the 600px file). Two contracts in `layoutContract.test.ts` cover the
  racking cap and the heading binding.
- **Heading at 320:** `A modern alternative to a&nbsp;standby generator` binds `a standby`. The words and type
  are unchanged.
- **Not done here:** no change to the hero layout for the advisory photo-before-form note. Forms, events, copy,
  phones and tracking are untouched.
- **Limits:** 2x is guaranteed at DPR 1-2. 3x is best effort: Chromium's geometric-mean pick can land under 3x, and the
  768-1023 slots exceed what the 2000px originals hold at 3x. Tablet DPR 1 bytes rise (hero 349 KB, array 499 KB, racking
  407 KB). Full per-band tables, receipts and limits are in `image-ledger.json`.

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
- **Image density (superseded in round 3, see above):** each srcset now starts at a file holding 2x the image's largest desktop slot (hero
  1300/1800, aGate 1200, aPower 2 + aGate 1300). `sizes` still states the true slot. The three 1x files the
  browser picked at DPR 1 (`apower-s-installation-800`, `agate-700`, `apower-2-and-agate-800`) are no longer
  referenced and were removed. `image-ledger.json` separates planned calculations (`planned_r2`) from
  the controller's round-1 receipts and lists known gaps (3x desktop; 641-1023px tablets at DPR 1).
- **Copy:** removed "From reviews our customers left on Google." and the footer marketing sentence.
  The footer keeps the installer mark, the route office phone, the privacy link and the copyright.
- **Provenance:** root `task-spec.json` (scope limited to the two routes and `/privacy`, with the legacy
  preservation boundary) and `content-sources.json` (a source for every claim, testimonial and FAQ, plus
  the installer differentiator). `tests/franklinwh/provenance.test.ts` keeps them in sync with the code.

## Source preservation (rounds 2 and 3)

Round 3: re-hashed again, 47/47 identical, the three approved moves only, old paths absent. `package.json` and
`package-lock.json` are byte-identical to `origin/main`. Round 3 touches only `src/franklinwh/{images.ts,
components/ResponsiveImage.tsx, components/sections/{MarquetteProject,BackupBenefits}.tsx}`, `tests/franklinwh/**`,
`docs/franklinwh/**` and 12 added WebP variants under `public/franklinwh/` (no file removed or rewritten).


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

- Round 3, same unchanged script (`skills/landing-page-architect/scripts/lint-landing-page.js`): 12 errors and
  3 warnings, and the numbered findings are identical line for line to the controller's
  `controller-lint-r2.log`. These are inherited/fixed-path debt. The lint is NOT clean. Scoped ESLint (same temporary
  config) is clean on `src/franklinwh`, `src/app/(franklinwh)` and `tests/franklinwh`.

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

Client photo withdrawal (2026-11-19): no browser was launched and no server was started (`next build` only). Native
capture of both routes at 320/360/390/768/1024/1440/1728 is DEFERRED to the controller: the seven sections and their
rhythm without `#marquette-project`, the three product images' `currentSrc`, overflow, and the remaining CTA pairs.
The Round 3 items below about the racking frame and portrait cap no longer apply; that section was removed.

Round 3: no browser was launched and no server was started (`next build` only). The per-band picks, the
`<picture class="contents">` wrapper's layout neutrality, the 750px racking frame and the 320 heading
line are source contracts and calculations awaiting the controller's native capture on both routes at
320/360/390/768/1024/1440/1728 (and ideally 640/641/1023). Decoded `currentSrc` dimensions are the proof.

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

### Round 3

- simplify (4 parallel reviewers: reuse, simplification, efficiency, altitude). Applied: `DeliveryBand` carries
  `widths` and one `srcSet(image, widths)` builds every srcset string, so tests no longer parse srcsets back;
  WebP header sizes are cached and the smallest file is picked once per set (the suite runs in ~0.8 s, not ~2 s);
  failure messages are built only on failure; the test model takes the aspect from the image except the hero's
  16:10 crop; racking slots reuse `FULL_COLUMN`; `layoutContract` imports `TARGET_DENSITY`. Skipped: deleting the
  round-2 desktop-density block (kept as a pin on the round-2 desktop receipts and the prior 136 regressions); one
  shared table generating `sizes`, `slots` and the test model (a wider refactor, and the test model is meant to be
  independent); memoizing `deliveryBands` (static render); splitting out the `a standby` binding (in scope).
- code-review: `VERDICT: PASS` (171/171 tests, tsc clean). It checked band selection against Chromium's DPR 1 pick,
  the `display: contents` wrapper, the 64rem lg edge, the slot model against the CSS, the WebP header offsets, and every new
  file as a no-upscale downscale of its original (aPower 2 matches the existing top-left 4123x3115 crop). Low findings
  not applied: the overlapping desktop test (kept, above) and band merging mutating a fresh local object (never shared).
- design-review: `VERDICT: DEFERRED (visual gate deferred to post-deploy, no local browser)`. It found no layout-shift
  or aspect risk (all variants within 0.0003 of the source aspect), on-brand files with no upscale, and desktop unchanged.
  Not applied, for the controller's native judgement (historical: the racking photo and its cap were removed by the
  2026-11-19 client withdrawal, so the first two items no longer apply):
  - A tighter portrait cap (~480-520px) or a left-aligned 750px frame on 640-1023 tablets. The 750px figure is
    ~1000px tall there. The controller specified the centered 750px cap as the narrowly permitted constraint, so this
    round does not change layout further. Please judge 768/1023 on real pixels.
  - Cropping the worker's legs at the top of the racking photo: crop changes are out of scope.
  - Tablet weight at 768-1023: ~1.4 MB of photos at DPR 1, below-fold ones lazy. Watch hero LCP at 768/1023.

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
