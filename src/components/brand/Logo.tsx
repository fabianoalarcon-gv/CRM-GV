import Image from "next/image";
import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
  height?: number;
}

/**
 * Placeholder até BRAND-01/BRAND-03 substituírem por o logo oficial da Granvale.
 */
const LOGO_ASPECT_RATIO = 794 / 276;

export function Logo({ className, height = 32 }: LogoProps) {
  const width = height * LOGO_ASPECT_RATIO;

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo_logihub.png"
        alt="LogiHub"
        width={width}
        height={height}
        priority
        className="h-auto object-contain"
        style={{ height }}
      />
    </span>
  );
}
