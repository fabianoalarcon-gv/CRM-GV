import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Card, CardContent } from "@/components/ui/Card";
import { getTutorialModules } from "@/lib/tutorial/content";
import { TUTORIAL_MODULE_ICON, DEFAULT_MODULE_ICON } from "@/modules/tutorial/constants";

export default function TutorialIndexPage() {
  const modules = getTutorialModules();

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">Ajuda</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Tutorial
        </h1>
        <p className="mt-1 text-sm text-brand-graphite-light">
          Passo a passo de cada tela do sistema, com prints reais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((tutorialModule, index) => (
          <Link key={tutorialModule.slug} href={`/tutorial/${tutorialModule.slug}`}>
            <Card className="h-full transition-colors hover:border-brand-accent">
              <CardContent className="flex h-full items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                  <Icon name={TUTORIAL_MODULE_ICON[tutorialModule.slug] ?? DEFAULT_MODULE_ICON} />
                </span>
                <div>
                  <p className="text-xs font-medium text-brand-graphite-light">
                    {index + 1}. módulo
                  </p>
                  <p className="font-semibold text-foreground">{tutorialModule.title}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
