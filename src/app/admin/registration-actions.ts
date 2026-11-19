"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { deleteRegistration, updateRegistration } from "@/lib/registrations";
import { formatZodErrors, registrationUpdateSchema } from "@/lib/validation";

export type RegistrationActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function updateRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "registration:update")) {
    return { ok: false, message: "You do not have permission to update entries." };
  }

  const id = String(formData.get("id") ?? "");
  const parsed = registrationUpdateSchema.safeParse({
    status: formData.get("status"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Choose a valid status.",
      errors: formatZodErrors(parsed.error),
    };
  }

  if (!id) return { ok: false, message: "Registration not found." };

  const updated = await updateRegistration(id, parsed.data.status, parsed.data.notes);
  if (!updated) return { ok: false, message: "Registration not found." };

  revalidatePath("/admin");
  revalidatePath("/admin/registrations");
  return { ok: true, message: "Registration updated." };
}

export async function deleteRegistrationAction(formData: FormData) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "registration:update")) {
    redirect("/admin/registrations?error=forbidden");
  }

  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteRegistration(id);
    revalidatePath("/admin");
    revalidatePath("/admin/registrations");
  }
  redirect("/admin/registrations?deleted=1");
}
