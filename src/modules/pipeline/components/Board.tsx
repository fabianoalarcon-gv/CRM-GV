"use client";

import { useState, useTransition, type ComponentType } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Column, type ColumnItemLabel } from "./Column";
import { updateProposalStatus } from "../actions";
import type { ProposalStatus, Proposta } from "../types";

export interface BoardProps {
  initialPropostas: Proposta[];
  columnStatuses: ProposalStatus[];
  CardComponent: ComponentType<{ proposta: Proposta }>;
  itemLabel?: ColumnItemLabel;
}

export function Board({ initialPropostas, columnStatuses, CardComponent, itemLabel }: BoardProps) {
  const [propostas, setPropostas] = useState(initialPropostas);
  const [, startTransition] = useTransition();

  // initialPropostas chega de novo (com dados atualizados) sempre que uma
  // Server Action revalida a rota — sem isso, o board só refletiria edições
  // feitas no modal (Salvar, Excluir, Ações) depois de um reload completo.
  // Ajuste de estado durante a renderização (padrão recomendado pelo React
  // pra "resetar" estado quando uma prop muda), não em useEffect.
  const [prevInitialPropostas, setPrevInitialPropostas] = useState(initialPropostas);
  if (initialPropostas !== prevInitialPropostas) {
    setPrevInitialPropostas(initialPropostas);
    setPropostas(initialPropostas);
  }
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const proposalId = Number(active.id);
    const newStatusId = Number(over.id);
    const proposta = propostas.find((p) => p.id === proposalId);
    if (!proposta || proposta.status_id === newStatusId) return;

    const previousStatusId = proposta.status_id;
    setPropostas((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status_id: newStatusId } : p)),
    );

    startTransition(async () => {
      const result = await updateProposalStatus(proposalId, newStatusId);
      if (result.error) {
        setPropostas((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status_id: previousStatusId } : p)),
        );
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 items-start gap-4 overflow-x-auto pb-4">
        {columnStatuses.map((status) => (
          <Column
            key={status.id}
            status={status}
            propostas={propostas.filter((p) => p.status_id === status.id)}
            CardComponent={CardComponent}
            itemLabel={itemLabel}
          />
        ))}
      </div>
    </DndContext>
  );
}
