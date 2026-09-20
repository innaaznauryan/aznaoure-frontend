import { useEffect, useState } from "react";
import { Product } from "@/lib/products.ts";
import { searchProducts, getSearchQuota } from "@/api/products";
import { useTranslation } from "react-i18next";

export function useProductSearch(debounceMs = 400) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [semantic, setSemantic] = useState(true);
  const [semanticRemaining, setSemanticRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSearchQuota()
      .then((data) => {
        setSemanticRemaining(data.remaining);
        setSemantic(data.remaining > 0);
      })
      .catch(() => setSemanticRemaining(null));
  }, []);

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
  }, [t, query, debounceMs]);

  return { query, setQuery, results, semantic, semanticRemaining, loading, error };
}