"use client";

import type { DeliveryStatus } from "@prisma/client";
import { Badge, type BadgeTone } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

// Same meaning as the dashboard status chart: brass waiting, blue moving,
// green done, clay stopped. Labels live in the dictionaries (t.deliveryStatus).
const TONES: Record<DeliveryStatus, BadgeTone> = {
  PENDING: "accent",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "primary",
  CANCELLED: "danger",
};

export default function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { t } = useI18n();
  return (
    <Badge tone={TONES[status]} dot>
      {t.deliveryStatus[status]}
    </Badge>
  );
}
