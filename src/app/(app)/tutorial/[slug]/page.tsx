import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getTutorialModules, getTutorialModuleContent } from "@/lib/tutorial/content";
import { TutorialMarkdown } from "@/modules/tutorial/components/TutorialMarkdown";

export function generateStaticParams() {
  return getTutorialModules().map((tutorialModule) => ({ slug: tutorialModule.slug }));
}

export default async function TutorialModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tutorialModule = getTutorialModuleContent(slug);
  if (!tutorialModule) notFound();

  const modules = getTutorialModules();
  const currentIndex = modules.findIndex((m) => m.slug === slug);
  const previousModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <Link
          href="/tutorial"
          className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase hover:underline"
        >
          <Icon name="arrow_back" size={16} />
          Tutorial
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {tutorialModule.title}
        </h1>
      </div>

      <TutorialMarkdown content={tutorialModule.content} />

      <div className="flex items-center justify-between border-t border-border pt-4">
        {previousModule ? (
          <Link
            href={`/tutorial/${previousModule.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-graphite-light hover:text-foreground"
          >
            <Icon name="chevron_left" size={18} />
            {previousModule.title}
          </Link>
        ) : (
          <span />
        )}
        {nextModule && (
          <Link
            href={`/tutorial/${nextModule.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-graphite-light hover:text-foreground"
          >
            {nextModule.title}
            <Icon name="chevron_right" size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
