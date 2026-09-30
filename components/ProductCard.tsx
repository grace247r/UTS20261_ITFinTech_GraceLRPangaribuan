import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { type CartProduct } from "@/context/CartContext";
import styles from "@/styles/ProductCard.module.css";

export type Product = CartProduct & {
  description: string;
  badge?: string | null;
  available: boolean;
};

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const isUrl = (value: string) => /^https?:\/\//i.test(value);

export default function ProductCard({ product, onAddToCart, onOpen }: { product: Product; onAddToCart: (product: Product) => void; onOpen: (product: Product) => void }) {
  const open = () => onOpen(product);
  const [wasAdded, setWasAdded] = useState(false);

  useEffect(() => {
    if (!wasAdded) return;
    const timer = window.setTimeout(() => setWasAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [wasAdded]);

  return <article className={styles.card} role="button" tabIndex={0} onClick={open} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }}>
    <div className={`${styles.visual} ${product.color ? styles[product.color] : ""}`}>
      {product.badge && <span className={styles.badge}>{product.badge}</span>}
      {isUrl(product.image) ? <img src={product.image} alt={product.name} /> : <span aria-hidden="true">{product.image}</span>}
    </div>
    <button className={`${styles.add} ${wasAdded ? styles.added : ""}`} type="button" onClick={(event) => { event.stopPropagation(); onAddToCart(product); setWasAdded(true); }} aria-label={`Add ${product.name} to cart`}>
      {wasAdded ? "ADDED" : "ADD"} <span className={styles.plus}>{wasAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}</span>
    </button>
    <h3 className={styles.name}>{product.name}</h3>
    <strong className={styles.price}>{rupiah.format(product.price)}</strong>
  </article>;
}
