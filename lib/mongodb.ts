import mongoose from "mongoose";

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("Missing MONGODB_URI. Add it to .env.local before using the database API.");
}

const uri: string = mongodbUri;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // Keep the connection cache during Next.js hot reloads in development.
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export default async function connectMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
