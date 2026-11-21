import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { categories, Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getLang } from "@/lib/get-lang.ts";
import { useFavorites } from "@/context/FavoritesContext.tsx";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { t, i18n } = useTranslation();
  const lang = getLang(i18n.language);
  const { isFavorite, toggleFavorite } = useFavorites();

  const inStock = product.available > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col"
    >
      <p className="luxury-subheading mb-2">
        {categories[product.category].name[lang]}
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
        {product.name[lang]}
      </h1>
      <p className="font-serif text-2xl sm:text-3xl text-primary mb-4 sm:mb-6">
        {formatPrice(product.price)}
      </p>

      <p
        className={`text-xs sm:text-sm font-medium mb-4 sm:mb-6 ${
          inStock ? "text-emerald-600" : "text-destructive"
        }`}
      >
        {inStock ? t("products.inStock") : t("products.outOfStock")}
      </p>

      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
        {product.description[lang]}
      </p>

      <div className="mb-6 sm:mb-8">
        <h3 className="font-sans text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4">
          {t("products.details")}
        </h3>
        <ul className="space-y-2">
          {product.details.map((detail, index) => (
            <li
              key={index}
              className="text-muted-foreground text-sm sm:text-base flex items-start"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
              {detail[lang]}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant="luxuryOutline"
          size="lg"
          className="sm:size-xl sm:flex-shrink-0"
          onClick={() => toggleFavorite(product.id)}
          aria-label={t("favorites.save")}
          title={t("favorites.save")}
        >
          <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite(product.id) ? "fill-rose-500" : ""}`} />
        </Button>
        <AddToCartButton
          size="lg"
          className="sm:size-xl sm:flex-shrink-0"
          product={product}
        />
      </div>
    </motion.div>
  )
}