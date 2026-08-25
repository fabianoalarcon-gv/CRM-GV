import fs from "node:fs";
import path from "node:path";

// Lê direto de docs/manual/ — fonte única do manual do usuário, sem
// duplicar conteúdo num banco. A lista de módulos vem do próprio
// indice.md (link numerado "N. [Título](slug.md)"), então reordenar ou
// renomear um módulo lá já reflete aqui sem precisar mexer em código.
const MANUAL_DIR = path.join(process.cwd(), "docs", "manual");

export interface TutorialModule {
  slug: string;
  title: string;
}

function readManualFile(filename: string): string {
  return fs.readFileSync(path.join(MANUAL_DIR, filename), "utf-8");
}

export function getTutorialModules(): TutorialModule[] {
  const indice = readManualFile("indice.md");
  const modules: TutorialModule[] = [];
  const lineRegex = /^\d+\.\s+\[(.+?)\]\((.+?)\.md\)/gm;
  let match: RegExpExecArray | null;
  while ((match = lineRegex.exec(indice)) !== null) {
    modules.push({ title: match[1], slug: match[2] });
  }
  return modules;
}

export function getTutorialModuleContent(slug: string): { title: string; content: string } | null {
  const modules = getTutorialModules();
  const currentModule = modules.find((m) => m.slug === slug);
  if (!currentModule) return null;

  // A página já mostra o título (vindo do indice.md) no seu próprio <h1> —
  // remove o "# Título" duplicado do topo de cada arquivo do manual.
  // Os arquivos usam CRLF (`\r\n`) — em regex JS, "." não casa "\r" (é
  // tratado como quebra de linha), por isso o corte usa [^\n] em vez de
  // ".+" pra não deixar o \r sobrando.
  const content = readManualFile(`${slug}.md`).replace(/^#[^\n]*(\r?\n)+/, "");

  return { title: currentModule.title, content };
}
