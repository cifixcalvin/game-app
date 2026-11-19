import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that govern your use of Nexus Arena and participation in Nexus Arena tournaments.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Acceptance of these terms",
    paragraphs: [
      `These Terms of Service govern your access to ${SITE.name} and your participation in events published on the platform. By browsing the site, registering a team, or competing in an event, you agree to these terms on behalf of yourself and every player on your roster.`,
      "If you do not agree, do not use the platform or enter an event. Where an individual tournament publishes additional rules, those rules apply alongside these terms for that event.",
    ],
  },
  {
    title: "Eligibility",
    paragraphs: [
      "You must be at least 16 years old to register a team unless a tournament states otherwise. Players under 18 must have permission from a parent or legal guardian.",
      "You must provide accurate registration details, including a working email address and WhatsApp number. We may request government-issued identification before releasing any prize.",
    ],
  },
  {
    title: "Tournament entries",
    bullets: [
      "A registration is an application to compete, not a guaranteed slot, until it is confirmed by the organiser.",
      "Team names, tags, and logos must not infringe third-party rights or contain hateful, obscene, or misleading content.",
      "Entry fees, where applicable, are shown before submission and are governed by the refund policy published for that event.",
      "Duplicate or automated registrations may be removed without notice.",
    ],
  },
  {
    title: "Rosters and team responsibility",
    paragraphs: [
      "The registered contact is responsible for the team: communicating schedules, ensuring players check in on time, and making sure every player follows the rules.",
      "Rosters lock at the deadline stated for each event. Substitutes must be declared before the lock. Playing with an unregistered or ineligible player may result in forfeiture.",
    ],
  },
  {
    title: "Match rules and rulings",
    paragraphs: [
      "Organisers may publish format, map pool, server, and scheduling rules for each event. Those rules form part of these terms for that event.",
      "We may review evidence, including screenshots, demos, and broadcast footage. Decisions on eligibility, scores, and penalties are final unless an appeal window is stated.",
    ],
  },
  {
    title: "Prizes and payouts",
    bullets: [
      "Prize amounts and distribution are published on the event page and may be adjusted only before registration opens.",
      "Prizes are paid to the registered team contact or an entity nominated in writing, subject to verification and applicable tax.",
      "Teams are responsible for any taxes, bank charges, or currency conversion costs associated with a payout.",
      "Prizes may be withheld where an investigation into cheating or rule-breaking is ongoing.",
    ],
  },
  {
    title: "Prohibited conduct",
    paragraphs: [
      "You may not cheat, use unauthorised software, share accounts, manipulate matches, or attempt to gain an unfair advantage. You may not harass players, organisers, or broadcast staff.",
      "You may not attack the platform, scrape data at scale, bypass access controls, or interfere with registrations and results.",
      "Violations may lead to immediate disqualification, forfeiture of prizes, and a temporary or permanent ban from Nexus Arena events.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      `The ${SITE.name} name, site design, tournament branding, and original content are owned by ${SITE.legalName} or its licensors. You may not copy or commercially use them without written permission.`,
      "By entering an event, you grant us a non-exclusive licence to use your team name, tag, and logo in brackets, broadcasts, and event promotion. You keep ownership of your marks.",
    ],
  },
  {
    title: "Availability and liability",
    paragraphs: [
      "The platform is provided on an as-is basis. We work to keep events running smoothly but do not guarantee uninterrupted access, and we may reschedule or cancel an event where necessary.",
      `To the extent permitted by law, ${SITE.legalName} is not liable for indirect or consequential loss, including lost winnings, reputation, or data. Nothing in these terms limits liability that cannot be limited by law.`,
    ],
  },
  {
    title: "Changes and governing law",
    paragraphs: [
      "We may update these terms. Material changes will be announced on the site, and continued use after an update means you accept the revised terms.",
      "These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Questions about these terms can be sent to ${SITE.supportEmail}. For partnership or press enquiries, use ${SITE.email}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of service"
      intro="The rules that make Nexus Arena fair for every player, team, and organiser. Read these before you register a roster."
      updated="1 November 2026"
      sections={SECTIONS}
    />
  );
}
