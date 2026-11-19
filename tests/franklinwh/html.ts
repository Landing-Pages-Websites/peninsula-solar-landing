import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FranklinPage } from "../../src/franklinwh/components/FranklinPage";
import type { RouteVariant } from "../../src/franklinwh/config";

// Minimal attribute readers for the server-rendered markup the page tests inspect.

export function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];
}

export function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

export function hasAttr(tag: string, name: string): boolean {
  return new RegExp(`\\s${name}(=|\\s|>|/)`).test(tag);
}

/** Each <a ...>inner</a>, with its inner text stripped of tags. */
export function anchors(html: string): { tag: string; text: string }[] {
  return [...html.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a>/g)].map(([, tag, inner]) => ({
    tag,
    text: inner.replace(/<[^>]+>/g, "").trim(),
  }));
}

export function sectionHtml(html: string, id: string): string {
  const start = html.indexOf(`<section id="${id}"`);
  if (start < 0) throw new Error(`section #${id} missing`);
  const end = html.indexOf("</section>", start);
  return html.slice(start, end);
}

export function visibleText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;|&#\d+;/g, " ").replace(/\s+/g, " ");
}

/** Server-rendered page with non-breaking spaces and hyphens folded to plain ones for text matching. */
export function renderPage(variant: RouteVariant): string {
  return renderToStaticMarkup(createElement(FranklinPage, { variant })).replace(/\u00a0|&nbsp;/g, " ").replace(/\u2011/g, "-");
}

export function elements(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>[\\s\\S]*?</${name}>`, "g")) ?? [];
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
