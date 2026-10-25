"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShoppingBag } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

export default function InvoiceToolbar() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="mb-6 flex items-center gap-2 print:hidden">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => router.back()}>
        {t.invoice.back}
      </Button>
      <LinkButton href="/pos" variant="secondary" icon={ShoppingBag} className="ms-auto">
        {t.invoice.newSale}
      </LinkButton>
      <Button icon={Printer} onClick={() => window.print()}>
        {t.invoice.print}
      </Button>
    </div>
  );
}
