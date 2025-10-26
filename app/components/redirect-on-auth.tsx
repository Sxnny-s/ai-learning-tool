"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type RoleMeta = {
  publicMetadata?: { role?: string };
  unsafeMetadata?: { role?: string };
};

function getRoleFromUser(u: unknown): string | undefined {
  const meta = u as RoleMeta | null;
  return meta?.publicMetadata?.role ?? meta?.unsafeMetadata?.role;
}

export default function RedirectOnAuth() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    const role = getRoleFromUser(user);
    router.replace(role === "admin" ? "/admin" : "/student");
  }, [isSignedIn, user, router]);

  return null;
}
