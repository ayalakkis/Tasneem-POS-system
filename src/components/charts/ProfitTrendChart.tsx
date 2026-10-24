"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "@/i18n/I18nProvider";
import ChartTooltip from "./ChartTooltip";

type Point = { day: string; profit: number };

/** "YYYY-MM-DD" → local Date (not `new Date(key)`, which parses as UTC). */
function parseDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const AXIS_TICK = { fontSize: 11, fill: "var(--chart-axis)" };

/**
 * Single series, so one hue and no legend: the card title names it.
 * Recharts has no RTL support, so it always renders in an LTR box and is
 * mirrored with its own options in Arabic: time runs right to left and the
 * value axis moves to the right edge.
 */
export default function ProfitTrendChart({ data }: { data: Point[] }) {
  const { dir, f, t } = useI18n();
  const rtl = dir === "rtl";
  const formatDay = (key: string | number) => f.dayMonth(parseDay(String(key)));
  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={rtl ? { top: 8, right: -12, left: 4, bottom: 0 } : { top: 8, right: 4, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-series)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-series)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="day"
              tickFormatter={formatDay}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            reversed={rtl}
            interval="preserveStartEnd"
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis
            orientation={rtl ? "right" : "left"}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={48}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={<ChartTooltip valueLabel={t.dashboard.profit} formatLabel={formatDay} />}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="var(--chart-series)"
            strokeWidth={2}
            fill="url(#profitFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)", fill: "var(--chart-series)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
