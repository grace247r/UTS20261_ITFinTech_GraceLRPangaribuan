import styles from "@/styles/Home.module.css";

type Props = { categories: string[]; activeCategory: string; onCategoryChange: (category: string) => void };
export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: Props) {
  return <div className={styles.categories} aria-label="Dessert categories">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? styles.activeCategory : ""} onClick={() => onCategoryChange(category)}>{category}</button>)}</div>;
}
