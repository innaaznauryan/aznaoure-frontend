import { Link } from "react-router-dom";
import { useState } from "react";
import { CartApiError } from "@/api/cart";
import { motion } from "framer-motion";
import { ArrowLeft, LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { getLang } from "@/lib/get-lang.ts";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/products";

const Cart = () => {
  type PendingAction = { productId: string; action: "decrease" | "increase" | "remove" };
  const { i18n, t } = useTranslation();
  const lang = getLang(i18n.language);
  const { state, removeItem, updateQuantity, totalPrice, shippingCost, grandTotal, isLoading, hasError, isUpdating, refetchCart } = useCart();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

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

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><span className="text-muted-foreground">{t("cart.loading")}</span></div>;
  }

  if (hasError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("cart.loadFailed")}</p>
        <Button variant="luxuryOutline" onClick={() => void refetchCart()}>{t("cart.retry")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="luxury-subheading mb-3 sm:mb-4">{t("cart.selection")}</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
              {t("cart.title")}
            </h1>
            <div className="luxury-divider" />
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {state.items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-16"
            >
              <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
                {t("cart.empty")}
              </p>
              <Button variant="luxuryOutline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/collections">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("cart.continueShopping")}
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {state.items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-border"
                  >
                    <Link
                      to={`/product/${item.product.id}`}
                      className="flex-shrink-0 self-center sm:self-start"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name[lang]}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-sm"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground mb-1">
                            {categories[item.product.category].name[lang]}
                          </p>
                          <Link to={`/product/${item.product.id}`}>
                            <h3 className="font-serif text-lg sm:text-xl hover:text-primary transition-colors break-words">
                              {item.product.name[lang]}
                            </h3>
                          </Link>
                        </div>
                        <p className="font-serif text-lg sm:text-xl mt-2 sm:mt-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 sm:mt-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <button
                            onClick={() => changeQuantity(item.productId, item.quantity - 1, "decrease")}
                            disabled={isUpdating}
                            className="p-2 hover:bg-muted rounded-sm transition-colors"
                            aria-label={t("cart.decreaseQuantity")}
                          >
                            {pendingAction?.productId === item.productId && pendingAction.action === "decrease" ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQuantity(item.productId, item.quantity + 1, "increase")}
                            disabled={isUpdating}
                            className="p-2 hover:bg-muted rounded-sm transition-colors"
                            aria-label={t("cart.increaseQuantity")}
                          >
                            {pendingAction?.productId === item.productId && pendingAction.action === "increase" ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={isUpdating}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={t("cart.removeItem")}
                        >
                          {pendingAction?.productId === item.productId && pendingAction.action === "remove" ? (
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Link
                  to="/collections"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("cart.continueShopping")}
                </Link>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-secondary p-6 sm:p-8 rounded-sm sticky top-24">
                  <h2 className="font-serif text-xl sm:text-2xl mb-4 sm:mb-6">{t("cart.orderSummary")}</h2>

                  <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-border">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">{t("cart.shipping")}</span>
                      <span className={shippingCost === 0 ? "text-primary" : "text-foreground"}>
                        {shippingCost === 0 ? t("cart.complimentary") : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 sm:py-6 text-base sm:text-lg">
                    <span className="font-medium">{t("cart.total")}</span>
                    <span className="font-serif text-lg sm:text-xl">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>

                  <Button variant="luxury" size="lg" className="sm:size-xl w-full" asChild>
                    <Link to="/checkout">{t("cart.proceedToCheckout")}</Link>
                  </Button>

                  <p className="text-muted-foreground text-xs sm:text-sm text-center mt-4 sm:mt-6">
                    {t("cart.secureCheckout")}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
