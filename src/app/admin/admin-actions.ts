"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import {
  countActiveSuperAdmins,
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  updateAdminUser,
} from "@/lib/admins";
import { ROLES, type Role } from "@/lib/constants";
import {
  adminCreateSchema,
  formBoolean,
  formatZodErrors,
} from "@/lib/validation";

export type TeamActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function asRole(value: FormDataEntryValue | null): Role | null {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : null;
}

export async function createAdminAction(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "admin:manage")) {
    return { ok: false, message: "Only super admins can manage access." };
  }

  const parsed = adminCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the new account details.",
      errors: formatZodErrors(parsed.error),
    };
  }

  const result = await createAdminUser({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    password: parsed.data.password,
  });

  if (!result.ok) return { ok: false, message: result.message };

  revalidatePath("/admin/team");
  return { ok: true, message: "Team member added." };
}

export async function updateAdminAction(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await getAdminSession();
  if (!actor) redirect("/admin/login");
  if (!can(actor.role, "admin:manage")) {
    return { ok: false, message: "Only super admins can manage access." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = asRole(formData.get("role"));
  const isActive = formBoolean(formData.get("isActive"));

  if (!id || name.length < 2 || name.length > 60) {
    return { ok: false, message: "Enter a valid name." };
  }
  if (!role) return { ok: false, message: "Choose a valid role." };

  const target = await getAdminUser(id);
  if (!target) return { ok: false, message: "Account not found." };

  if (target.id === actor.id && !isActive) {
    return { ok: false, message: "You cannot deactivate your own account." };
  }

  if (
    target.role === "super_admin" &&
    (role !== "super_admin" || !isActive)
  ) {
    const superAdmins = await countActiveSuperAdmins();
    if (superAdmins <= 1) {
      return {
        ok: false,
        message: "Keep at least one active super admin on the team.",
      };
    }
  }

  await updateAdminUser(id, { name, role, isActive });
  revalidatePath("/admin/team");
  return { ok: true, message: "Access updated." };
}

export async function deleteAdminAction(formData: FormData) {
  const actor = await getAdminSession();
  if (!actor) redirect("/admin/login");
  if (!can(actor.role, "admin:manage")) {
    redirect("/admin/team?error=forbidden");
  }

  const id = String(formData.get("id") ?? "");
  if (!id || id === actor.id) {
    redirect("/admin/team?error=self");
  }

  const target = await getAdminUser(id);
  if (!target) redirect("/admin/team?error=missing");

  if (target.role === "super_admin") {
    const superAdmins = await countActiveSuperAdmins();
    if (superAdmins <= 1) {
      redirect("/admin/team?error=last-super-admin");
    }
  }

  await deleteAdminUser(id);
  revalidatePath("/admin/team");
  redirect("/admin/team?deleted=1");
}
