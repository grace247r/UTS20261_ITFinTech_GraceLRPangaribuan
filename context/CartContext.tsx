import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartProduct = { productId: string; name: string; price: number; image: string; category: string; color?: string };
export type CartItem = CartProduct & { quantity: number };
type CartContextValue = { cartItems: CartItem[]; addToCart: (product: CartProduct) => void; removeFromCart: (productId: string) => void; increaseQuantity: (productId: string) => void; decreaseQuantity: (productId: string) => void; clearCart: () => void; cartCount: number; subtotal: number };
const CartContext = createContext<CartContextValue | undefined>(undefined);
const storageKey = "dulce-cart";

function readSavedCart(): CartItem[] {
  try {
    const savedCart: unknown = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(savedCart)) return [];
    return savedCart.flatMap((item): CartItem[] => {
      if (!item || typeof item !== "object") return [];
      const savedItem = item as Record<string, unknown>;
      // Migrate a previous string `id`. Numeric demo IDs are safely removed.
      const productId = typeof savedItem.productId === "string" ? savedItem.productId : typeof savedItem.id === "string" ? savedItem.id : "";
      const quantity = savedItem.quantity;
      if (!productId || typeof savedItem.name !== "string" || typeof savedItem.category !== "string" || typeof savedItem.image !== "string" || typeof savedItem.price !== "number" || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) return [];
      return [{ productId, name: savedItem.name, category: savedItem.category, image: savedItem.image, price: savedItem.price, quantity, color: typeof savedItem.color === "string" ? savedItem.color : undefined }];
    });
  } catch { window.localStorage.removeItem(storageKey); return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  useEffect(() => { const loadCart = window.setTimeout(() => { setCartItems(readSavedCart()); setIsStorageLoaded(true); }, 0); return () => window.clearTimeout(loadCart); }, []);
  useEffect(() => { if (isStorageLoaded) window.localStorage.setItem(storageKey, JSON.stringify(cartItems)); }, [cartItems, isStorageLoaded]);
  const addToCart = (product: CartProduct) => setCartItems((items) => { const exists = items.find((item) => item.productId === product.productId); return exists ? items.map((item) => item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }]; });
  const removeFromCart = (productId: string) => setCartItems((items) => items.filter((item) => item.productId !== productId));
  const increaseQuantity = (productId: string) => setCartItems((items) => items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (productId: string) => setCartItems((items) => items.flatMap((item) => item.productId !== productId ? item : item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : []));
  const clearCart = () => setCartItems([]);
  const value = useMemo(() => ({ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartCount: cartItems.reduce((total, item) => total + item.quantity, 0), subtotal: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) }), [cartItems]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }
