import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import HeroBanner from "@/components/HeroBanner";
import Navbar from "@/components/Navbar";
import ProductCard, { type Product } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import styles from "@/styles/Home.module.css";

type MongoProduct = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  badge: string | null;
  available: boolean;
};

const categories = ["All", "Cakes", "Cookies", "Pastry", "Pudding", "Drinks"];
const productColors: Record<string, string> = {
  "Strawberry Cloud Cake": "pink", "Choco Lava Cup": "chocolate", "Matcha Dream Roll": "matcha", "Berry Cheesecake": "berryDessert",
  "Caramel Pudding": "caramel", "Tiramisu Cup": "coffee", "Choco Chip Cookies": "cookie", "Peach Soda": "peach",
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load products");

        const data: MongoProduct[] = await response.json();
        setProducts(data.map((product) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          image: product.image,
          badge: product.badge,
          available: product.available,
          color: productColors[product.name],
        })));
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => activeCategory === "All" || product.category === activeCategory),
    [activeCategory, products]
  );

  return <><Head><title>Dulc\u00e9 - Sweet things, happy things.</title><meta name="description" content="A playful dessert catalog by Dulce." /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head><main className={styles.page}><div className={styles.container}><Navbar /><HeroBanner /><section className={styles.catalogue} id="menu" aria-labelledby="freshly-baked-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>MADE WITH A LITTLE MAGIC</p><h2 id="freshly-baked-title">Freshly Baked</h2></div><span>{filteredProducts.length} treats</span></div><CategoryFilter categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />{isLoading && <div className={styles.catalogueMessage}>Preparing something sweet...</div>}{error && <div className={styles.catalogueMessage}>Oops, we couldn&apos;t load the treats.</div>}{!isLoading && !error && <div className={styles.productGrid}>{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAddToCart={addToCart} />)}</div>}</section></div></main></>;
}
