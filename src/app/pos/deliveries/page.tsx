import { Timer, Truck, PackageCheck, XCircle } from "lucide-react";
import { getDeliveries } from "@/lib/deliveries";
import StatCard from "@/components/layout/StatCard";
import DeliveryTable from "@/components/pos/DeliveryTable";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import DeliveryScreen from "./DeliveryScreen";

export default async function PosDeliveriesPage() {
  const [deliveries, { t }] = await Promise.all([getDeliveries(), getI18n()]);

  const counts = { PENDING: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const d of deliveries) {
    const status = d.deliveryStatus ?? "PENDING";
    counts[status] += 1;
  }

  return (
    <div className="space-y-10">
      <div>
        <PageHeader eyebrow={t.nav.pointOfSale} title={t.deliveries.title} className="mb-6" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          <StatCard label={t.deliveryStatus.PENDING} value={counts.PENDING} icon={Timer} tone="accent" />
          <StatCard label={t.deliveryStatus.OUT_FOR_DELIVERY} value={counts.OUT_FOR_DELIVERY} icon={Truck} tone="info" />
          <StatCard label={t.deliveryStatus.DELIVERED} value={counts.DELIVERED} icon={PackageCheck} tone="primary" />
          <StatCard label={t.deliveryStatus.CANCELLED} value={counts.CANCELLED} icon={XCircle} tone="danger" />
        </div>
      </div>

      <DeliveryScreen />

      <section aria-labelledby="all-deliveries-title">
        <h2 id="all-deliveries-title" className="mb-4 text-base font-semibold text-fg">
          {t.deliveries.all}
        </h2>
        <DeliveryTable deliveries={deliveries} />
      </section>
    </div>
  );
}
