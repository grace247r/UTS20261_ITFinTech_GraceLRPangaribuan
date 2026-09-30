import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "@/styles/Checkout.module.css";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const serviceFee = 3000;

export default function PaymentPage() {
  const { cartItems, subtotal } = useCart();
  const total = subtotal + serviceFee;
  return <><Head><title>Payment | Dulce</title></Head><main className={styles.page}><div className={styles.container}><header className={styles.header}><Link href="/checkout" className={styles.backButton}><ArrowLeft size={19} /> Back</Link><h1>Payment</h1><span /></header>{cartItems.length === 0 ? <section className={styles.emptyState}><div className={styles.emptyIcon}>*</div><h2>Your sweet box is still empty.</h2><p>Add treats before continuing to payment.</p><Link className={styles.primaryButton} href="/#menu">Explore treats</Link></section> : <div className={styles.checkoutLayout}><section className={styles.paymentSection}><p className={styles.eyebrow}>ALMOST THERE</p><h2>Customer information</h2><form className={styles.form} onSubmit={(event) => { event.preventDefault(); window.alert("Payment integration will be added next."); }}><label>Name<input required placeholder="Your full name" /></label><label>Email<input type="email" required placeholder="you@example.com" /></label><label>Phone<input type="tel" required placeholder="08xx xxxx xxxx" /></label><div className={styles.methodCard}><CreditCard size={22} /><div><strong>Xendit</strong><span>Secure online payment</span></div><i>Selected</i></div><button className={styles.primaryButton} type="submit">Pay {rupiah.format(total)}</button></form></section><aside className={styles.summaryCard}><p className={styles.eyebrow}>YOUR ORDER</p><h2>{cartItems.length} sweet item{cartItems.length > 1 ? "s" : ""}</h2><div className={styles.miniItems}>{cartItems.map((item) => <div key={item.id}><span>{item.name} x {item.quantity}</span><strong>{rupiah.format(item.price * item.quantity)}</strong></div>)}</div><div className={styles.totalRow}><span>Total</span><strong>{rupiah.format(total)}</strong></div></aside></div>}</div></main></>;
}
