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

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const A4_RATIO = 297 / 210;

type FitMode = "page" | "width";
type SlotKey = "a" | "b";
interface PageDims {
  width: number;
  height: number;
}
interface Slot {
  url: string | null;
  painted: boolean;
}

/**
 * Live PDF preview using a stable two-slot ping-pong crossfade.
 *
 * Each slot persistently holds one rendered PDF blob. The "active" slot
 * is shown at opacity 1; the other sits underneath at opacity 0. New
 * urls always go into the *inactive* slot — the active slot's `file`
 * prop is never swapped, so react-pdf never refetches the canvas the
 * user is currently looking at. Once the inactive slot finishes painting
 * its first page we flip which slot is active (CSS opacity transition).
 *
 * This eliminates the brief blank flash the previous "promote URL into
 * the back layer" approach produced.
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

  const [slotA, setSlotA] = useState<Slot>({ url: null, painted: false });
  const [slotB, setSlotB] = useState<Slot>({ url: null, painted: false });
  const [active, setActive] = useState<SlotKey>("a");

  const writeSlot = (key: SlotKey, next: Slot) => {
    if (key === "a") setSlotA(next);
    else setSlotB(next);
  };

  // Push new urls into the inactive slot. (Or the active slot on first ever render.)
  useEffect(() => {
    if (instance.loading || instance.error || !instance.url) return;
    const url = instance.url;
    if (slotA.url === url || slotB.url === url) return;

    const activeSlot = active === "a" ? slotA : slotB;
    if (!activeSlot.url) {
      writeSlot(active, { url, painted: false });
      return;
    }
    const inactive: SlotKey = active === "a" ? "b" : "a";
    writeSlot(inactive, { url, painted: false });
  }, [instance.url, instance.loading, instance.error, slotA, slotB, active]);

  const handleFirstPagePainted = (key: SlotKey) => {
    if (key === "a") setSlotA((s) => (s.painted ? s : { ...s, painted: true }));
    else setSlotB((s) => (s.painted ? s : { ...s, painted: true }));
    if (key !== active) setActive(key);
  };

  // Container size for fit-mode math.
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
  const verticalChrome = 32;
  const scrollAreaH = Math.max(0, containerSize.h - verticalChrome);
  const sidePadding = 24;
  const widthFitWidth = Math.max(0, containerSize.w - sidePadding);
  const widthFitPage = Math.max(0, scrollAreaH / ratio);
  const baseWidth =
    fitMode === "width" ? widthFitWidth : Math.min(widthFitWidth, widthFitPage);
  const pageWidth = Math.max(120, Math.floor(baseWidth * zoom));

  const slotAFile = useMemo(
    () => (slotA.url ? { url: slotA.url } : null),
    [slotA.url],
  );
  const slotBFile = useMemo(
    () => (slotB.url ? { url: slotB.url } : null),
    [slotB.url],
  );

  const activeSlot = active === "a" ? slotA : slotB;
  const inactiveSlot = active === "a" ? slotB : slotA;
  const hasAnyVisible = !!activeSlot.url;
  const isUpdating =
    instance.loading || (!!inactiveSlot.url && !inactiveSlot.painted);

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
      {!hasAnyVisible ? (
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
              style={{ position: "relative", width: pageWidth || undefined }}
            >
              <SlotLayer
                slotKey="a"
                isActive={active === "a"}
                file={slotAFile}
                pageWidth={pageWidth}
                numPagesHint={numPages}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                onFirstPagePainted={() => handleFirstPagePainted("a")}
                onFirstPageDims={(p) => {
                  if (!pageDims || pageDims.width !== p.width) {
                    setPageDims({ width: p.width, height: p.height });
                  }
                }}
              />
              <SlotLayer
                slotKey="b"
                isActive={active === "b"}
                file={slotBFile}
                pageWidth={pageWidth}
                numPagesHint={numPages}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                onFirstPagePainted={() => handleFirstPagePainted("b")}
                onFirstPageDims={(p) => {
                  if (!pageDims || pageDims.width !== p.width) {
                    setPageDims({ width: p.width, height: p.height });
                  }
                }}
              />
            </Box>
          </Stack>
        </ScrollArea>
      )}

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
          styles={{ root: { background: "transparent", border: "none" } }}
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

      {isUpdating && hasAnyVisible ? (
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

      {numPages > 0 && hasAnyVisible ? (
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

function SlotLayer({
  slotKey,
  isActive,
  file,
  pageWidth,
  numPagesHint,
  onLoadSuccess,
  onFirstPagePainted,
  onFirstPageDims,
}: {
  slotKey: SlotKey;
  isActive: boolean;
  file: { url: string } | null;
  pageWidth: number;
  numPagesHint: number;
  onLoadSuccess?: (info: { numPages: number }) => void;
  onFirstPagePainted?: () => void;
  onFirstPageDims?: (p: { width: number; height: number }) => void;
}) {
  return (
    <Box
      data-slot={slotKey}
      style={{
        position: isActive ? "relative" : "absolute",
        inset: isActive ? undefined : 0,
        opacity: isActive ? 1 : 0,
        transition: "opacity 220ms ease",
        pointerEvents: isActive ? "auto" : "none",
        willChange: "opacity",
      }}
    >
      <PdfLayer
        file={file}
        pageWidth={pageWidth}
        numPagesHint={numPagesHint}
        onLoadSuccess={onLoadSuccess}
        onFirstPagePainted={onFirstPagePainted}
        onFirstPageDims={onFirstPageDims}
      />
    </Box>
  );
}

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
