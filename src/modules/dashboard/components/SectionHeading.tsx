export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    // Marcado pra exportação em PDF: evita deixar o título sozinho no fim de
    // uma página, com o conteúdo da seção jogado pra próxima (ver
    // ExportDashboardButton.tsx).
    <div data-export-heading="true">
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
