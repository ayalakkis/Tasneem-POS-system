"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";

type Point = { label: string; profit: number };

const AXIS_TICK = { fontSize: 11, fill: "var(--chart-axis)" };

/** Single series, so one hue and no legend: the card title names it. */
export default function ProfitTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-series)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--chart-series)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
          tickMargin={8}
        />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip valueLabel="Profit" />}
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
  );
}
