import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CurrentUserProvider } from "@/lib/auth/context";
import { getCurrentUser } from "@/lib/auth/profile";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <CurrentUserProvider value={currentUser}>
      <AppShell>{children}</AppShell>
    </CurrentUserProvider>
  );
}
