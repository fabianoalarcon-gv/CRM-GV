"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface ExportDashboardButtonProps {
  targetRef: RefObject<HTMLElement | null>;
}

const FILE_BASENAME = "dashboard-comercial";
const PIXEL_RATIO = 2;
const PNG_MARGIN_PX = 32 * PIXEL_RATIO;
const PDF_MARGIN_PT = 24;
const PDF_BLOCK_GAP_PT = 16;

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

// O próprio botão/menu de exportação não deve aparecer no PNG/PDF gerado —
// é controle de UI, não conteúdo do relatório.
function exportFilter(node: HTMLElement): boolean {
  return node?.dataset?.exportExclude !== "true";
}

// html-to-image (em vez de html2canvas): desenha via SVG foreignObject e
// deixa o próprio motor do navegador pintar os estilos, então CSS moderno
// (color-mix/oklab, usado pelos utilitários de opacidade do Tailwind v4 tipo
// bg-black/[.04]) funciona sem precisar reimplementar um parser de cor.
async function captureElementCanvas(
  element: HTMLElement,
  fontEmbedCSS?: string,
): Promise<HTMLCanvasElement> {
  const { toCanvas } = await import("html-to-image");
  return toCanvas(element, {
    pixelRatio: PIXEL_RATIO,
    backgroundColor: "#ffffff",
    filter: exportFilter,
    ...(fontEmbedCSS !== undefined ? { fontEmbedCSS } : {}),
  });
}

// Cola o canvas capturado num canvas maior com fundo branco ao redor, pra
// imagem não ficar com texto/gráfico colado na borda.
function withMargin(canvas: HTMLCanvasElement, marginPx: number): HTMLCanvasElement {
  const padded = document.createElement("canvas");
  padded.width = canvas.width + marginPx * 2;
  padded.height = canvas.height + marginPx * 2;
  const ctx = padded.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(canvas, marginPx, marginPx);
  }
  return padded;
}

export function ExportDashboardButton({ targetRef }: ExportDashboardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportImage() {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const element = targetRef.current;
      if (!element) return;
      const { getFontEmbedCSS } = await import("html-to-image");
      const fontEmbedCSS = await getFontEmbedCSS(element);
      const canvas = await captureElementCanvas(element, fontEmbedCSS);
      const padded = withMargin(canvas, PNG_MARGIN_PX);
      downloadDataUrl(padded.toDataURL("image/png"), `${FILE_BASENAME}-${todayStamp()}.png`);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportPdf() {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const element = targetRef.current;
      if (!element) return;

      // Captura cada bloco de topo (título+filtros, cada card/tabela, cada
      // SectionHeading) separado, em vez de uma imagem única fatiada por
      // pixel — assim dá pra decidir, bloco a bloco, se ele cabe inteiro no
      // espaço restante da página atual ou se precisa pular pra próxima,
      // sem nunca cortar um card ao meio.
      const blocks = Array.from(element.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      if (blocks.length === 0) return;

      // Calculado uma vez sobre o elemento inteiro e reaproveitado em cada
      // captura de bloco abaixo — sem isso, toCanvas escaneia todas as
      // stylesheets da página (incluindo a fonte do Google, que falha por
      // CORS) de novo a cada um dos ~13 blocos, o que deixava a exportação
      // em PDF bem mais lenta que a de imagem única.
      const { getFontEmbedCSS } = await import("html-to-image");
      const fontEmbedCSS = await getFontEmbedCSS(element);

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - PDF_MARGIN_PT * 2;
      const maxContentHeight = pageHeight - PDF_MARGIN_PT * 2;

      let cursorY = PDF_MARGIN_PT;
      let hasContentOnPage = false;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const canvas = await captureElementCanvas(block, fontEmbedCSS);
        const scale = contentWidth / canvas.width;
        const heightPt = canvas.height * scale;

        // Título de seção (ex: "Indicadores de Leads") sozinho no fim da
        // página, com o card seguinte jogado pra próxima, fica com cara de
        // erro — se for um título, soma a altura do próximo bloco antes de
        // decidir se precisa pular de página.
        const isHeading = block.dataset.exportHeading === "true";
        const nextBlock = isHeading ? blocks[i + 1] : null;
        let combinedHeightPt = heightPt;
        if (nextBlock) {
          const nextScale = contentWidth / nextBlock.scrollWidth;
          combinedHeightPt += nextBlock.scrollHeight * nextScale + PDF_BLOCK_GAP_PT;
        }

        // Bloco (ou par título+próximo bloco) mais alto que uma página
        // inteira — não tem como manter inteiro, cai pro fatiamento por
        // pixel só nesse bloco específico.
        if (heightPt > maxContentHeight) {
          if (hasContentOnPage) {
            pdf.addPage();
            cursorY = PDF_MARGIN_PT;
          }
          const pageHeightPx = Math.floor(maxContentHeight / scale);
          let renderedPx = 0;
          let firstSlice = true;
          let lastSliceHeightPt = 0;
          while (renderedPx < canvas.height) {
            const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceHeightPx;
            const ctx = sliceCanvas.getContext("2d");
            if (ctx) {
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
              if (!firstSlice) pdf.addPage();
              lastSliceHeightPt = sliceHeightPx * scale;
              pdf.addImage(
                sliceCanvas.toDataURL("image/png"),
                "PNG",
                PDF_MARGIN_PT,
                PDF_MARGIN_PT,
                contentWidth,
                lastSliceHeightPt,
              );
            }
            renderedPx += sliceHeightPx;
            firstSlice = false;
          }
          cursorY = PDF_MARGIN_PT + lastSliceHeightPt + PDF_BLOCK_GAP_PT;
          hasContentOnPage = true;
          continue;
        }

        // Bloco (ou par título+próximo) não cabe no espaço restante da
        // página atual — em vez de cortar no meio, pula pra próxima página
        // inteiro.
        if (hasContentOnPage && cursorY + combinedHeightPt > PDF_MARGIN_PT + maxContentHeight) {
          pdf.addPage();
          cursorY = PDF_MARGIN_PT;
          hasContentOnPage = false;
        }

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          PDF_MARGIN_PT,
          cursorY,
          contentWidth,
          heightPt,
        );
        cursorY += heightPt + PDF_BLOCK_GAP_PT;
        hasContentOnPage = true;
      }

      pdf.save(`${FILE_BASENAME}-${todayStamp()}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="relative" data-export-exclude="true">
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
