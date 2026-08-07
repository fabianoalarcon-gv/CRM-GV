"use client";

import dynamic from "next/dynamic";
import type { Proposta } from "../types";

// dnd-kit gera ids internos (aria-describedby) que não batem entre servidor e
// cliente — desativar SSR pro board evita o mismatch de hidratação do React.
const Board = dynamic(() => import("./Board").then((mod) => mod.Board), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

function BoardSkeleton() {
  return (
    <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 w-72 shrink-0 animate-pulse rounded-xl bg-black/[.03]" />
      ))}
    </div>
  );
}

export interface BoardClientProps {
  initialPropostas: Proposta[];
}

export function BoardClient(props: BoardClientProps) {
  return <Board {...props} />;
}
