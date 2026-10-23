"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
    <div className="flex gap-3">
      <input
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
        placeholder="Search by name or barcode"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          applyFilters(e.target.value, categoryId);
        }}
      />
      <select
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
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
      </select>
    </div>
  );
}
