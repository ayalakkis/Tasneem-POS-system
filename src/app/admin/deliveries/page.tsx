import { Timer, Truck, PackageCheck, XCircle } from "lucide-react";
import { getDeliveries } from "@/lib/deliveries";
import StatCard from "@/components/layout/StatCard";
import DeliveryTable from "@/components/pos/DeliveryTable";
import { PageHeader } from "@/components/ui";

export default async function AdminDeliveriesPage() {
  const deliveries = await getDeliveries();

  const counts = { PENDING: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const d of deliveries) {
    const status = d.deliveryStatus ?? "PENDING";
    counts[status] += 1;
  }

  return (
    <div>
      <PageHeader eyebrow="People & orders" title="Deliveries" description="All delivery orders and their status." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={counts.PENDING} icon={Timer} tone="accent" />
        <StatCard label="Out for delivery" value={counts.OUT_FOR_DELIVERY} icon={Truck} tone="info" />
        <StatCard label="Delivered" value={counts.DELIVERED} icon={PackageCheck} tone="primary" />
        <StatCard label="Cancelled" value={counts.CANCELLED} icon={XCircle} tone="danger" />
      </div>

      <div className="mt-8">
        <DeliveryTable deliveries={deliveries} />
      </div>
    </div>
  );
}
