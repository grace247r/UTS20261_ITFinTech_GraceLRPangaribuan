import type { NextApiRequest, NextApiResponse } from "next";
import { createHash, timingSafeEqual } from "crypto";
import connectMongoDB from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment, { type PaymentStatus } from "@/models/Payment";

type MidtransNotification = {
  order_id?: unknown;
  status_code?: unknown;
  gross_amount?: unknown;
  signature_key?: unknown;
  transaction_status?: unknown;
  transaction_id?: unknown;
  payment_type?: unknown;
  fraud_status?: unknown;
  settlement_time?: unknown;
};

function getPaymentStatus(transactionStatus: string, fraudStatus: string | undefined): PaymentStatus {
  switch (transactionStatus) {
    case "settlement": return "PAID";
    case "capture": return fraudStatus === "accept" ? "PAID" : "PENDING";
    case "deny": case "cancel": case "failure": return "FAILED";
    case "expire": return "EXPIRED";
    case "pending": default: return "PENDING";
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const notification = req.body as MidtransNotification;
  const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type, fraud_status, settlement_time } = notification;
  if (typeof order_id !== "string" || typeof status_code !== "string" || typeof gross_amount !== "string" || typeof signature_key !== "string" || typeof transaction_status !== "string") {
    return res.status(400).json({ message: "Missing required Midtrans notification fields" });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return res.status(500).json({ message: "MIDTRANS_SERVER_KEY is not configured" });

  const expectedSignature = createHash("sha512").update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest("hex");
  const isValidSignature = signature_key.length === expectedSignature.length
    && /^[a-fA-F0-9]+$/.test(signature_key)
    && timingSafeEqual(Buffer.from(signature_key, "hex"), Buffer.from(expectedSignature, "hex"));
  if (!isValidSignature) return res.status(401).json({ message: "Invalid signature" });

  const isMidtransTestNotification = order_id.startsWith("payment_notif_test_");
  if (isMidtransTestNotification) {
    return res.status(200).json({ success: true, message: "Midtrans test notification received" });
  }

  if (process.env.NODE_ENV === "development") console.log("Midtrans notification:", { order_id, transaction_status, payment_type });

  try {
    await connectMongoDB();
    const payment = await Payment.findOne({ midtransOrderId: order_id });
    if (!payment) return res.status(404).json({ message: "Payment not found for this Midtrans order ID" });

    let nextStatus = getPaymentStatus(transaction_status, typeof fraud_status === "string" ? fraud_status : undefined);
    // A delayed non-success notification must never downgrade an already paid payment.
    if (payment.status === "PAID" && nextStatus !== "PAID") nextStatus = "PAID";

    let paymentChanged = payment.status !== nextStatus;
    if (paymentChanged) payment.status = nextStatus;
    if (nextStatus === "PAID") {
      const nextMethod = typeof payment_type === "string" ? payment_type : null;
      if (payment.paymentMethod !== nextMethod) { payment.paymentMethod = nextMethod; paymentChanged = true; }
      if (!payment.paidAt) {
        const settlementDate = typeof settlement_time === "string" ? new Date(settlement_time) : new Date();
        payment.paidAt = Number.isNaN(settlementDate.getTime()) ? new Date() : settlementDate;
        paymentChanged = true;
      }
    }
    if (paymentChanged) await payment.save();

    if (nextStatus === "PAID") {
      const checkout = await Checkout.findById(payment.checkoutId);
      if (checkout && checkout.status !== "PAID") { checkout.status = "PAID"; await checkout.save(); }
    }

    return res.status(200).json({ success: true, message: "Notification processed" });
  } catch (error) {
    console.error("Unable to process Midtrans notification:", error);
    return res.status(500).json({ message: "Unable to process notification" });
  }
}
