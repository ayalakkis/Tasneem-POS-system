import type { DeliveryStatus } from "@prisma/client";
import { Badge, type BadgeTone } from "@/components/ui";

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Pending",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Same meaning as the dashboard status chart: brass waiting, blue moving,
// green done, clay stopped.
const TONES: Record<DeliveryStatus, BadgeTone> = {
  PENDING: "accent",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "primary",
  CANCELLED: "danger",
};

export default function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <Badge tone={TONES[status]} dot>
      {DELIVERY_STATUS_LABELS[status]}
    </Badge>
  );
}
