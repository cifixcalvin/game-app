import Link from "next/link";
import { ArrowUpRight, Camera, MessageCircle, Play } from "lucide-react";

import { SITE } from "@/lib/constants";

import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const explore = [
  { href: "/tournaments", label: "All tournaments" },
  { href: "/tournaments?status=live", label: "Live now" },
  { href: "/tournaments?status=upcoming", label: "Upcoming" },
  { href: "/tournaments?status=completed", label: "Past champions" },
];

const company = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/contact#organisers", label: "Host with us" },
  { href: "/admin", label: "Organiser login" },
];

const legal = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/code-of-conduct", label: "Code of conduct" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.07] bg-[#060906]">
      <div className="container-shell">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.1fr_0.8fr_0.8fr_1.3fr] lg:gap-8">
          <div>
            <Logo />
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-white/45">
              Competitive gaming, reimagined. India&apos;s home for high-stakes
              esports across every major title.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { href: SITE.socials.instagram, label: "Instagram", Icon: Camera },
                { href: SITE.socials.youtube, label: "YouTube", Icon: Play },
                { href: SITE.socials.discord, label: "Discord", Icon: MessageCircle },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/45 transition-colors hover:border-[#b6ff2e]/40 hover:text-[#b6ff2e]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Company" links={company} />

          <div>
            <p className="mono text-[10px] font-medium tracking-[0.18em] text-white/35 uppercase">
              The drop zone
            </p>
            <p className="display mt-4 text-xl font-semibold text-white">
              Brackets, drops &amp; invites.
            </p>
            <p className="mt-2 text-sm leading-6 text-white/45">
              One email a week. Tournament openings, prize pool reveals, and
              zero noise.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.06] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[9px] tracking-[0.12em] text-white/25 uppercase">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mono text-[9px] tracking-[0.12em] text-white/35 uppercase transition-colors hover:text-white/70"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mono inline-flex items-center gap-1 text-[9px] tracking-[0.12em] text-[#b6ff2e]/70 uppercase hover:text-[#b6ff2e]"
            >
              Support <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mono text-[10px] font-medium tracking-[0.18em] text-white/35 uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
