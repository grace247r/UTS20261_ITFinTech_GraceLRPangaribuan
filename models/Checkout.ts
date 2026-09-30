import { type Model, model, models, Schema, type Document, type Types } from "mongoose";

export type CheckoutStatus = "PENDING" | "PAID" | "CANCELLED";

export interface ICheckout extends Document {
  items: { productId: Types.ObjectId; name: string; price: number; quantity: number }[];
  customer: { name: string; email: string; phone: string };
  subtotal: number;
  serviceFee: number;
  total: number;
  status: CheckoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutSchema = new Schema<ICheckout>(
  {
    items: [{ productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, name: { type: String, required: true }, price: { type: Number, required: true, min: 0 }, quantity: { type: Number, required: true, min: 1 } }],
    customer: { name: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true, lowercase: true }, phone: { type: String, required: true, trim: true } },
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["PENDING", "PAID", "CANCELLED"], default: "PENDING", required: true },
  },
  { timestamps: true }
);

const Checkout: Model<ICheckout> = (models.Checkout as Model<ICheckout>) || model<ICheckout>("Checkout", checkoutSchema);
export default Checkout;
