export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
