"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentUser } from "./types";

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  value,
  children,
}: {
  value: CurrentUser | null;
  children: ReactNode;
}) {
  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext);
}

export function useIsAdmin(): boolean {
  return useCurrentUser()?.role === "admin";
}
