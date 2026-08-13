function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function ResponsavelAvatar({ fullName }: { fullName: string }) {
  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-white"
      title={fullName}
    >
      {initials(fullName)}
    </div>
  );
}
