import { Timer, Truck, PackageCheck, XCircle } from "lucide-react";
import { getDeliveries } from "@/lib/deliveries";
import StatCard from "@/components/layout/StatCard";
import DeliveryTable from "@/components/pos/DeliveryTable";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function AdminDeliveriesPage() {
  const [deliveries, { t }] = await Promise.all([getDeliveries(), getI18n()]);

  const counts = { PENDING: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const d of deliveries) {
    const status = d.deliveryStatus ?? "PENDING";
    counts[status] += 1;
  }

  return (
    <div>
      <PageHeader eyebrow={t.nav.peopleOrders} title={t.deliveries.title} description={t.deliveries.description} />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatCard label={t.deliveryStatus.PENDING} value={counts.PENDING} icon={Timer} tone="accent" />
        <StatCard label={t.deliveryStatus.OUT_FOR_DELIVERY} value={counts.OUT_FOR_DELIVERY} icon={Truck} tone="info" />
        <StatCard label={t.deliveryStatus.DELIVERED} value={counts.DELIVERED} icon={PackageCheck} tone="primary" />
        <StatCard label={t.deliveryStatus.CANCELLED} value={counts.CANCELLED} icon={XCircle} tone="danger" />
      </div>

      <div className="mt-8">
        <DeliveryTable deliveries={deliveries} />
      </div>
    </div>
  );
}
