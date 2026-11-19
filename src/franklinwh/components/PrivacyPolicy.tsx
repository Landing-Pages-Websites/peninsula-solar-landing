import type { ReactElement } from "react";
import { SITE } from "../config";
import { POLICY_EFFECTIVE_DATE, POLICY_SECTIONS, type PolicySection } from "../privacyContent";
import { INLINE_LINK } from "./buttonStyles";

function PolicyBlock({ section }: { section: PolicySection }): ReactElement {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-h3 font-semibold text-ink">{section.heading}</h2>
      {section.paragraphs.map((text) => (
        <p key={text} className="text-body text-ink">{text}</p>
      ))}
      {section.items && (
        <ul className="list-disc space-y-1 pl-6 text-body text-ink marker:text-muted">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The policy linked under both quote forms and in the footer. */
export function PrivacyPolicy(): ReactElement {
  return (
    <article className="mx-auto flex max-w-[760px] flex-col gap-10 px-5 py-16 lg:px-8 lg:py-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 font-semibold text-ink">Privacy Policy</h1>
        <p className="text-label text-muted">Effective {POLICY_EFFECTIVE_DATE}</p>
      </header>
      {POLICY_SECTIONS.map((section) => (
        <PolicyBlock key={section.heading} section={section} />
      ))}
      <section className="flex flex-col gap-3">
        <h2 className="text-h3 font-semibold text-ink">Contact us</h2>
        <p className="text-body text-ink">
          Questions or requests about your information: <a href={`mailto:${SITE.contactEmail}`} className={INLINE_LINK}>{SITE.contactEmail}</a>
        </p>
      </section>
    </article>
  );
}
