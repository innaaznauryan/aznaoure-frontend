import { useEffect, useState } from "react";
import { Product } from "@/lib/products.ts";
import { searchProducts, getSearchQuota } from "@/api/products";
import { useTranslation } from "react-i18next";

export function useProductSearch(isAuthenticated: boolean, debounceMs = 400) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [semantic, setSemantic] = useState(true);
  const [semanticRemaining, setSemanticRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    getSearchQuota()
      .then((data) => {
        setSemanticRemaining(data.remaining);
        setSemantic(data.remaining > 0);
      })
      .catch(() => setSemanticRemaining(null));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !query.trim()) {
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
        setResults(data.results);
        setSemantic(data.semantic);
        setSemanticRemaining(data.semanticRemaining);
      } catch {
        setError(t("products.failedToFetch"));
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, t, query, debounceMs]);

  return { query, setQuery, results, semantic, semanticRemaining, loading, error };
}