"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";

import {
  authenticateAdmin,
  createAdminSession,
  destroyAdminSession,
  getAdminSession,
} from "@/lib/auth";
import { getAdminPasswordHash, updateAdminPassword } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";
import {
  formatZodErrors,
  loginSchema,
  passwordChangeSchema,
} from "@/lib/validation";

export type LoginState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function safeNext(value: FormDataEntryValue | null) {
  if (
    typeof value === "string" &&
    value.startsWith("/admin") &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return "/admin";
}

function emailKey(value: string) {
  return createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 40);
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter your email and password.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const { ipHash } = await getRequestContext();
    const ipLimit = await consumeRateLimit(`login:ip:${ipHash}`, 12, 15 * 60 * 1000);
    if (!ipLimit.ok) {
      return {
        ok: false,
        message: "Too many login attempts. Wait 15 minutes and try again.",
      };
    }
    const emailLimit = await consumeRateLimit(
      `login:email:${emailKey(parsed.data.email)}`,
      6,
      15 * 60 * 1000,
    );
    if (!emailLimit.ok) {
      return {
        ok: false,
        message: "Too many attempts for this account. Try again later.",
      };
    }

    const user = await authenticateAdmin(
      parsed.data.email,
      parsed.data.password,
    );
    if (!user) {
      return { ok: false, message: "Invalid email or password." };
    }

    await createAdminSession(user);
  } catch (error) {
    console.error("[login]", error);
    return {
      ok: false,
      message: "Unable to sign in right now. Please try again.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export type PasswordState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function changePasswordAction(
  _prevState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the password fields.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const row = await getAdminPasswordHash(user.id);
    if (!row || !row.is_active) {
      return { ok: false, message: "Account is no longer active." };
    }
    if (!verifyPassword(parsed.data.currentPassword, row.password_hash)) {
      return {
        ok: false,
        message: "Your current password is incorrect.",
        errors: { currentPassword: ["Incorrect password"] },
      };
    }

    const newVersion = await updateAdminPassword(user.id, parsed.data.newPassword);
    await createAdminSession({ id: user.id, sessionVersion: newVersion });
    return { ok: true, message: "Password updated. Other sessions signed out." };
  } catch (error) {
    console.error("[password-change]", error);
    return { ok: false, message: "Could not update the password." };
  }
}
