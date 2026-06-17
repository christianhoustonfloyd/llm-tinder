"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type RegisterState = { error?: string } | null;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and a password of 6+ characters." };
  }

  const { email, password } = parsed.data;
  const name = parsed.data.name ? parsed.data.name : null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash } });

  redirect("/login?registered=1");
}
