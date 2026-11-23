import { useState } from "react";
import { CartApiError } from "@/api/cart";
import { CalendarPlus, LoaderCircle, ShoppingBag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/products";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export const AddToCartButton = ({
  product,
  className,
  size = "default",
}: AddToCartButtonProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, promptSignIn } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, state } = useCart();
  const isInCart = state.items.some((item) => item.productId === product.id);
  const inStock = product.available > 0;

  const handleClick = () => {
    if (!inStock) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("preorder", product.id);
      searchParams.set("productName", product.name[i18n.language.startsWith("hy") ? "hy" : "en"]);
      navigate({ pathname: "/contact", search: `?${searchParams.toString()}` });
      return;
    }

    void handleAddToCart();
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      promptSignIn("cart");
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product.id);
      toast({
        title: t("cart.addedTitle"),
        description: t("cart.addedDescription"),
      });
    } catch (error) {
      toast({
        title: t("cart.errorTitle"),
        description: t(error instanceof CartApiError && error.code === "insufficient_stock"
          ? "cart.stockExceeded"
          : "cart.addFailed"),
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      type="button"
      variant="luxuryOutline"
      size={size}
      className={className}
      onClick={handleClick}
      disabled={inStock && (isAuthLoading || isAdding)}
      aria-label={t(inStock ? "products.addToCart" : "products.preorder")}
      title={t(inStock ? "products.addToCart" : "products.preorder")}
    >
      {isAdding ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : inStock ? (
        <ShoppingBag className={`h-4 w-4 ${isInCart ? "fill-gold" : ""}`} />
      ) : (
        <CalendarPlus className="h-4 w-4" />
      )}
    </Button>
  );
};