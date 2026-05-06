"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { usePDF, type DocumentProps } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ActionIcon,
  Group,
  Loader,
  Stack,
  Text,
  ScrollArea,
  Tooltip,
  Box,
  SegmentedControl,
} from "@mantine/core";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// CDN-hosted worker matching the installed pdfjs version. Avoids copying
// the worker bundle into /public on every deploy and works with Turbopack.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const A4_RATIO = 297 / 210; // height / width

type FitMode = "page" | "width";

interface PageDims {
  width: number;
  height: number;
}

/**
 * Live PDF preview with two stacked `react-pdf` layers that crossfade.
 *
 *   - Bottom layer = currently committed render. Always shown.
 *   - Top layer    = the next render in flight, mounted at opacity 0.
 *                    When its first page reports `onRenderSuccess` we fade
 *                    it to opacity 1; on transition end we promote it to
 *                    the committed render and unmount the now-redundant
 *                    bottom layer.
 *
 * This eliminates the white flash you used to get when the URL swapped:
 * the old canvas stays visible until the new one is fully painted, then
 * crossfades. Save / debounced edits both feel smooth.
 *
 * The toolbar (zoom + fit mode) is a floating glass pill in the top-right
 * — out of the way of the document, but always reachable.
 */
export function LivePdfPreview({
  document: pdfDocument,
  ariaLabel = "Live invoice preview",
}: {
  document: ReactElement<DocumentProps>;
  ariaLabel?: string;
}) {
  const [instance, updateInstance] = usePDF({ document: pdfDocument });

  useEffect(() => {
    updateInstance(pdfDocument);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument]);

  // What the user currently sees.
  const [committedUrl, setCommittedUrl] = useState<string | null>(null);
  // The next blob (still being painted). Only set once instance.loading=false.
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  // Becomes true once the front layer has actually drawn its first page.
  const [pendingPainted, setPendingPainted] = useState(false);

  useEffect(() => {
    if (instance.loading || instance.error || !instance.url) return;
    if (instance.url === committedUrl) return;
    if (instance.url === pendingUrl) return;
    // First-ever render → commit straight away (no crossfade needed).
    if (committedUrl === null) {
      setCommittedUrl(instance.url);
      return;
    }
    // Otherwise stage a crossfade: mount the new URL on the top layer.
    setPendingUrl(instance.url);
    setPendingPainted(false);
  }, [
    instance.url,
    instance.loading,
    instance.error,
    committedUrl,
    pendingUrl,
  ]);

  // Promote the pending URL after the fade-in completes.
  const promotePending = () => {
    if (pendingUrl) {
      setCommittedUrl(pendingUrl);
      setPendingUrl(null);
      setPendingPainted(false);
    }
  };

  // Container size (drives fit-mode math).
  const outerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerSize({
          w: Math.floor(e.contentRect.width),
          h: Math.floor(e.contentRect.height),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [fitMode, setFitMode] = useState<FitMode>("page");
  const [zoom, setZoom] = useState<number>(1);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageDims, setPageDims] = useState<PageDims | null>(null);

  const ratio = pageDims ? pageDims.height / pageDims.width : A4_RATIO;
  const verticalChrome = 32; // scroll padding only (toolbar is floating)
  const scrollAreaH = Math.max(0, containerSize.h - verticalChrome);
  const sidePadding = 24;
  const widthFitWidth = Math.max(0, containerSize.w - sidePadding);
  const widthFitPage = Math.max(0, scrollAreaH / ratio);
  const baseWidth =
    fitMode === "width" ? widthFitWidth : Math.min(widthFitWidth, widthFitPage);
  const pageWidth = Math.max(120, Math.floor(baseWidth * zoom));

  const committedFile = useMemo(
    () => (committedUrl ? { url: committedUrl } : null),
    [committedUrl],
  );
  const pendingFile = useMemo(
    () => (pendingUrl ? { url: pendingUrl } : null),
    [pendingUrl],
  );

  const isUpdating = instance.loading || pendingUrl !== null;

  return (
    <Box
      ref={outerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--raseed-page-bg)",
      }}
    >
      {/* Initial empty state */}
      {!committedUrl ? (
        <Stack align="center" justify="center" h="100%" gap="xs">
          <Loader size="sm" color="brand" />
          <Text size="xs" c="dimmed">
            Generating preview…
          </Text>
        </Stack>
      ) : (
        <ScrollArea
          type="auto"
          scrollbarSize={8}
          h="100%"
          aria-label={ariaLabel}
        >
          <Stack align="center" gap={12} py={16} px={12}>
            <Box
              style={{
                position: "relative",
                width: pageWidth || undefined,
              }}
            >
              {/* BACK LAYER — currently committed render. */}
              <PdfLayer
                file={committedFile}
                pageWidth={pageWidth}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                onFirstPageDims={(p) => {
                  if (!pageDims || pageDims.width !== p.width) {
                    setPageDims({ width: p.width, height: p.height });
                  }
                }}
                numPagesHint={numPages}
              />
              {/* FRONT LAYER — pending render, fades in on top. */}
              {pendingFile ? (
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: pendingPainted ? 1 : 0,
                    transition: "opacity 220ms ease",
                    pointerEvents: pendingPainted ? "auto" : "none",
                    willChange: "opacity",
                  }}
                  onTransitionEnd={(e) => {
                    if (
                      e.propertyName === "opacity" &&
                      pendingPainted &&
                      pendingUrl
                    ) {
                      promotePending();
                    }
                  }}
                >
                  <PdfLayer
                    file={pendingFile}
                    pageWidth={pageWidth}
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    onFirstPagePainted={() => setPendingPainted(true)}
                    onFirstPageDims={(p) => {
                      if (!pageDims || pageDims.width !== p.width) {
                        setPageDims({ width: p.width, height: p.height });
                      }
                    }}
                    numPagesHint={numPages}
                  />
                </Box>
              ) : null}
            </Box>
          </Stack>
        </ScrollArea>
      )}

      {/* Floating toolbar — top-right, glass pill. */}
      <Group
        gap={4}
        wrap="nowrap"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
          border: "1px solid var(--raseed-hairline)",
          boxShadow:
            "0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 32px -16px rgba(15, 23, 42, 0.18)",
        }}
      >
        <Tooltip label="Zoom out" withArrow openDelay={350}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius="xl"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
            aria-label="Zoom out"
          >
            <IconZoomOut size={15} />
          </ActionIcon>
        </Tooltip>
        <SegmentedControl
          size="xs"
          radius="xl"
          value={fitMode}
          onChange={(v) => {
            setFitMode(v as FitMode);
            setZoom(1);
          }}
          data={[
            { value: "page", label: "Fit page" },
            { value: "width", label: "Fit width" },
          ]}
          styles={{
            root: { background: "transparent", border: "none" },
          }}
        />
        <Tooltip label="Zoom in" withArrow openDelay={350}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius="xl"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
            aria-label="Zoom in"
          >
            <IconZoomIn size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Subtle "Updating preview" pill — bottom-right. */}
      {isUpdating && committedUrl ? (
        <Box
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: "var(--raseed-surface)",
            border: "1px solid var(--raseed-hairline)",
            boxShadow: "0 4px 16px -8px rgba(15, 23, 42, 0.18)",
            fontSize: 11,
            color: "var(--raseed-muted)",
            pointerEvents: "none",
            opacity: 0.92,
          }}
          aria-live="polite"
        >
          <Loader size={10} color="brand" />
          Updating preview
        </Box>
      ) : null}

      {/* Page counter — bottom-left, subtle. */}
      {numPages > 0 && committedUrl ? (
        <Box
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "3px 8px",
            borderRadius: 999,
            background: "var(--raseed-surface)",
            border: "1px solid var(--raseed-hairline)",
            fontSize: 11,
            color: "var(--raseed-muted)",
            pointerEvents: "none",
          }}
        >
          {numPages === 1 ? "1 page" : `${numPages} pages`}
        </Box>
      ) : null}
    </Box>
  );
}

/**
 * One pdfjs <Document> + page list. Reused for the back (committed) and
 * front (pending) crossfade layers.
 */
function PdfLayer({
  file,
  pageWidth,
  numPagesHint,
  onLoadSuccess,
  onFirstPagePainted,
  onFirstPageDims,
}: {
  file: { url: string } | null;
  pageWidth: number;
  numPagesHint: number;
  onLoadSuccess?: (info: { numPages: number }) => void;
  onFirstPagePainted?: () => void;
  onFirstPageDims?: (p: { width: number; height: number }) => void;
}) {
  // Local count: react-pdf needs to know how many pages to render *for
  // this Document instance*. We hint with `numPagesHint` for the initial
  // render, then update onLoadSuccess.
  const [count, setCount] = useState<number>(numPagesHint || 1);

  useEffect(() => {
    if (numPagesHint) setCount(numPagesHint);
  }, [numPagesHint]);

  if (!file) return null;

  return (
    <Document
      file={file}
      onLoadSuccess={(info) => {
        setCount(info.numPages);
        onLoadSuccess?.(info);
      }}
      loading={null}
      error={
        <Text size="xs" c="red">
          Could not render preview.
        </Text>
      }
      noData={null}
    >
      <Stack gap={12}>
        {Array.from({ length: count }, (_, i) => (
          <Box
            key={`page_${i + 1}`}
            style={{
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.06), 0 16px 36px -18px rgba(15, 23, 42, 0.22)",
              borderRadius: 6,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <Page
              pageNumber={i + 1}
              width={pageWidth || undefined}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={null}
              onRenderSuccess={() => {
                if (i === 0) onFirstPagePainted?.();
              }}
              onLoadSuccess={(p) => {
                if (i === 0)
                  onFirstPageDims?.({ width: p.width, height: p.height });
              }}
            />
          </Box>
        ))}
      </Stack>
    </Document>
  );
}
