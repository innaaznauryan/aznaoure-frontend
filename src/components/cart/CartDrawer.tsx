import { useEffect, useState } from "react";
import { CartApiError } from "@/api/cart";
import { X, LoaderCircle, Minus, Plus, ShoppingBag, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { getLang } from "@/lib/get-lang.ts";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/products";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const CartDrawer = () => {
  type PendingAction = { productId: string; action: "decrease" | "increase" | "remove" };
  const { i18n, t } = useTranslation();
  const lang = getLang(i18n.language);
  const {
    state,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    shippingCost,
    grandTotal,
    hasStockIssues,
    isCheckingAvailability,
    isLoading,
    hasError,
    isUpdating,
    refetchCart
  } = useCart();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    if (state.isOpen) void refetchCart();
  }, [refetchCart, state.isOpen]);

  const changeQuantity = async (productId: string, quantity: number, action: "decrease" | "increase") => {
    setPendingAction({ productId, action });
    try {
      await updateQuantity(productId, quantity);
      if (quantity <= 0) {
        toast({ title: t("cart.removedTitle"), description: t("cart.removedDescription") });
      } else {
        toast({
          title: t(action === "increase" ? "cart.quantityIncreasedTitle" : "cart.quantityDecreasedTitle"),
          description: t(action === "increase" ? "cart.quantityIncreasedDescription" : "cart.quantityDecreasedDescription"),
        });
      }
    } catch (error) {
      toast({
        title: t("cart.errorTitle"),
        description: t(error instanceof CartApiError && error.code === "insufficient_stock"
          ? "cart.stockExceeded"
          : "cart.updateFailed"),
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setPendingAction({ productId, action: "remove" });
    try {
      await removeItem(productId);
      toast({ title: t("cart.removedTitle"), description: t("cart.removedDescription") });
    } catch {
      toast({ title: t("cart.errorTitle"), description: t("cart.removeFailed"), variant: "destructive" });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-elevated flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div className="flex items-center gap-2 sm:gap-3">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                <h2 className="font-serif text-lg sm:text-xl">{t("cart.title")}</h2>
                <span className="text-muted-foreground text-sm">({totalItems})</span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-muted rounded-sm transition-colors"
                aria-label={t("cart.closeCart")}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Spinner />
                </div>
              ) : hasError ? (
                <p className="text-center text-muted-foreground">{t("cart.loadFailed")}</p>
              ) : state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base">{t("cart.empty")}</p>
                  <Button
                    variant="luxuryOutline"
                    size="lg"
                    className="mt-6 w-full sm:w-auto"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/collections">{t("cart.exploreCollections")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {state.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border last:border-0"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name[lang]}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base sm:text-lg break-words">{item.product.name[lang]}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm capitalize">
                          {categories[item.product.category].name[lang]}
                        </p>
                        {item.quantity > item.product.available && (
                          <p role="status" className="mt-1 text-xs text-destructive">
                            {t(item.product.available <= 0 ? "products.outOfStock" : "cart.stockExceeded")}
                          </p>
                        )}
                        <p className="font-medium mt-1 text-sm sm:text-base">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-3">
                          <button
                            disabled={isUpdating}
                            onClick={() => changeQuantity(item.productId, item.quantity - 1, "decrease")}
                            className="p-1 hover:bg-muted rounded-sm transition-colors"
                            aria-label={t("cart.decreaseQuantity")}
                          >
                            {pendingAction?.productId === item.productId && pendingAction.action === "decrease" ? (
                              <LoaderCircle className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </button>
                          <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                          <button
                            disabled={isUpdating || item.quantity >= item.product.available}
                            onClick={() => changeQuantity(item.productId, item.quantity + 1, "increase")}
                            className="p-1 hover:bg-muted rounded-sm transition-colors"
                            aria-label={t("cart.increaseQuantity")}
                          >
                            {pendingAction?.productId === item.productId && pendingAction.action === "increase" ? (
                              <LoaderCircle className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleRemove(item.productId)}
                            className="ml-auto text-muted-foreground hover:text-destructive text-xs sm:text-sm transition-colors"
                            aria-label={t("cart.removeItem")}
                          >
                            {pendingAction?.productId === item.productId && pendingAction.action === "remove" ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              t("cart.remove")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-border space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="font-serif">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    {t("cart.shipping")}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={t("cart.shippingInfo")}
                          className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Info aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="start"
                        className="w-auto max-w-[calc(100vw-2rem)] border-neutral-900 bg-neutral-900 px-3 py-2 text-sm text-white"
                      >
                        {t("cart.shippingInfo")}
                      </PopoverContent>
                    </Popover>
                  </span>
                  <span className={shippingCost === 0 ? "text-primary" : "text-foreground"}>
                    {shippingCost === 0 ? t("cart.complimentary") : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base sm:text-lg">
                  <span className="font-medium">{t("cart.total")}</span>
                  <span className="font-serif">{formatPrice(grandTotal)}</span>
                </div>
                {(hasStockIssues || isCheckingAvailability) && (
                  <p
                    role="status"
                    className={`text-sm text-center ${isCheckingAvailability ? "text-muted-foreground" : "text-destructive"}`}
                  >
                    {t(isCheckingAvailability ? "cart.checkingAvailability" : "cart.checkoutBlockedByStock")}
                  </p>
                )}
                {hasStockIssues || isCheckingAvailability ? (
                  <Button variant="luxury" size="lg" className="sm:size-xl w-full" disabled>
                    {t("cart.proceedToCheckout")}
                  </Button>
                ) : (
                  <Button
                    variant="luxury"
                    size="lg"
                    className="sm:size-xl w-full"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/checkout">{t("cart.proceedToCheckout")}</Link>
                  </Button>
                )}
                <Button variant="luxuryOutline" className="w-full" onClick={closeCart} asChild>
                  <Link to="/cart">{t("cart.viewCart")}</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
