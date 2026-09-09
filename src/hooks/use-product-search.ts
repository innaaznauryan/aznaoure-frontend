import { useEffect, useState } from "react";
import { Product } from "@/lib/products.ts";
import { searchProducts } from "@/api/products";

export function useProductSearch(debounceMs = 400) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchProducts(query);
        setResults(data);
      } catch {
        setError("Something went wrong while searching");
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error };
}