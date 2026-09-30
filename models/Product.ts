import { type Model, model, models, Schema, type Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  badge: string | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    badge: { type: String, default: null },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = (models.Product as Model<IProduct>) || model<IProduct>("Product", productSchema);
export default Product;
