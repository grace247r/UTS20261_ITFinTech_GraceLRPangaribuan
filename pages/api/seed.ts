import type { NextApiRequest, NextApiResponse } from "next";
import connectMongoDB from "@/lib/mongodb";
import Product from "@/models/Product";

const dulceProducts = [
  { name: "Strawberry Cloud Cake", description: "A fluffy strawberry cake with soft cream.", category: "Cakes", price: 42000, image: "\u{1F353}", badge: "NEW", available: true },
  { name: "Choco Lava Cup", description: "A rich chocolate cup with a gooey center.", category: "Cakes", price: 32000, image: "\u{1F36B}", badge: "BEST SELLER", available: true },
  { name: "Matcha Dream Roll", description: "A light matcha roll made for tea-time moments.", category: "Pastry", price: 38000, image: "\u{1F375}", badge: null, available: true },
  { name: "Berry Cheesecake", description: "Creamy cheesecake with a bright berry finish.", category: "Cakes", price: 45000, image: "\u{1FAD0}", badge: "NEW", available: true },
  { name: "Caramel Pudding", description: "Silky caramel pudding with a sweet golden sauce.", category: "Pudding", price: 26000, image: "\u{1F36E}", badge: null, available: true },
  { name: "Tiramisu Cup", description: "Coffee cream and cocoa in a little dessert cup.", category: "Pudding", price: 35000, image: "\u2615", badge: "BEST SELLER", available: true },
  { name: "Choco Chip Cookies", description: "Crunchy cookies full of chocolate chips.", category: "Cookies", price: 28000, image: "\u{1F36A}", badge: null, available: true },
  { name: "Peach Soda", description: "A refreshing peach soda with a fizzy finish.", category: "Drinks", price: 22000, image: "\u{1F351}", badge: null, available: true },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "The seed endpoint is available in development only" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Use POST to seed products" });
  }

  try {
    await connectMongoDB();
    let insertedCount = 0;

    for (const product of dulceProducts) {
      const alreadyExists = await Product.exists({ name: product.name });
      if (!alreadyExists) {
        await Product.create(product);
        insertedCount += 1;
      }
    }

    return res.status(200).json({ message: "Seed completed", insertedCount, totalProducts: dulceProducts.length });
  } catch (error) {
    console.error("Unable to seed products:", error);
    return res.status(500).json({ message: "Unable to seed products" });
  }
}
