import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

type MidtransResponse = { token?: string; redirect_url?: string; status_message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ message: "Method not allowed" }); }
  const checkoutId = req.body?.checkoutId;
  if (typeof checkoutId !== "string" || !isValidObjectId(checkoutId)) return res.status(400).json({ message: "A valid checkoutId is required" });
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return res.status(500).json({ message: "MIDTRANS_SERVER_KEY is not configured" });

  try {
    await connectMongoDB();
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });
    const existingPayment = await Payment.findOne({ checkoutId: checkout._id, status: "PENDING", snapToken: { $exists: true, $ne: "" }, redirectUrl: { $exists: true, $ne: "" } });
    if (existingPayment) return res.status(200).json({ success: true, paymentId: existingPayment._id.toString(), snapToken: existingPayment.snapToken, redirectUrl: existingPayment.redirectUrl, status: "PENDING" });

    const generatedOrderId = `DULCE-${checkout._id.toString()}-${Date.now()}`;
    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}` },
      body: JSON.stringify({ transaction_details: { order_id: generatedOrderId, gross_amount: checkout.total }, customer_details: { first_name: checkout.customer.name, email: checkout.customer.email, phone: checkout.customer.phone } }),
    });
    const responseBody = await midtransResponse.json() as MidtransResponse;
    if (!midtransResponse.ok || !responseBody.token || !responseBody.redirect_url) {
      console.error("Midtrans Snap creation failed:", responseBody.status_message || midtransResponse.status);
      return res.status(502).json({ message: "Midtrans could not create a payment session" });
    }
    const payment = await Payment.create({ checkoutId: checkout._id, externalId: generatedOrderId, midtransOrderId: generatedOrderId, snapToken: responseBody.token, redirectUrl: responseBody.redirect_url, amount: checkout.total, status: "PENDING", paymentMethod: null, paidAt: null });
    return res.status(201).json({ success: true, paymentId: payment._id.toString(), snapToken: payment.snapToken, redirectUrl: payment.redirectUrl, status: "PENDING" });
  } catch (error) {
    console.error("Unable to create Midtrans payment:", error);
    return res.status(500).json({ message: "We could not prepare your payment. Please try again." });
  }
}
