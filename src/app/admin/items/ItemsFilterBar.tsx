"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui";

type Category = { id: string; name: string };

export default function ItemsFilterBar({
  categories,
  initialQuery,
  initialCategoryId,
}: {
  categories: Category[];
  initialQuery: string;
  initialCategoryId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  function applyFilters(nextQ: string, nextCategoryId: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCategoryId) params.set("categoryId", nextCategoryId);
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row" role="search">
      <Input
        icon={Search}
        type="search"
        aria-label="Search items"
        className="flex-1"
        placeholder="Search by name or barcode"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          applyFilters(e.target.value, categoryId);
        }}
      />
      <Select
        aria-label="Filter by category"
        className="sm:w-56"
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value);
          applyFilters(q, e.target.value);
        }}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
