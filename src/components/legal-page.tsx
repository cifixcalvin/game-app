import Link from "next/link";

import { SITE } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="pb-24">
      <section className="border-b border-white/[0.06] bg-[#070a07]">
        <div className="container-shell py-16 sm:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-4 max-w-3xl text-[40px] leading-[1] font-semibold tracking-[-0.03em] text-white sm:text-[54px]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[14px] leading-7 text-white/45">
            {intro}
          </p>
          <p className="mono mt-5 text-[8px] tracking-[0.14em] text-white/25 uppercase">
            Last updated {updated}
          </p>
        </div>
      </section>

      <div className="container-shell grid gap-12 py-14 lg:grid-cols-[0.3fr_0.7fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mono text-[8px] tracking-[0.16em] text-white/25 uppercase">
              On this page
            </p>
            <nav className="mt-4 space-y-2 border-l border-white/[0.08] pl-4">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${slugify(section.title)}`}
                  className="block text-[11px] leading-5 text-white/35 transition-colors hover:text-white/70"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-lg border border-white/[0.07] p-4">
              <p className="text-[11px] text-white/45">Questions?</p>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="mono mt-1 block text-[9px] text-[#b6ff2e]/70 hover:text-[#b6ff2e]"
              >
                {SITE.supportEmail}
              </a>
            </div>
          </div>
        </aside>

        <article className="max-w-3xl space-y-10">
          {sections.map((section) => (
            <section
              key={section.title}
              id={slugify(section.title)}
              className="scroll-mt-24"
            >
              <h2 className="display text-[20px] font-semibold text-white">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs?.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[13px] leading-7 text-white/40"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="space-y-2 pt-1">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 text-[13px] leading-7 text-white/40"
                      >
                        <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#b6ff2e]/60" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-[12px] text-white/45">
              Need clarification on anything here?{" "}
              <Link href="/contact" className="text-[#b6ff2e]/80 hover:text-[#b6ff2e]">
                Contact the Nexus Arena team
              </Link>{" "}
              and we will respond within two business days.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
