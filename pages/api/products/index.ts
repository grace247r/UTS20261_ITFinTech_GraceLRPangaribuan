import type { NextApiRequest, NextApiResponse } from "next";
import connectMongoDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectMongoDB();
    const products = await Product.find({ available: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(products);
  } catch (error) {
    console.error("Unable to get products:", error);
    return res.status(500).json({ message: "Unable to load products" });
  }
}
