"use server";

import { subscribeToNewsletter } from "@/lib/newsletter";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";
import { formatZodErrors, newsletterSchema } from "@/lib/validation";

export type NewsletterState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function subscribeAction(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "footer",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const { ipHash } = await getRequestContext();
    const limit = await consumeRateLimit(`newsletter:${ipHash}`, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return {
        ok: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const result = await subscribeToNewsletter(parsed.data.email, parsed.data.source);
    return { ok: result.ok, message: result.message };
  } catch (error) {
    console.error("[newsletter]", error);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
