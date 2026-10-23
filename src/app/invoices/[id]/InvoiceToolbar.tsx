"use client";

import { useRouter } from "next/navigation";

export default function InvoiceToolbar() {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between print:hidden">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">
        ← Back
      </button>
      <button
        onClick={() => window.print()}
        className="rounded-lg bg-babyblue-600 px-4 py-2 text-sm font-medium text-white hover:bg-babyblue-700"
      >
        Print
      </button>
    </div>
  );
}
