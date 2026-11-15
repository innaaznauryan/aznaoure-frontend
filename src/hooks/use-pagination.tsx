import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/lib/products.ts";

export function usePagination (items: Product[], itemsPerPage: number = 12) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage: () => goToPage(Math.min(currentPage + 1, totalPages)),
    prevPage: () => goToPage(Math.max(currentPage - 1, 1)),
  };
}