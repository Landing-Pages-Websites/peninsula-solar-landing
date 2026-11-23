// Source/markup contracts for the responsive fixes. Native geometry (320-1728) is measured by the
// controller's deployed browser; these lock in the class intent that geometry depends on.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buttonClass, type ButtonSize, type ButtonSurface, type ButtonVariant } from "../../src/franklinwh/components/buttonStyles";
import { CtaPair } from "../../src/franklinwh/components/CtaPair";
import { FieldShell } from "../../src/franklinwh/components/FieldShell";
import { SiteHeader } from "../../src/franklinwh/components/SiteHeader";
import { LOWER_PENINSULA, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { deliveryBands, IMAGES, srcSet, TARGET_DENSITY } from "../../src/franklinwh/images";
import { anchors, attr, classes, readSource, renderPage, sectionHtml, tags } from "./html";

const SRC = new URL("../../src/franklinwh/", import.meta.url);
const PAGE_A = renderPage(UPPER_PENINSULA);

/** Utilities that set one property; two unprefixed ones in a class list resolve by stylesheet order. */
const GROUPS: Record<string, RegExp> = {
  display: /^(hidden|block|inline|inline-block|inline-flex|flex|grid|contents)$/,
  gap: /^gap-/,
  paddingX: /^(px|p)-/,
  fontSize: /^text-(button|small|label|body|h\d|\[)/,
  width: /^w-/,
};

function conflicts(classList: string): string[] {
  const seen = new Map<string, string>();
  const found: string[] = [];
  for (const cls of classList.split(/\s+/).filter(Boolean)) {
    const prefix = cls.includes(":") ? cls.slice(0, cls.lastIndexOf(":")) : "";
    const utility = cls.slice(cls.lastIndexOf(":") + 1);
    for (const [group, pattern] of Object.entries(GROUPS)) {
      if (!pattern.test(utility)) continue;
      const key = `${prefix}|${group}`;
      if (seen.has(key)) found.push(`${seen.get(key)} vs ${cls}`);
      seen.set(key, cls);
    }
  }
  return found;
}

function sourceFiles(dir: URL): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(new URL(`${entry.name}/`, dir)) : [readFileSync(new URL(entry.name, dir), "utf8")],
  );
}

describe("button system", () => {
  it("never emits two utilities for one property at the same breakpoint", () => {
    for (const variant of ["primary", "secondary"] as ButtonVariant[]) {
      for (const surface of ["light", "dark"] as ButtonSurface[]) {
        for (const size of ["regular", "pair", "icon"] as ButtonSize[]) {
          assert.deepEqual(conflicts(buttonClass(variant, { surface, size })), [], `${variant}/${surface}/${size}`);
        }
      }
    }
  });

  it("is never called with an extra that repeats display, gap, padding, type size or a second width", () => {
    const extras = sourceFiles(SRC).flatMap((source) => [...source.matchAll(/extra:\s*"([^"]*)"/g)].map((m) => m[1]));
    assert.ok(extras.length >= 3);
    for (const extra of extras) assert.deepEqual(conflicts(buttonClass("primary", { size: "pair", extra })), [], extra);
    for (const tag of [...tags(PAGE_A, "a"), ...tags(PAGE_A, "button")]) assert.deepEqual(conflicts(attr(tag, "class") ?? ""), [], tag);
  });
});

describe("header (finding 1)", () => {
  const header = renderToStaticMarkup(createElement(SiteHeader, { phone: UPPER_PENINSULA.phone }));

  it("hides the quote link through a wrapper, so the link's inline-flex cannot override it", () => {
    const wrapper = tags(header, "div").find((tag) => tag.includes("data-header-quote")) ?? "";
    assert.deepEqual(classes(wrapper), ["hidden", "lg:block"]);
    const quote = anchors(header).find((a) => attr(a.tag, "href") === "#hero-form");
    assert.ok(quote);
    assert.equal(classes(quote.tag).some((cls) => GROUPS.display.test(cls) && cls !== "inline-flex"), false);
  });

  it("keeps every mark at its natural ratio: fixed height, auto width, never shrunk by flex", () => {
    for (const img of tags(header, "img")) {
      const list = classes(img);
      assert.ok(list.includes("shrink-0") && list.includes("w-auto"), img);
      assert.ok(list.some((cls) => /^h-/.test(cls)), img);
    }
    const [installer] = tags(header, "img");
    // Flyer restyle (task 45272822): the installer mark is now the square "Own Your Energy" badge.
    assert.equal(attr(installer, "src"), "/franklinwh/own-your-energy-badge-192.png");
    assert.equal(attr(installer, "width"), "192");
    assert.equal(attr(installer, "height"), "191");
    // 45272822 r3: 64px in the 80px bar below 640px (the 320x568 first screen), 72px from 640px as before.
    assert.ok(classes(installer).includes("h-16") && classes(installer).includes("sm:h-[72px]"), "64px square at 320: fits the 280px column with the 48px phone");
  });

  it("keeps a 48px styled phone control with the route number as its name", () => {
    const call = anchors(header).find((a) => attr(a.tag, "href") === UPPER_PENINSULA.phone.href);
    assert.ok(call);
    assert.equal(attr(call.tag, "aria-label"), "Call (906) 235-0340");
    assert.ok(classes(call.tag).includes("min-w-12") && classes(call.tag).includes("min-h-12"));
  });
});

describe("section CTA pair (finding 2)", () => {
  for (const [variant, anchor] of [[UPPER_PENINSULA, "hero-form"], [LOWER_PENINSULA, "form"]] as const) {
    const markup = renderToStaticMarkup(createElement(CtaPair, { phone: variant.phone, formAnchor: anchor }));
    const [quote, call] = anchors(markup);

    it(`${variant.path}: is one non-wrapping row with an 8px gap and no full-width buttons`, () => {
      const row = classes(tags(markup, "div")[0]);
      assert.ok(row.includes("flex") && row.includes("flex-nowrap") && row.includes("gap-2"));
      assert.equal(row.includes("flex-col") || row.includes("flex-wrap"), false);
      for (const a of [quote, call]) assert.equal(classes(a.tag).some((cls) => /(^|:)w-full$/.test(cls)), false);
      assert.ok(classes(quote.tag).includes("flex-1"), "the filled quote takes the remaining row width");
    });

    it(`${variant.path}: shortens labels only below 640px and keeps the number whole`, () => {
      assert.equal(attr(quote.tag, "href"), `#${anchor}`);
      assert.match(quote.tag + markup, /<span class="sm:hidden">Free quote<\/span><span class="hidden sm:inline">Request a free quote<\/span>/);
      assert.equal(attr(call.tag, "href"), variant.phone.href);
      assert.equal(attr(call.tag, "aria-label"), `Call ${variant.phone.display}`);
      assert.ok(markup.includes(`<span class="hidden sm:inline">Call </span>${variant.phone.display}`));
      assert.ok(classes(call.tag).includes("whitespace-nowrap") && classes(quote.tag).includes("whitespace-nowrap"));
      assert.ok(markup.includes("<svg"), "phone icon kept");
    });

    it(`${variant.path}: keeps 14px+ type and 48px tap height, full size from 640px`, () => {
      for (const a of [quote, call]) {
        const list = classes(a.tag);
        assert.ok(list.includes("min-h-12") && list.includes("text-small") && list.includes("sm:text-button"));
        assert.ok(list.includes("px-2") && list.includes("sm:px-6"));
      }
    });
  }

  it("is used by every content section, forward-only, and never by the floating CTA", () => {
    const html = PAGE_A;
    assert.equal(tags(sectionHtml(html, "hero"), "div").filter((t) => t.includes("data-cta-pair")).length, 1);
    for (const id of ["backup-benefits", "product-family", "in-house-process", "customer-proof", "faq"]) {
      assert.equal(tags(sectionHtml(html, id), "div").filter((t) => t.includes("data-cta-pair")).length, 1, id);
    }
    const floating = html.slice(html.indexOf("data-floating-cta-lane"));
    assert.equal(floating.includes("tel:"), false);
  });

  it("leaves the form submit label unchanged", () => {
    assert.match(readSource("components/LeadForm.tsx"), /return status === "unknown" \? "Request paused" : QUOTE_CTA_LABEL;/);
  });
});

describe("product family at 1024 (finding 3)", () => {
  const source = readSource("components/sections/ProductFamily.tsx");

  it("stacks name over role from lg and restores paired rows at xl", () => {
    assert.match(source, /sm:grid-cols-\[7\.5rem_1fr\] sm:gap-6 lg:grid-cols-1 lg:gap-1 xl:grid-cols-\[7\.5rem_1fr\] xl:gap-6/);
  });

  it("keeps the 7/5 split with a 40px gap until xl, 64px from xl", () => {
    assert.match(source, /grid gap-10 lg:grid-cols-\[7fr_5fr\] lg:items-center xl:gap-16/);
    assert.equal(source.includes("lg:gap-16"), false);
  });

  it("keeps the verified caption and image", () => {
    assert.ok(source.includes("aPower 2 battery, left, with the aGate controller, right."));
    assert.ok(source.includes("IMAGES.aPower2AndAGate"));
  });
});

describe("paired form fields (finding 4)", () => {
  it("share label and control rows through a two-row subgrid, labels sitting on their controls", () => {
    const markup = renderToStaticMarkup(FieldShell({ id: "f-utility", label: "Utility Company", optional: true, children: createElement("input", { id: "f-utility" }) }));
    const shell = classes(tags(markup, "div")[0]);
    for (const cls of ["grid", "row-span-2", "grid-rows-subgrid", "gap-y-2"]) assert.ok(shell.includes(cls), cls);
    assert.ok(classes(tags(markup, "label")[0]).includes("self-end"));
    assert.match(markup, /<label for="f-utility"[^>]*>Utility Company<span[^>]*> \(optional\)<\/span><\/label>/);
    assert.match(readSource("components/LeadFormFields.tsx"), /className="grid gap-5 sm:grid-cols-2"/);
  });
});

describe("delivered image density (finding 6)", () => {
  /** Pin on the round-2 desktop receipts (b-1440-r1-images-native.json, rounded up; aPower 2 at 1200-1279px). imageDelivery.test.ts sweeps every width. */
  const DESKTOP_SLOTS = {
    // Not a receipt: the 640px column at the file's 4:3 since the headline moved over the uncropped photo
    // (45272822 r2; native 1440 measure 630x472.5). Was a 640x400 16:10 crop.
    heroInstallation: [640, 480],
    aGate: [440, 383],
    aPower2AndAGate: [640, 484],
  } as const;

  for (const [key, [cssW, cssH]] of Object.entries(DESKTOP_SLOTS)) {
    it(`${key}: even the smallest desktop srcset candidate holds 2x its desktop slot`, () => {
      const image = IMAGES[key as keyof typeof DESKTOP_SLOTS];
      const fileW = deliveryBands(image)[0].widths[0];
      const fileH = (fileW * image.height) / image.width;
      assert.ok(Math.max(cssW / fileW, cssH / fileH) * TARGET_DENSITY <= 1, `${fileW}x${fileH.toFixed(0)}`);
    });
  }

  it("lists only srcset files that exist in public", () => {
    for (const image of Object.values(IMAGES)) {
      for (const candidate of deliveryBands(image).flatMap((band) => srcSet(image, band.widths).split(", "))) {
        const file = candidate.split(" ")[0];
        assert.ok(existsSync(new URL(`../../public${file}`, import.meta.url)), file);
      }
    }
  });
});

describe("round 3: 320 heading binding", () => {
  it("binds `a standby` in the backup-benefits heading without changing its words", () => {
    assert.ok(readSource("components/sections/BackupBenefits.tsx").includes(">A modern alternative to a&nbsp;standby generator</h2>"));
  });
});

describe("photo-backed hero headline (restyle 45272822 r2)", () => {
  for (const [variant, html] of [[UPPER_PENINSULA, PAGE_A], [LOWER_PENINSULA, renderPage(LOWER_PENINSULA)]] as const) {
    it(`${variant.path}: the h1 is overlaid inside the one hero photo frame, which shows uncropped`, () => {
      const hero = sectionHtml(html, "hero");
      const frame = hero.slice(hero.indexOf('class="evening-photo'), hero.indexOf("</picture>"));
      // r3: the h1 sits in an absolute overlay with the mobile-only FranklinWH mark above it (was: absolute h1).
      assert.match(frame, /^class="evening-photo[^"]*"><div class="absolute [^"]*">(<img [^>]*franklinwh-logo-reversed[^>]*sm:hidden"\/>)?<h1 class="[^"]*">FranklinWH home battery backup<\/h1><\/div><picture/);
      assert.ok(frame.includes(`/franklinwh/${IMAGES.heroInstallation.base}-`), "photo in the h1's frame");
      assert.equal(tags(hero, "img").filter((t) => t.includes(IMAGES.heroInstallation.base)).length, 1);
      const photo = tags(frame, "img").find((t) => t.includes(IMAGES.heroInstallation.base));
      assert.ok(photo && !classes(photo).some((c) => c.startsWith("aspect-") || c.startsWith("object-")));
    });
  }

  it("keeps the overlaid h1 to two lines (a 7em measure below lg), sized by the frame", () => {
    const css = readFileSync(new URL("../../src/app/(franklinwh)/franklinwh.css", import.meta.url), "utf8");
    const start = css.indexOf(".evening-photo h1 {");
    const rule = css.slice(start, css.indexOf("\n  }", start));
    assert.ok(rule.includes("cqi"));
    assert.match(rule, /@media \(width < 64rem\) \{\s*max-width: 7em;\s*\}/);
    assert.match(css, /\.evening-photo \{[^}]*container-type: inline-size;/);
  });
});
