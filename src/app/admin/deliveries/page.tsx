import { Timer, Truck, PackageCheck, XCircle } from "lucide-react";
import { getDeliveries } from "@/lib/deliveries";
import StatCard from "@/components/layout/StatCard";
import DeliveryTable from "@/components/pos/DeliveryTable";

export default async function AdminDeliveriesPage() {
  const deliveries = await getDeliveries();

  const counts = { PENDING: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const d of deliveries) {
    const status = d.deliveryStatus ?? "PENDING";
    counts[status] += 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Deliveries</h1>
      <p className="mt-1 text-sm text-gray-500">All delivery orders and their status.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Pending"
          value={counts.PENDING}
          icon={Timer}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Out for delivery"
          value={counts.OUT_FOR_DELIVERY}
          icon={Truck}
          color="bg-babyblue-100 text-babyblue-700"
        />
        <StatCard
          label="Delivered"
          value={counts.DELIVERED}
          icon={PackageCheck}
          color="bg-babyblue-200 text-babyblue-800"
        />
        <StatCard
          label="Cancelled"
          value={counts.CANCELLED}
          icon={XCircle}
          color="bg-beige-200 text-beige-800"
        />
      </div>

      <div className="mt-6">
        <DeliveryTable deliveries={deliveries} />
      </div>
    </div>
  );
}
