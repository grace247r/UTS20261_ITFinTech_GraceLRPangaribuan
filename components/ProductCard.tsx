import { Plus } from "lucide-react";
import { type CartProduct } from "@/context/CartContext";
import styles from "@/styles/Home.module.css";

export type Product = CartProduct & { description: string; badge?: string | null; available: boolean };
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return <article className={styles.productCard}><div className={`${styles.productImage} ${product.color ? styles[product.color] : ""}`}>{product.badge && <span className={styles.badge}>{product.badge}</span>}<span aria-hidden="true">{product.image}</span><i aria-hidden="true" /></div><div className={styles.productInfo}><p>{product.category}</p><h3>{product.name}</h3><div className={styles.productFooter}><strong>{rupiah.format(product.price)}</strong><button type="button" onClick={() => onAddToCart(product)} aria-label={`Add ${product.name} to cart`}><Plus size={18} strokeWidth={3} /></button></div></div></article>;
}
