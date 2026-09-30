import { ArrowUpRight } from "lucide-react";
import styles from "@/styles/Home.module.css";

export default function HeroBanner() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.heroCopy}>
        <p className={styles.heroLabel}>TODAY&apos;S LITTLE JOY</p>
        <h1>Sweeten<br />Your Day</h1>
        <p className={styles.heroText}>Tiny delights, big smiles. Pick a handmade treat for your happiest little moment.</p>
        <a className={styles.heroButton} href="#menu">Explore treats <ArrowUpRight size={19} /></a>
      </div>
      <div className={styles.heroArt} aria-label="A strawberry cake illustration" role="img">
        <span className={styles.sparkleOne}>*</span><span className={styles.sparkleTwo}>*</span><span className={styles.dotOne} /><span className={styles.dotTwo} />
        <div className={styles.cake}><div className={styles.berry}>&hearts;</div><div className={styles.cakeTop} /><div className={styles.cakeCream} /><div className={styles.cakeBase} /></div>
      </div>
    </section>
  );
}
