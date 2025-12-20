"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";

/* ================= THEME ================= */
const THEMES = { light: "", dark: ".dark" } as const;

/* ================= CONFIG ================= */
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/* ================= CONTEXT ================= */
type ChartContextProps = { config: ChartConfig };

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartContainer />");
  return ctx;
}

/* ================= CONTAINER ================= */
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uid = React.useId();
  const chartId = `chart-${id || uid.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-layer]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* ================= STYLE ================= */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(
    ([, v]) => v.color || v.theme,
  );

  if (!entries.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${entries
  .map(([key, v]) => {
    const c = v.theme?.[theme as keyof typeof v.theme] || v.color;
    return c ? `--color-${key}: ${c};` : "";
  })
  .join("\n")}
}`,
          )
          .join("\n"),
      }}
    />
  );
}

/* ================= TOOLTIP ================= */
type TooltipItem = {
  name?: string;
  value?: number | string;
  dataKey?: string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: React.ReactNode;
  className?: string;
  hideLabel?: boolean;
};

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!hideLabel && label && (
        <div className="mb-1 font-medium text-muted-foreground">{label}</div>
      )}

      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = String(item.dataKey || item.name || "value");
          const cfg = config[key];

          return (
            <div key={i} className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {cfg?.label || item.name}
              </span>
              <span className="font-mono font-medium">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= LEGEND ================= */
type LegendItem = {
  value?: string;
  dataKey?: string;
  color?: string;
};

type ChartLegendContentProps = {
  payload?: LegendItem[];
  className?: string;
};

function ChartLegendContent({
  payload,
  className,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex justify-center gap-4", className)}>
      {payload.map((item, i) => {
        const key = String(item.dataKey || item.value);
        const cfg = config[key];

        return (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs">
              {cfg?.label || item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================= EXPORT ================= */
const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
