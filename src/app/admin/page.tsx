import { Clock, CalendarDays, CalendarRange, TrendingUp, Store, ArrowRight } from "lucide-react";
import { getDateRanges, getProfitForRange } from "@/lib/profit";
import { getProfitByDay, getDeliveryStatusCounts, getRevenueByCategory } from "@/lib/analytics";
import StatCard from "@/components/layout/StatCard";
import ProfitTrendChart from "@/components/charts/ProfitTrendChart";
import DeliveryStatusChart from "@/components/charts/DeliveryStatusChart";
import CategoryRevenueChart from "@/components/charts/CategoryRevenueChart";
import { Card, CardBody, CardHeader, LinkButton, PageHeader } from "@/components/ui";

export default async function AdminDashboardPage() {
  const ranges = getDateRanges();
  const last30Start = new Date();
  last30Start.setDate(last30Start.getDate() - 30);

  const [today, week, month, year, trend, deliveryCounts, categoryRevenue] = await Promise.all([
    getProfitForRange(ranges.today.start, ranges.today.end),
    getProfitForRange(ranges.week.start, ranges.week.end),
    getProfitForRange(ranges.month.start, ranges.month.end),
    getProfitForRange(ranges.year.start, ranges.year.end),
    getProfitByDay(30),
    getDeliveryStatusCounts(),
    getRevenueByCategory(last30Start, ranges.today.end),
  ]);

  const trendTotal = trend.reduce((sum, p) => sum + p.profit, 0);
  const todayLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title="Dashboard"
        description="Profit is revenue minus the cost of goods sold."
        actions={
          <LinkButton href="/pos" variant="secondary" icon={Store} trailingIcon={ArrowRight}>
            Open POS
          </LinkButton>
        }
        className="mb-2"
      />

      <section aria-label="Profit" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard hero label="Profit today" value={today.toFixed(2)} icon={Clock} />
        <StatCard label="This week" value={week.toFixed(2)} icon={CalendarDays} />
        <StatCard label="This month" value={month.toFixed(2)} icon={CalendarRange} />
        <StatCard label="This year" value={year.toFixed(2)} icon={TrendingUp} tone="accent" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Profit, last 30 days"
            description="Daily profit across all sales."
            actions={
              <div className="text-right">
                <p className="text-xs text-fg-subtle">30-day total</p>
                <p className="text-sm font-semibold tabular-nums text-fg">{trendTotal.toFixed(2)}</p>
              </div>
            }
          />
          <CardBody className="pt-4">
            <ProfitTrendChart data={trend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Deliveries" description="All delivery orders by status." />
          <CardBody>
            <DeliveryStatusChart counts={deliveryCounts} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Revenue by category" description="Last 30 days, highest first." />
        <CardBody className="pt-4">
          <CategoryRevenueChart data={categoryRevenue} />
        </CardBody>
      </Card>
    </div>
  );
}
