import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchBar } from "@/components/products/SearchBar";
import { PaginationControls } from "@/components/PaginationControls.tsx";
import { useCategoryChange } from "@/hooks/use-category-change.tsx";
import { categories, Category } from "@/lib/products.ts";
import { getLang } from "@/lib/get-lang.ts";
import { useProducts } from "@/hooks/use-products.ts";
import { useProductSearch } from "@/hooks/use-product-search.ts";
import { usePagination } from "@/hooks/use-pagination.tsx";

const Collections = () => {
  const { t, i18n } = useTranslation();
  const lang = getLang(i18n.language);
  const { selectedCategory, handleCategoryChange } = useCategoryChange();
  const { products, loading, error, getProductsByCategory } = useProducts();
  const {
    query,
    setQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useProductSearch();

  const isSearching = query.trim().length > 0;

  const filteredProducts = selectedCategory
    ? getProductsByCategory(selectedCategory)
    : products;

  const searchResultsFiltered = selectedCategory
    ? searchResults.filter((p) => p.category === selectedCategory)
    : searchResults;

  const displayedProducts = isSearching ? searchResultsFiltered : filteredProducts;
  const isLoading = isSearching ? searchLoading : loading;
  const displayedError = isSearching ? searchError : error;

  const {
    paginatedItems: currentProducts,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(displayedProducts);

  return (
    <div className="min-h-screen">
      {/* Meta tags */}
      <SEO
        title="Collections"
        description="Browse our full collection of Armenian authentic jewelry - rings, necklaces, earrings and more, each rooted in Armenian heritage and culture."
        path="/collections"
      />

      {/* Hero */}
      <section className="py-12 sm:py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="luxury-subheading mb-3 sm:mb-4">{t("collections.subtitle")}</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
              {t("collections.title")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              {t("collections.description")}
            </p>
            <div className="luxury-divider mt-6 sm:mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 sm:py-10 lg:py-12 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center mb-8 gap-2 sm:gap-4">
            <button
              onClick={() => handleCategoryChange(null)}
              aria-pressed={!selectedCategory}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-sans tracking-widest uppercase transition-all duration-300 ${
                !selectedCategory
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("collections.all")}
            </button>
            {Object.entries(categories).map(([id, category]) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id as Category)}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-sans tracking-widest uppercase transition-all duration-300 ${
                  selectedCategory === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name[lang]}
              </button>
            ))}
          </div>
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid
            products={currentProducts}
            loading={isLoading}
            error={displayedError}
          />
        </div>
      </section>

      {/* Pagination */}
      {displayedProducts.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </div>
  );
};

export default Collections;
