import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "@/styles/Home.module.css";

export default function Navbar() {
  const { cartCount } = useCart();
  return <header className={styles.navbar}><a className={styles.logo} href="#top" aria-label="Dulce home">Dulce<span>&bull;</span></a><nav className={styles.navLinks} aria-label="Main navigation"><a href="#menu">Menu</a><a href="#freshly-baked-title">Fresh picks</a></nav><div className={styles.navActions}><button className={styles.iconButton} type="button" aria-label="Search desserts"><Search size={20} strokeWidth={2.5} /></button><Link className={styles.cartButton} href="/checkout" aria-label={`${cartCount} items in cart`}><ShoppingBag size={19} strokeWidth={2.5} /><span>{cartCount}</span></Link></div></header>;
}
