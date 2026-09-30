import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartProduct = { id: string; name: string; price: number; image: string; category: string; color?: string };
export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const storageKey = "dulce-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  useEffect(() => {
    // This runs after hydration, so SSR and the first browser render both use an empty cart.
    const loadCart = window.setTimeout(() => {
      try { setCartItems(JSON.parse(window.localStorage.getItem(storageKey) || "[]")); }
      catch { window.localStorage.removeItem(storageKey); }
      setIsStorageLoaded(true);
    }, 0);
    return () => window.clearTimeout(loadCart);
  }, []);

  useEffect(() => {
    if (isStorageLoaded) window.localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, isStorageLoaded]);

  const addToCart = (product: CartProduct) => setCartItems((items) => {
    const existingItem = items.find((item) => item.id === product.id);
    return existingItem
      ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { ...product, quantity: 1 }];
  });
  const removeFromCart = (productId: string) => setCartItems((items) => items.filter((item) => item.id !== productId));
  const increaseQuantity = (productId: string) => setCartItems((items) => items.map((item) => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (productId: string) => setCartItems((items) => items.flatMap((item) => item.id !== productId ? item : item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : []));
  const clearCart = () => setCartItems([]);

  const value = useMemo(() => ({
    cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart,
    cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
  }), [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
