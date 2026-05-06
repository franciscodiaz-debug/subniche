"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import {
  formatCurrency,
  getPriceRangeLabel,
  histogramBars,
  priceRangeToSlider,
  sliderToPriceRange,
} from "@/components/marketplace/filter-options";
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  type PriceRangeFilter,
} from "@/lib/marketplace-filters";
import { cn } from "@/lib/utils";

type PriceHistogramControlProps = {
  id: string;
  value: PriceRangeFilter;
  onChange: (value: PriceRangeFilter) => void;
};

export function PriceHistogramControl({
  id,
  value,
  onChange,
}: PriceHistogramControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingHandleRef = useRef<"min" | "max" | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<"min" | "max" | null>(
    null,
  );
  const { min: minValue, max: maxValue } = priceRangeToSlider(value);
  const minRatio = minValue / DEFAULT_MAX_PRICE;
  const maxRatio = maxValue / DEFAULT_MAX_PRICE;

  function handleMinChange(nextMin: number) {
    const price = Number.isFinite(nextMin) ? nextMin : DEFAULT_MIN_PRICE;

    onChange(sliderToPriceRange(Math.min(price, maxValue), maxValue));
  }

  function handleMaxChange(nextMax: number) {
    const price = Number.isFinite(nextMax) ? nextMax : DEFAULT_MAX_PRICE;

    onChange(sliderToPriceRange(minValue, Math.max(price, minValue)));
  }

  function getPriceFromClientX(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();

    if (!rect) {
      return DEFAULT_MIN_PRICE;
    }

    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width),
    );

    return Math.round(
      DEFAULT_MIN_PRICE + ratio * (DEFAULT_MAX_PRICE - DEFAULT_MIN_PRICE),
    );
  }

  function updateHandleFromPointer(
    handle: "min" | "max",
    event: PointerEvent<HTMLElement>,
  ) {
    updateHandleFromClientX(handle, event.clientX);
  }

  function updateHandleFromClientX(handle: "min" | "max", clientX: number) {
    const price = getPriceFromClientX(clientX);

    if (handle === "min") {
      handleMinChange(price);
      return;
    }

    handleMaxChange(price);
  }

  function handleMouseDown(
    handle: "min" | "max",
    event: ReactMouseEvent<HTMLElement>,
  ) {
    event.preventDefault();
    draggingHandleRef.current = handle;
    setDraggingHandle(handle);
    updateHandleFromClientX(handle, event.clientX);
  }

  function handlePointerDown(
    handle: "min" | "max",
    event: PointerEvent<HTMLElement>,
  ) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingHandleRef.current = handle;
    setDraggingHandle(handle);
    updateHandleFromPointer(handle, event);
  }

  function handlePointerMove(
    handle: "min" | "max",
    event: PointerEvent<HTMLElement>,
  ) {
    if (draggingHandleRef.current !== handle) {
      return;
    }

    updateHandleFromPointer(handle, event);
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (draggingHandleRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      draggingHandleRef.current = null;
      setDraggingHandle(null);
    }
  }

  useEffect(() => {
    if (!draggingHandle) {
      return;
    }

    function handleDocumentMouseMove(event: MouseEvent) {
      const handle = draggingHandleRef.current;

      if (!handle) {
        return;
      }

      updateHandleFromClientX(handle, event.clientX);
    }

    function handleDocumentPointerMove(event: globalThis.PointerEvent) {
      const handle = draggingHandleRef.current;

      if (!handle) {
        return;
      }

      updateHandleFromClientX(handle, event.clientX);
    }

    function handleDocumentDragEnd() {
      draggingHandleRef.current = null;
      setDraggingHandle(null);
    }

    document.addEventListener("pointermove", handleDocumentPointerMove);
    document.addEventListener("pointerup", handleDocumentDragEnd);
    document.addEventListener("pointercancel", handleDocumentDragEnd);
    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentDragEnd);

    return () => {
      document.removeEventListener("pointermove", handleDocumentPointerMove);
      document.removeEventListener("pointerup", handleDocumentDragEnd);
      document.removeEventListener("pointercancel", handleDocumentDragEnd);
      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleDocumentDragEnd);
    };
  });

  return (
    <div
      className="rounded-lg border border-border bg-card p-3"
      data-testid="price-histogram-control"
    >
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span id={`${id}-label`}>Price range</span>
        <span className="font-semibold text-foreground">
          {getPriceRangeLabel(value)}
        </span>
      </div>
      <div className="mt-4 flex h-16 items-end gap-1" aria-hidden="true">
        {histogramBars.map((height, index) => {
          const barRatio = (index + 0.5) / histogramBars.length;

          return (
            <span
              key={index}
              className={cn(
                "flex-1 rounded-t transition-colors",
                barRatio >= minRatio && barRatio <= maxRatio
                  ? "bg-primary/80"
                  : "bg-muted",
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
      <div
        className="relative mt-3 h-8"
        aria-labelledby={`${id}-label`}
        data-testid="price-range-track"
        ref={trackRef}
      >
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted">
          <span
            className="absolute top-0 h-full rounded-full bg-primary"
            style={{
              left: `${minRatio * 100}%`,
              width: `${(maxRatio - minRatio) * 100}%`,
            }}
          />
        </div>
        <input
          aria-label="Lower price handle"
          aria-valuetext={formatCurrency(minValue)}
          type="range"
          min={DEFAULT_MIN_PRICE}
          max={DEFAULT_MAX_PRICE}
          step="1"
          value={minValue}
          onChange={(event) => handleMinChange(Number(event.target.value))}
          className="price-range-input absolute inset-x-0 top-1/2 z-20 -translate-y-1/2"
        />
        <input
          aria-label="Upper price handle"
          aria-valuetext={formatCurrency(maxValue)}
          type="range"
          min={DEFAULT_MIN_PRICE}
          max={DEFAULT_MAX_PRICE}
          step="1"
          value={maxValue}
          onChange={(event) => handleMaxChange(Number(event.target.value))}
          className="price-range-input absolute inset-x-0 top-1/2 z-30 -translate-y-1/2"
        />
        <span
          aria-hidden="true"
          data-testid="lower-price-drag-handle"
          onMouseDown={(event) => handleMouseDown("min", event)}
          onPointerDown={(event) => handlePointerDown("min", event)}
          onPointerMove={(event) => handlePointerMove("min", event)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            "absolute top-1/2 z-40 size-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-background bg-primary shadow-card transition hover:scale-110",
            draggingHandle === "min" && "scale-110 ring-2 ring-primary/35",
          )}
          style={{ left: `${minRatio * 100}%`, touchAction: "none" }}
        />
        <span
          aria-hidden="true"
          data-testid="upper-price-drag-handle"
          onMouseDown={(event) => handleMouseDown("max", event)}
          onPointerDown={(event) => handlePointerDown("max", event)}
          onPointerMove={(event) => handlePointerMove("max", event)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            "absolute top-1/2 z-50 size-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-background bg-primary shadow-card transition hover:scale-110",
            draggingHandle === "max" && "scale-110 ring-2 ring-primary/35",
          )}
          style={{ left: `${maxRatio * 100}%`, touchAction: "none" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(DEFAULT_MIN_PRICE)}</span>
        <span>{formatCurrency(DEFAULT_MAX_PRICE)}+</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="space-y-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Min</span>
          <input
            id={`${id}-min`}
            aria-label="Minimum price"
            type="number"
            min={DEFAULT_MIN_PRICE}
            max={maxValue}
            step="1"
            value={minValue}
            onChange={(event) => handleMinChange(event.target.valueAsNumber)}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <label className="space-y-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Max</span>
          <input
            id={`${id}-max`}
            aria-label="Maximum price"
            type="number"
            min={minValue}
            max={DEFAULT_MAX_PRICE}
            step="1"
            value={maxValue}
            onChange={(event) => handleMaxChange(event.target.valueAsNumber)}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
      </div>
    </div>
  );
}
