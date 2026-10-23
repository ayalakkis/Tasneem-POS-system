import { Clock, CalendarDays, CalendarRange, TrendingUp, Truck, PackageCheck, XCircle, Timer } from "lucide-react";
import { getDateRanges, getProfitForRange } from "@/lib/profit";
import { getProfitByDay, getDeliveryStatusCounts, getRevenueByCategory } from "@/lib/analytics";
import StatCard from "@/components/layout/StatCard";
import ProfitTrendChart from "@/components/charts/ProfitTrendChart";
import DeliveryStatusChart from "@/components/charts/DeliveryStatusChart";
import CategoryRevenueChart from "@/components/charts/CategoryRevenueChart";

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

  const profitCards = [
    { label: "Today", value: today.toFixed(2), icon: Clock },
    { label: "This week", value: week.toFixed(2), icon: CalendarDays },
    { label: "This month", value: month.toFixed(2), icon: CalendarRange },
    { label: "This year", value: year.toFixed(2), icon: TrendingUp },
  ];

  const deliveryPieData = [
    { name: "Pending", value: deliveryCounts.PENDING, color: "#dccba3" },
    { name: "Out for delivery", value: deliveryCounts.OUT_FOR_DELIVERY, color: "#a6d2e4" },
    { name: "Delivered", value: deliveryCounts.DELIVERED, color: "#3f8aa8" },
    { name: "Cancelled", value: deliveryCounts.CANCELLED, color: "#a0824c" },
  ];

  const deliveryList = [
    { label: "Pending", value: deliveryCounts.PENDING, icon: Timer, color: "bg-beige-100 text-beige-700" },
    {
      label: "Out for delivery",
      value: deliveryCounts.OUT_FOR_DELIVERY,
      icon: Truck,
      color: "bg-babyblue-100 text-babyblue-700",
    },
    {
      label: "Delivered",
      value: deliveryCounts.DELIVERED,
      icon: PackageCheck,
      color: "bg-babyblue-200 text-babyblue-800",
    },
    {
      label: "Cancelled",
      value: deliveryCounts.CANCELLED,
      icon: XCircle,
      color: "bg-beige-200 text-beige-800",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Profit = revenue minus cost of goods sold.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {profitCards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Profit — last 30 days</h2>
          <div className="mt-2">
            <ProfitTrendChart data={trend} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Deliveries by status</h2>
          <div className="mt-2">
            <DeliveryStatusChart data={deliveryPieData} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Revenue by category — last 30 days</h2>
          <div className="mt-2">
            <CategoryRevenueChart data={categoryRevenue} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Delivery counts</h2>
          <div className="mt-4 space-y-3">
            {deliveryList.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${d.color}`}>
                    <d.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-gray-600">{d.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
