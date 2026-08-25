import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";

// Serve os prints de docs/manual/screenshots/ pro tutorial in-app — essa
// pasta fica fora de public/ (única servida automaticamente pelo Next) de
// propósito, pra não duplicar os prints nem tirá-los de onde o manual em
// Markdown (docs/manual/) já organiza tudo.
const SCREENSHOTS_DIR = path.join(process.cwd(), "docs", "manual", "screenshots");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  // A rota fica em api/, fora do matcher do proxy.ts (que faz a guarda de
  // sessão pro resto do app) — precisa checar autenticação aqui na mão.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path: segments } = await params;
  const resolved = path.join(SCREENSHOTS_DIR, ...segments);

  // Nunca deixa o caminho resolvido escapar de SCREENSHOTS_DIR (path traversal via "..").
  if (!resolved.startsWith(SCREENSHOTS_DIR + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(resolved).toLowerCase()];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(resolved);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
