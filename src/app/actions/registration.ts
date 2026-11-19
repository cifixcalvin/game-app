"use server";

import { createHash } from "node:crypto";

import { createRegistration } from "@/lib/registrations";
import { verifyRegistrationToken } from "@/lib/form-token";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";
import { formatZodErrors, registrationFormSchema } from "@/lib/validation";
import { normalizeWhatsapp } from "@/lib/utils";

export type RegistrationState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  reference?: string;
  teamName?: string;
};

function errorState(
  message: string,
  errors?: Record<string, string[] | undefined>,
): RegistrationState {
  return { ok: false, message, errors };
}

export async function registerTeam(
  _prevState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const parsed = registrationFormSchema.safeParse({
    tournamentId: formData.get("tournamentId"),
    token: formData.get("token"),
    teamName: formData.get("teamName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    website: formData.get("website") ?? "",
    acceptRules: formData.get("acceptRules"),
  });

  if (!parsed.success) {
    return errorState(
      "Check the highlighted fields and try again.",
      formatZodErrors(parsed.error),
    );
  }

  const data = parsed.data;
  if (!verifyRegistrationToken(data.token, data.tournamentId)) {
    return errorState(
      "This form expired. Refresh the page and try again.",
      { token: ["Your session expired"] },
    );
  }

  const whatsapp = normalizeWhatsapp(data.whatsapp);
  if (!whatsapp) {
    return errorState("Enter a valid WhatsApp number.", {
      whatsapp: ["Include your country code if outside India"],
    });
  }

  try {
    const { ipHash, userAgent } = await getRequestContext();
    const emailHash = createHash("sha256")
      .update(data.email)
      .digest("hex")
      .slice(0, 40);

    const ipLimit = await consumeRateLimit(`reg:ip:${ipHash}`, 10, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return errorState(
        "Too many registration attempts. Please try again in an hour.",
      );
    }
    const emailLimit = await consumeRateLimit(
      `reg:email:${emailHash}`,
      4,
      24 * 60 * 60 * 1000,
    );
    if (!emailLimit.ok) {
      return errorState(
        "This email has already submitted several registrations. Contact support for help.",
      );
    }

    const result = await createRegistration({
      tournamentId: data.tournamentId,
      teamName: data.teamName,
      whatsapp,
      contactName: data.contactName,
      email: data.email,
      ipHash,
      userAgent,
    });

    if (!result.ok) {
      return errorState(result.message, {
        teamName: result.message.includes("team name")
          ? [result.message]
          : undefined,
      });
    }

    return {
      ok: true,
      reference: result.reference,
      teamName: data.teamName,
      message: "Your slot request is in. Keep the reference safe.",
    };
  } catch (error) {
    console.error("[registration]", error);
    return errorState(
      "Something went wrong while saving your registration. Please try again.",
    );
  }
}
