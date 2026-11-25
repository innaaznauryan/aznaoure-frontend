import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, CartItem, fetchCart, removeCartItem, updateCartItem } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";

interface CartContextValue {
  state: { items: CartItem[]; isOpen: boolean };
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
  hasStockIssues: boolean;
  isCheckingAvailability: boolean;
  isLoading: boolean;
  hasError: boolean;
  isUpdating: boolean;
  refetchCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const FREE_SHIPPING_THRESHOLD = 25_000;
const STANDARD_SHIPPING_COST = 1_000;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const queryKey = ["cart", user?.id];

  const cartQuery = useQuery({
    queryKey,
    queryFn: fetchCart,
    enabled: Boolean(user) && !isAuthLoading,
  });
  const refetchQuery = cartQuery.refetch;

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey });
  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addCartItem(productId, quantity),
    onSuccess: invalidateCart,
  });
  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: invalidateCart,
  });
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: invalidateCart,
  });

  const items = user ? cartQuery.data ?? [] : [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const hasStockIssues = items.some((item) => item.quantity > item.product.available);
  const shippingCost = totalPrice > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const grandTotal = totalPrice + shippingCost;

  const addItem = async (productId: string, quantity = 1) => {
    if (!user) throw new Error("Sign in to add items to your cart");
    await addMutation.mutateAsync({ productId, quantity });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) throw new Error("Sign in to manage your cart");
    if (quantity <= 0) {
      await removeMutation.mutateAsync(productId);
      return;
    }
    await updateMutation.mutateAsync({ productId, quantity });
  };

  const removeItem = async (productId: string) => {
    if (!user) throw new Error("Sign in to manage your cart");
    await removeMutation.mutateAsync(productId);
  };

  const refetchCart = useCallback(async () => {
    if (!user || isAuthLoading) return;
    await refetchQuery();
  }, [isAuthLoading, refetchQuery, user]);

  return (
    <CartContext.Provider
      value={{
        state: { items, isOpen },
        totalItems,
        totalPrice,
        shippingCost,
        grandTotal,
        hasStockIssues,
        isCheckingAvailability: Boolean(user) && cartQuery.isFetching,
        isLoading: Boolean(user) && cartQuery.isLoading,
        hasError: Boolean(user) && cartQuery.isError,
        isUpdating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
        refetchCart,
        toggleCart: () => setIsOpen((open) => !open),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
