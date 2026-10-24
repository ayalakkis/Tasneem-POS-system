import { Clock, CalendarDays, CalendarRange, TrendingUp, Store, ArrowRight } from "lucide-react";
import { getDateRanges, getProfitForRange } from "@/lib/profit";
import { getProfitByDay, getDeliveryStatusCounts, getRevenueByCategory } from "@/lib/analytics";
import StatCard from "@/components/layout/StatCard";
import ProfitTrendChart from "@/components/charts/ProfitTrendChart";
import DeliveryStatusChart from "@/components/charts/DeliveryStatusChart";
import CategoryRevenueChart from "@/components/charts/CategoryRevenueChart";
import { Card, CardBody, CardHeader, LinkButton, PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function AdminDashboardPage() {
  const { t, f } = await getI18n();
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
  const todayLabel = f.longDate(new Date());

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={todayLabel}
        title={t.dashboard.title}
        description={t.dashboard.description}
        actions={
          <LinkButton href="/pos" variant="secondary" icon={Store} trailingIcon={ArrowRight}>
            {t.dashboard.openPos}
          </LinkButton>
        }
        className="mb-2"
      />

      <section aria-label={t.dashboard.profitSection} className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatCard hero label={t.dashboard.profitToday} value={today.toFixed(2)} icon={Clock} />
        <StatCard label={t.dashboard.thisWeek} value={week.toFixed(2)} icon={CalendarDays} />
        <StatCard label={t.dashboard.thisMonth} value={month.toFixed(2)} icon={CalendarRange} />
        <StatCard label={t.dashboard.thisYear} value={year.toFixed(2)} icon={TrendingUp} tone="accent" />
      </section>

      <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t.dashboard.trendTitle}
            description={t.dashboard.trendDescription}
            actions={
              <div className="text-end">
                <p className="text-xs text-fg-subtle">{t.common.total}</p>
                <p className="text-sm font-semibold tabular-nums text-fg">{trendTotal.toFixed(2)}</p>
              </div>
            }
          />
          <CardBody className="pt-4">
            <ProfitTrendChart data={trend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.dashboard.deliveriesTitle} description={t.dashboard.deliveriesDescription} />
          <CardBody>
            <DeliveryStatusChart counts={deliveryCounts} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={t.dashboard.categoryTitle} description={t.dashboard.categoryDescription} />
        <CardBody className="pt-4">
          <CategoryRevenueChart data={categoryRevenue} />
        </CardBody>
      </Card>
    </div>
  );
}
