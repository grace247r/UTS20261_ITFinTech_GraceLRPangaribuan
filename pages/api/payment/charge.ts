import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

type Method = "qris" | "bank_transfer" | "gopay";
const allowedMethods: Method[] = ["qris", "bank_transfer", "gopay"];
const stringValue = (value: unknown) => typeof value === "string" ? value : null;

function actionUrl(actions: unknown, match: string) {
  if (!Array.isArray(actions)) return null;
  const action = actions.find((item) => item && typeof item === "object" && stringValue((item as Record<string, unknown>).name)?.includes(match));
  return action && typeof action === "object" ? stringValue((action as Record<string, unknown>).url) : null;
}

function responseFor(payment: { _id: { toString: () => string }; paymentMethod: string | null; qrCodeUrl: string | null; vaNumber: string | null; bank: string | null; deeplinkUrl: string | null; amount: number; status: string }) {
  const base = { success: true, paymentId: payment._id.toString(), status: payment.status, amount: payment.amount };
  if (payment.paymentMethod === "qris") return { ...base, type: "qris", qrCodeUrl: payment.qrCodeUrl };
  if (payment.paymentMethod === "bank_transfer") return { ...base, type: "bank_transfer", bank: payment.bank, vaNumber: payment.vaNumber };
  return { ...base, type: "gopay", deeplinkUrl: payment.deeplinkUrl };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ message: "Method not allowed" }); }
  const checkoutId = req.body?.checkoutId;
  const paymentMethod = req.body?.paymentMethod;
  if (typeof checkoutId !== "string" || !isValidObjectId(checkoutId)) return res.status(400).json({ message: "A valid checkoutId is required" });
  if (typeof paymentMethod !== "string" || !allowedMethods.includes(paymentMethod as Method)) return res.status(400).json({ message: "Choose a valid payment method" });
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return res.status(500).json({ message: "MIDTRANS_SERVER_KEY is not configured" });

  try {
    await connectMongoDB();
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });
    const existing = await Payment.findOne({ checkoutId: checkout._id, paymentMethod, status: "PENDING" }).sort({ createdAt: -1 });
    if (existing) return res.status(200).json(responseFor(existing));

    const orderId = `DULCE-${checkout._id.toString()}-${Date.now()}`;
    const transactionDetails = { order_id: orderId, gross_amount: checkout.total };
    const customerDetails = { first_name: checkout.customer.name, email: checkout.customer.email, phone: checkout.customer.phone };
    const payload = paymentMethod === "bank_transfer" ? { payment_type: "bank_transfer", transaction_details: transactionDetails, bank_transfer: { bank: "bca" }, customer_details: customerDetails } : { payment_type: paymentMethod, transaction_details: transactionDetails, customer_details: customerDetails };
    const midtransResponse = await fetch("https://api.sandbox.midtrans.com/v2/charge", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}` }, body: JSON.stringify(payload) });
    const body: unknown = await midtransResponse.json();
    if (!midtransResponse.ok || !body || typeof body !== "object") return res.status(502).json({ message: "Midtrans could not create this payment" });
    const data = body as Record<string, unknown>;
    const vaNumbers = Array.isArray(data.va_numbers) ? data.va_numbers[0] as Record<string, unknown> | undefined : undefined;
    const payment = await Payment.create({ checkoutId: checkout._id, externalId: orderId, midtransOrderId: orderId, amount: checkout.total, status: "PENDING", paymentMethod, qrCodeUrl: paymentMethod === "qris" ? actionUrl(data.actions, "generate-qr-code") : null, vaNumber: paymentMethod === "bank_transfer" ? stringValue(vaNumbers?.va_number) : null, bank: paymentMethod === "bank_transfer" ? stringValue(vaNumbers?.bank) || "bca" : null, deeplinkUrl: paymentMethod === "gopay" ? actionUrl(data.actions, "gopay-redirect") || actionUrl(data.actions, "deeplink") : null, transactionId: stringValue(data.transaction_id), snapToken: null, redirectUrl: null, paidAt: null });
    return res.status(201).json(responseFor(payment));
  } catch (error) {
    console.error("Unable to create Core API payment:", error);
    return res.status(500).json({ message: "We could not create your payment. Please try again." });
  }
}
