import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/context/FavoritesContext";
import { Button } from "@/components/ui/button";
import { Product, categories } from "@/lib/products";
import { getLang } from "@/lib/get-lang.ts";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = getLang(i18n.language);
  const { isFavorite, toggleFavorite } = useFavorites();

  const inStock = product.available > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative overflow-hidden bg-muted aspect-square mb-4">
        <Link to={`/product/${product.id}${location.search}`} className="block h-full">
          <img
            src={product.image}
            alt={product.id}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        </Link>
        <div className="absolute top-0 right-0 p-2 flex gap-2">
          <Button
            type="button"
            variant="luxuryOutline"
            onClick={() => toggleFavorite(product.id)}
            className="z-10 h-10 w-10 p-2 rounded-full aspect-square bg-background/80 text-black hover:bg-gold hover:text-white transition-colors"
            aria-label={t("favorites.save")}
            title={t("favorites.save")}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-rose-500" : ""}`} />
          </Button>
          <AddToCartButton
            product={product}
            className="z-10 h-10 w-10 min-w-10 p-2 rounded-full aspect-square bg-background/80 text-black hover:bg-gold hover:text-white transition-colors"
          />
        </div>
        {!inStock && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-background/80 text-xs font-medium tracking-wide uppercase">
            {t("products.outOfStock")}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground">
          {categories[product.category].name[lang]}
        </p>
        <Link to={`/product/${product.id}${location.search}`}>
          <h3 className="font-serif text-xl group-hover:text-primary transition-colors duration-300">
            {product.name[lang]}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2">
          <p className="font-sans text-lg">{formatPrice(product.price)}</p>
        </div>
      </div>
    </motion.article>
  );
};
