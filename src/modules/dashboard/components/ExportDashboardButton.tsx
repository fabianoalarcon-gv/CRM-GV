"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface ExportDashboardButtonProps {
  targetRef: RefObject<HTMLElement | null>;
}

const FILE_BASENAME = "dashboard-comercial";

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ExportDashboardButton({ targetRef }: ExportDashboardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function captureCanvas(): Promise<HTMLCanvasElement | null> {
    const element = targetRef.current;
    if (!element) return null;

    // html-to-image (em vez de html2canvas): desenha via SVG foreignObject e
    // deixa o próprio motor do navegador pintar os estilos, então CSS
    // moderno (color-mix/oklab, usado pelos utilitários de opacidade do
    // Tailwind v4 tipo bg-black/[.04]) funciona sem precisar reimplementar
    // um parser de cor.
    const { toCanvas } = await import("html-to-image");
    return toCanvas(element, { pixelRatio: 2, backgroundColor: "#ffffff" });
  }

  async function handleExportImage() {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      downloadDataUrl(canvas.toDataURL("image/png"), `${FILE_BASENAME}-${todayStamp()}.png`);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportPdf() {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Escala definida pela largura da pagina; a altura equivalente em
      // pixels do canvas indica onde cada corte de pagina acontece, pra
      // paginar o conteudo (que e bem mais alto que uma pagina) em varias
      // paginas horizontais em vez de espremer tudo numa so.
      const scale = pageWidth / canvas.width;
      const pageHeightPx = Math.floor(pageHeight / scale);

      let renderedPx = 0;
      let isFirstPage = true;

      while (renderedPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          renderedPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx,
        );

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(
          sliceCanvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          pageWidth,
          sliceHeightPx * scale,
        );

        renderedPx += sliceHeightPx;
        isFirstPage = false;
      }

      pdf.save(`${FILE_BASENAME}-${todayStamp()}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isExporting}
      >
        <Icon name="download" size={18} />
        {isExporting ? "Exportando…" : "Exportar"}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground hover:bg-black/[.03]"
            >
              <Icon name="picture_as_pdf" size={18} className="text-brand-graphite-light" />
              Exportar como PDF
            </button>
            <button
              type="button"
              onClick={handleExportImage}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground hover:bg-black/[.03]"
            >
              <Icon name="image" size={18} className="text-brand-graphite-light" />
              Exportar como Imagem
            </button>
          </div>
        </>
      )}
    </div>
  );
}
