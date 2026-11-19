import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Code of conduct",
  description:
    "The standards of behaviour expected from every player, team, and organiser at Nexus Arena events.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Scope",
    paragraphs: [
      "This code applies to everyone who takes part in a Nexus Arena event: players, substitutes, coaches, team managers, organisers, casters, and crew. It covers in-game behaviour, voice comms, chat, social media, and conduct at physical events.",
      "Competing means accepting this code. Serious breaches can result in removal from an event and a ban from future Nexus Arena competitions.",
    ],
  },
  {
    title: "Expected conduct",
    bullets: [
      "Play to win, but compete with respect for opponents, teammates, and officials.",
      "Be on time for check-in, briefings, and scheduled matches.",
      "Use your registered account and in-game identity for the entire event.",
      "Keep communication clean and professional, especially on broadcast.",
      "Report rule violations or safety concerns to an organiser promptly.",
    ],
  },
  {
    title: "Prohibited conduct",
    bullets: [
      "Harassment, threats, stalking, or targeted abuse of any participant.",
      "Hate speech, slurs, or discrimination based on identity.",
      "Cheating, scripting, unauthorised overlays, or exploiting game bugs.",
      "Match-fixing, deliberate throwing, or sharing accounts.",
      "Sharing another person's private information without consent.",
      "Damaging equipment, venues, or event property.",
      "Refusing to follow reasonable instructions from event officials.",
    ],
  },
  {
    title: "Team accountability",
    paragraphs: [
      "A team is responsible for the conduct of its registered players and staff. Repeated incidents from the same roster may lead to penalties against the team as a whole, including forfeiture.",
      "Team captains are expected to raise internal issues before they affect an event. If a teammate is being harassed, report it rather than retaliating.",
    ],
  },
  {
    title: "Reporting a concern",
    paragraphs: [
      `Report incidents to an on-site official during a live event, or email ${SITE.supportEmail} with the event name, match details, and any evidence such as screenshots or clips.`,
      "Reports are treated confidentially. We will acknowledge receipt and explain the next steps. Deliberately false reports are themselves a violation.",
    ],
  },
  {
    title: "Enforcement",
    bullets: [
      "Verbal warning and a requirement to correct behaviour.",
      "Loss of a map, round, or match, or a point deduction.",
      "Immediate disqualification from an event without refund.",
      "Temporary suspension from Nexus Arena events.",
      "Permanent ban and forfeiture of unpaid prizes in serious cases.",
    ],
  },
  {
    title: "Appeals",
    paragraphs: [
      "Where an appeal window is published, a team may appeal a ruling in writing within 24 hours of notification. Appeals must include the decision being challenged and any new evidence.",
      "The appeal reviewer will not be the official who made the original decision. Appeal outcomes are final for that event.",
    ],
  },
  {
    title: "Support and safety",
    paragraphs: [
      "If you feel unsafe at a physical event, contact venue security or a Nexus Arena crew member immediately. We will prioritise safety over match schedules.",
      `For non-urgent wellbeing or accessibility requests, contact ${SITE.email} before the event so we can plan support.`,
    ],
  },
];

export default function CodeOfConductPage() {
  return (
    <LegalPage
      eyebrow="Community"
      title="Code of conduct"
      intro="Competition is at its best when everyone can play without abuse, cheating, or intimidation. These are the standards we enforce."
      updated="1 November 2026"
      sections={SECTIONS}
    />
  );
}
