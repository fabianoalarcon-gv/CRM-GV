"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { EmpresaListItem } from "../types";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ExportEmpresasButton({ empresas }: { empresas: EmpresaListItem[] }) {
  function handleExport() {
    const header = ["Nome", "Setor", "Endereço", "Cadastrado em"];
    const rows = empresas.map((c) => [
      c.nome,
      c.setor ?? "",
      c.endereco ?? "",
      new Date(c.created_at).toLocaleDateString("pt-BR"),
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `empresas-logihub-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoga com um pequeno atraso: revogar na hora pode cancelar o download
    // em alguns navegadores, já que o clique só inicia o processo de forma assíncrona.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Button type="button" variant="outline" onClick={handleExport} className="gap-1.5">
      <Icon name="download" size={18} />
      Exportar
    </Button>
  );
}
