import type { SVGProps } from "react";

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function PipelineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="10" rx="1.5" />
      <rect x="17" y="4" width="4" height="7" rx="1.5" />
    </svg>
  );
}

function ClientsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.25c2.62.35 4.5 2.75 4.5 5.75" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: DashboardIcon },
  { label: "Pipeline Comercial", href: "/pipeline", icon: PipelineIcon },
  { label: "Clientes", href: "/clientes", icon: ClientsIcon },
  { label: "Calendário", href: "/calendario", icon: CalendarIcon },
];
