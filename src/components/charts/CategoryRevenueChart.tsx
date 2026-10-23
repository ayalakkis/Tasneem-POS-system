"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { ChartNoAxesColumn } from "lucide-react";
import { EmptyState } from "@/components/ui";
import ChartTooltip from "./ChartTooltip";

type Row = { category: string; revenue: number };

const ROW_HEIGHT = 40;

/**
 * Horizontal bars, sorted, one hue: length carries the amount and the axis
 * label carries the category, so color would only add noise. Every bar is
 * direct-labelled, so there is no value axis or grid.
 */
export default function CategoryRevenueChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <EmptyState icon={ChartNoAxesColumn} title="No sales yet" description="Revenue by category shows up after the first sale." className="py-8" />;
  }

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <ResponsiveContainer width="100%" height={sorted.length * ROW_HEIGHT + 16}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          width={120}
          tick={{ fontSize: 12, fill: "var(--fg-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip valueLabel="Revenue" />} />
        <Bar dataKey="revenue" fill="var(--chart-series)" radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList
            dataKey="revenue"
            position="right"
            formatter={(v) => Number(v).toFixed(2)}
            style={{ fontSize: 12, fill: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
