import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Product from "@/models/Product";

const serviceFee = 3000;

type CheckoutRequest = {
  items?: { productId?: string; quantity?: number }[];
  customer?: { name?: string; email?: string; phone?: string };
  shippingAddress?: { recipientName?: string; phone?: string; address?: string; city?: string; postalCode?: string };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { items, customer, shippingAddress } = req.body as CheckoutRequest;
  const name = customer?.name?.trim();
  const email = customer?.email?.trim();
  const phone = customer?.phone?.trim();
  const recipientName = shippingAddress?.recipientName?.trim();
  const shippingPhone = shippingAddress?.phone?.trim();
  const address = shippingAddress?.address?.trim();
  const city = shippingAddress?.city?.trim();
  const postalCode = shippingAddress?.postalCode?.trim();

  if (!name || !email || !phone) return res.status(400).json({ message: "Name, email, and phone are required" });
  if (!recipientName || !shippingPhone || !address || !city || !postalCode) return res.status(400).json({ message: "Complete shipping address information is required" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Your cart must contain at least one item" });

  const requestedQuantities = new Map<string, number>();
  for (const item of items) {
    const quantity = item.quantity;
    if (!item.productId || !isValidObjectId(item.productId) || !Number.isInteger(quantity) || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Each item needs a valid product ID and quantity" });
    }
    requestedQuantities.set(item.productId, (requestedQuantities.get(item.productId) || 0) + quantity);
  }

  try {
    await connectMongoDB();
    const productIds = [...requestedQuantities.keys()];
    const products = await Product.find({ _id: { $in: productIds }, available: true });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more selected treats are unavailable" });
    }

    const checkoutItems = products.map((product) => ({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: requestedQuantities.get(product._id.toString()) || 0,
    }));
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + serviceFee;
    const checkout = await Checkout.create({
      items: checkoutItems,
      customer: { name, email, phone },
      shippingAddress: { recipientName, phone: shippingPhone, address, city, postalCode },
      subtotal,
      serviceFee,
      total,
      status: "PENDING",
    });

    return res.status(201).json({ success: true, checkoutId: checkout._id.toString(), subtotal, serviceFee, total, status: "PENDING" });
  } catch (error) {
    console.error("Unable to create checkout:", error);
    return res.status(500).json({ message: "We could not create your order. Please try again." });
  }
}
