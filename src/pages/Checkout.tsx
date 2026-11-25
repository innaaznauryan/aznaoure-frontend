import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/hooks/use-addresses";
import { getLang } from "@/lib/get-lang.ts";
import { formatPrice } from "@/lib/utils";

interface CheckoutFormValues {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

const Checkout = () => {
  const { i18n, t } = useTranslation();
  const lang = getLang(i18n.language);
  const {
    state,
    totalPrice,
    shippingCost,
    grandTotal,
    hasStockIssues,
    isCheckingAvailability,
    isLoading,
    hasError,
    refetchCart,
  } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addresses, loading: areAddressesLoading } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    void refetchCart();
  }, [refetchCart]);

  useEffect(() => {
    if (!user) return;
    setFormValues((current) => ({
      ...current,
      email: user.email,
      phone: user.phone ?? "",
      firstName: user.first_name,
      lastName: user.last_name,
    }));
  }, [user]);

  const handleAddressChange = (addressId: string) => {
    if (addressId === "manual") {
      setSelectedAddressId(addressId);
      setFormValues((current) => ({
        ...current,
        phone: user?.phone ?? "",
        address: "",
        city: "",
        zip: "",
        country: "",
      }));
      return;
    }

    const selectedAddress = addresses.find((address) => String(address.id) === addressId);
    if (!selectedAddress) return;

    setSelectedAddressId(addressId);
    setFormValues((current) => ({
      ...current,
      phone: selectedAddress.phone ?? user?.phone ?? current.phone,
      address: selectedAddress.address,
      city: selectedAddress.city,
      zip: selectedAddress.zip_code,
      country: selectedAddress.country,
    }));
  };

  const updateFormField = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const updateAddressField = (
    field: "address" | "city" | "zip" | "country",
    value: string
  ) => {
    setSelectedAddressId("manual");
    updateFormField(field, value);
  };

  if (isAuthLoading || isLoading || areAddressesLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("cart.loadFailed")}</p>
        <Button variant="luxuryOutline" onClick={() => void refetchCart()}>
          {t("cart.retry")}
        </Button>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-24 px-4">
        <div className="text-center w-full">
          <h1 className="font-serif text-2xl sm:text-3xl mb-4">{t("checkout.emptyCart")}</h1>
          <Button variant="luxuryOutline" className="w-full sm:w-auto" asChild>
            <Link to="/collections">{t("checkout.browseCollections")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">{t("checkout.title")}</h1>

            <form onSubmit={(event) => event.preventDefault()} className="space-y-6 sm:space-y-8">
              {/* Contact */}
              <div className="bg-background p-4 sm:p-6 rounded-sm">
                <h2 className="font-serif text-lg sm:text-xl mb-3 sm:mb-4">{t("checkout.contactInformation")}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("checkout.firstName")}</Label>
                      <Input
                        id="firstName"
                        required
                        placeholder={t("checkout.firstName")}
                        value={formValues.firstName}
                        onChange={(event) => updateFormField("firstName", event.target.value)}
                        className="mt-1 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("checkout.lastName")}</Label>
                      <Input
                        id="lastName"
                        required
                        placeholder={t("checkout.lastName")}
                        value={formValues.lastName}
                        onChange={(event) => updateFormField("lastName", event.target.value)}
                        className="mt-1 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t("checkout.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formValues.email}
                      onChange={(event) => updateFormField("email", event.target.value)}
                      className="mt-1 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder={t("checkout.phonePlaceholder")}
                      value={formValues.phone}
                      onChange={(event) => updateFormField("phone", event.target.value)}
                      className="mt-1 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-background p-4 sm:p-6 rounded-sm">
                <h2 className="font-serif text-lg sm:text-xl mb-3 sm:mb-4">{t("checkout.shippingAddress")}</h2>
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <div>
                      <Label htmlFor="saved-address">{t("checkout.selectSavedAddress")}</Label>
                      <Select value={selectedAddressId} onValueChange={handleAddressChange}>
                        <SelectTrigger id="saved-address" className="mt-1 text-base">
                          <SelectValue placeholder={t("checkout.selectSavedAddress")} />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((savedAddress) => (
                            <SelectItem key={savedAddress.id} value={String(savedAddress.id)}>
                              {savedAddress.address}, {savedAddress.city}
                              {savedAddress.is_default ? ` (${t("address.list.default")})` : ""}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <SelectItem value="manual">{t("checkout.enterAddressManually")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="address">{t("checkout.address")}</Label>
                    <Input
                      id="address"
                      required
                      placeholder={t("checkout.streetAddress")}
                      value={formValues.address}
                      onChange={(event) => updateAddressField("address", event.target.value)}
                      className="mt-1 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("checkout.city")}</Label>
                      <Input
                        id="city"
                        required
                        placeholder={t("checkout.city")}
                        value={formValues.city}
                        onChange={(event) => updateAddressField("city", event.target.value)}
                        className="mt-1 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">{t("checkout.zipCode")}</Label>
                      <Input
                        id="zip"
                        required
                        placeholder={t("checkout.zipCode")}
                        value={formValues.zip}
                        onChange={(event) => updateAddressField("zip", event.target.value)}
                        className="mt-1 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">{t("checkout.country")}</Label>
                    <Input
                      id="country"
                      required
                      placeholder={t("checkout.country")}
                      value={formValues.country}
                      onChange={(event) => updateAddressField("country", event.target.value)}
                      className="mt-1 text-base"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="luxury"
                size="lg"
                className="sm:size-xl w-full"
                disabled
              >
                {t(isCheckingAvailability ? "cart.checkingAvailability" : "cart.orderPlacementUnavailable")}
              </Button>
              <p className={`text-sm text-center ${hasStockIssues ? "text-destructive" : "text-muted-foreground"}`}>
                {t(hasStockIssues ? "cart.checkoutBlockedByStock" : "cart.checkoutUnavailableDescription")}
              </p>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 lg:self-start order-first lg:order-last"
          >
            <div className="bg-background p-6 sm:p-8 rounded-sm">
              <h2 className="font-serif text-xl sm:text-2xl mb-4 sm:mb-6">{t("cart.orderSummary")}</h2>

              <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 border-b border-border">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 sm:gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.id}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm sm:text-base break-words">{item.product.name[lang]}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {t("checkout.quantity", { count: item.quantity })}
                      </p>
                      {item.quantity > item.product.available && (
                        <p role="status" className="mt-1 text-xs text-destructive">
                          {t(item.product.available <= 0 ? "products.outOfStock" : "cart.stockExceeded")}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-sm sm:text-base flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 sm:space-y-4 py-4 sm:py-6 border-b border-border">
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
            </div>
          </motion.div>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors my-6 sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("checkout.backToCart")}
        </Link>
      </div>
    </div>
  );
};

export default Checkout;
