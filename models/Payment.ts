import { type Model, model, models, Schema, type Document, type Types } from "mongoose";
export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";
export interface IPayment extends Document { checkoutId: Types.ObjectId; externalId: string; midtransOrderId: string; snapToken: string | null; redirectUrl: string | null; qrCodeUrl: string | null; vaNumber: string | null; bank: string | null; deeplinkUrl: string | null; transactionId: string | null; amount: number; status: PaymentStatus; paymentMethod: string | null; paidAt: Date | null; createdAt: Date; updatedAt: Date; }
const paymentSchema = new Schema<IPayment>({
  checkoutId: { type: Schema.Types.ObjectId, ref: "Checkout", required: true }, externalId: { type: String, required: true, unique: true, trim: true }, midtransOrderId: { type: String, required: true, unique: true, trim: true },
  snapToken: { type: String, required: false, default: null }, redirectUrl: { type: String, required: false, default: null }, qrCodeUrl: { type: String, required: false, default: null }, vaNumber: { type: String, required: false, default: null }, bank: { type: String, required: false, default: null }, deeplinkUrl: { type: String, required: false, default: null }, transactionId: { type: String, required: false, default: null },
  amount: { type: Number, required: true, min: 0 }, status: { type: String, enum: ["PENDING", "PAID", "EXPIRED", "FAILED"], default: "PENDING", required: true }, paymentMethod: { type: String, default: null }, paidAt: { type: Date, default: null },
}, { timestamps: true });
const Payment: Model<IPayment> = (models.Payment as Model<IPayment>) || model<IPayment>("Payment", paymentSchema);
export default Payment;
