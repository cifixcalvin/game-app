import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Nexus Arena collects, uses, and protects the personal information you share when registering for tournaments.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Overview",
    paragraphs: [
      `This policy explains how ${SITE.legalName} handles personal information collected through ${SITE.name}. We collect only what we need to run tournaments, communicate with teams, and keep the platform secure.`,
      "By registering for an event or joining our newsletter, you acknowledge the practices described here.",
    ],
  },
  {
    title: "Information we collect",
    bullets: [
      "Registration details: team name, contact name, email address, and WhatsApp number.",
      "Event data: tournament entries, check-in status, match results, and organiser notes.",
      "Technical data: IP-derived hashes, browser user agent, and basic request logs used for abuse prevention.",
      "Communications: messages you send to support or through our newsletter sign-up.",
      "Optional content: team logos or banners you upload, and social links you provide.",
    ],
  },
  {
    title: "How we use information",
    bullets: [
      "To review, confirm, and administer tournament registrations.",
      "To contact team captains about schedules, check-ins, rulings, and prize payouts.",
      "To detect duplicate entries, spam, fraud, and abuse of the platform.",
      "To publish brackets, results, and event coverage that may include team names and logos.",
      "To send tournament announcements and newsletters where you have opted in.",
    ],
  },
  {
    title: "Legal basis and consent",
    paragraphs: [
      "We process registration and event data to perform our agreement with you, to comply with legal obligations, and for legitimate interests such as platform security and event administration.",
      "Newsletter and marketing messages are sent on the basis of consent. You can withdraw consent at any time using the unsubscribe link or by contacting us.",
    ],
  },
  {
    title: "Sharing information",
    paragraphs: [
      "We do not sell personal information. We share it only with service providers that help us operate, such as hosting, database, email, and payment partners, under appropriate confidentiality obligations.",
      "We may disclose information where required by law, to enforce our terms, or to protect the safety of players and staff. Tournament results and team names may be published publicly.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Registration records are kept for as long as needed to administer the event and meet legal, tax, and prize-payout obligations. Aggregate results may be retained for historical records.",
      "Support messages are retained for up to 24 months. Newsletter data is retained until you unsubscribe or request deletion.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use encrypted connections, hashed credentials, scoped access controls, and rate limiting to protect the platform. No system is completely secure, but we review our controls regularly.",
      "Access to registration data is limited to authorised organisers. If you believe your information has been compromised, contact us immediately.",
    ],
  },
  {
    title: "Cookies and local storage",
    paragraphs: [
      "We use essential cookies to keep admin sessions secure. We may use privacy-respecting analytics to understand aggregate site usage. We do not use cookies to build advertising profiles.",
      "You can block cookies in your browser, but essential admin features may stop working.",
    ],
  },
  {
    title: "Your rights",
    bullets: [
      "Request access to the personal information we hold about you.",
      "Ask us to correct inaccurate or incomplete details.",
      "Request deletion where we no longer need the information for a legal or contractual purpose.",
      "Withdraw consent for marketing communications.",
      "Raise a concern with us before contacting a data protection authority.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "The platform is not directed at children under 16. Where an event allows players aged 16 or 17, a parent or guardian must consent to the registration and any prize payout.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Privacy requests can be sent to ${SITE.supportEmail}. Include your team name and the email used to register so we can locate your records.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro="What we collect, why we collect it, and the control you have over your data. Written to be read, not skimmed past."
      updated="1 November 2026"
      sections={SECTIONS}
    />
  );
}
