import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "@/styles/Checkout.module.css";
import cart from "@/styles/Cart.module.css";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const serviceFee = 3000;
const isImageUrl = (image: string) => /^https?:\/\//i.test(image);

export default function CheckoutPage() {
  const { cartItems, selectedItems, selectedSubtotal, selectedProductIds, toggleSelection, selectAll, deselectAll, isSelected, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const fee = selectedItems.length ? serviceFee : 0;
  const total = selectedSubtotal + fee;
  const all = cartItems.length > 0 && selectedProductIds.length === cartItems.length;

  return <><Head><title>Your Sweet Box | Dulce</title></Head><main className={styles.page}><div className={styles.container}>
    <header className={styles.header}><Link href="/" className={styles.backButton}><ArrowLeft size={19} />Back</Link><h1>Your Sweet Box</h1><span /></header>
    {cartItems.length === 0 ? <section className={styles.emptyState}><h2>Your sweet box is still empty.</h2><Link className={styles.primaryButton} href="/#menu">Explore treats</Link></section> : <div className={styles.checkoutLayout}>
      <section className={styles.itemsSection}><p className={styles.eyebrow}>YOUR SELECTED TREATS</p><h2>Ready for a little joy</h2>
        <label className={cart.selectAll}><input type="checkbox" checked={all} onChange={() => all ? deselectAll() : selectAll()} />Select All ({selectedItems.length})</label>
        <div className={styles.itemList}>{cartItems.map((item) => <article key={item.productId} className={cart.item}>
          <input className={cart.checkbox} type="checkbox" checked={isSelected(item.productId)} onChange={() => toggleSelection(item.productId)} />
          <div className={`${cart.image} ${item.color ? cart[item.color] : ""}`}>
            {isImageUrl(item.image) ? <img src={item.image} alt={item.name} /> : <span aria-hidden="true">{item.image}</span>}
          </div>
          <div className={cart.info}><p>{item.category}</p><h3>{item.name}</h3><strong>{rupiah.format(item.price)}</strong></div>
          <div className={cart.actions}><div className={cart.quantity}><button onClick={() => decreaseQuantity(item.productId)}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => increaseQuantity(item.productId)}><Plus size={14} /></button></div><button className={cart.remove} onClick={() => removeFromCart(item.productId)} aria-label={`Remove ${item.name}`}><Trash2 size={17} /></button></div>
        </article>)}</div>
      </section>
      <aside className={styles.summaryCard}><p className={styles.eyebrow}>ORDER SUMMARY</p><h2>A sweet little total</h2><div className={styles.summaryRow}><span>Selected Items: {selectedItems.length}</span><strong>{rupiah.format(selectedSubtotal)}</strong></div><div className={styles.summaryRow}><span>Service Fee</span><strong>{rupiah.format(fee)}</strong></div><div className={styles.totalRow}><span>Total</span><strong>{rupiah.format(total)}</strong></div>{selectedItems.length ? <Link className={styles.primaryButton} href="/payment">Checkout {selectedItems.length} Item{selectedItems.length > 1 ? "s" : ""}</Link> : <button className={styles.primaryButton} disabled>Select Items to Checkout</button>}</aside>
    </div>}
  </div></main></>;
}
