"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShoppingBag } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";

export default function InvoiceToolbar() {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center gap-2 print:hidden">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => router.back()}>
        Back
      </Button>
      <LinkButton href="/pos" variant="secondary" icon={ShoppingBag} className="ms-auto">
        New sale
      </LinkButton>
      <Button icon={Printer} onClick={() => window.print()}>
        Print
      </Button>
    </div>
  );
}
