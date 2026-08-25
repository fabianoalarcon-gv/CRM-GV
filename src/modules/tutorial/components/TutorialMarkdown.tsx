import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Componentes customizados só pra resolver os dois tipos de link relativo
// que o manual usa: prints (screenshots/...) e cross-referências entre
// módulos (outro-modulo.md#ancora) — o resto do Markdown é renderizado
// como veio, estilizado via `prose` (plugin @tailwindcss/typography).
const components: Components = {
  img: ({ src, alt }) => {
    const resolvedSrc =
      typeof src === "string" && src.startsWith("screenshots/")
        ? `/api/tutorial-assets/${src.slice("screenshots/".length)}`
        : src;
    // eslint-disable-next-line @next/next/no-img-element -- dimensão de cada print varia, sem viabilidade de fixar width/height pro next/image aqui.
    return <img src={resolvedSrc} alt={alt ?? ""} loading="lazy" />;
  },
  a: ({ href, children }) => {
    const match = typeof href === "string" ? href.match(/^([\w-]+)\.md(#.*)?$/) : null;
    const resolvedHref = match ? `/tutorial/${match[1]}${match[2] ?? ""}` : href;
    return <a href={resolvedHref}>{children}</a>;
  },
};

export function TutorialMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-brand-accent prose-img:rounded-lg prose-img:border prose-img:border-border prose-th:text-left prose-blockquote:border-brand-accent prose-blockquote:not-italic">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
