# Dulcé — Sweet things, happy things.

Dulcé is a playful dessert catalogue and payment-gateway project built for a university midterm. It uses the **Next.js Pages Router**, MongoDB with Mongoose, and Midtrans Sandbox Core API.

## Features

- Responsive dessert catalogue with search and category filters
- Product detail modal and quick-add cart action
- Persistent cart using React Context and `localStorage`
- Selective checkout: users choose which cart items to purchase
- Server-side checkout creation with prices recalculated from MongoDB
- Midtrans Sandbox Core API payments: QRIS, GoPay, and BCA Virtual Account
- Verified Midtrans webhook for payment-status updates
- Mobile-friendly checkout and payment pages

## Tech Stack

- Next.js 16, React 19, and TypeScript
- Next.js **Pages Router** (`pages/`)
- MongoDB and Mongoose
- Midtrans Sandbox Core API
- Lucide React and CSS Modules

## Project Structure

```text
components/        Reusable UI components
context/           CartContext and cart state
lib/               MongoDB connection helper
models/            Product, Checkout, and Payment models
pages/             Pages Router screens
pages/api/         Products, checkout, payment, seed, and webhook APIs
styles/            CSS Modules
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Create `.env.local` in this folder. Never commit it or share its credentials.

```env
MONGODB_URI=your_mongodb_connection_string
MIDTRANS_SERVER_KEY=your_midtrans_sandbox_server_key
```

Use a MongoDB Atlas connection string and the **Sandbox Server Key** from Midtrans.

### 3. Seed the sample products

Start the development server:

```bash
npm run dev
```

Open this development-only endpoint once:

```text
http://localhost:3000/api/seed
```

### 4. Open the application

Visit [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev     # Run the development server
npm run build   # Create a production build
npm run start   # Run the production server after building
npm run lint    # Run ESLint
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Dessert catalogue, search, filters, modal, and quick add |
| `/checkout` | Select cart items and review the order total |
| `/payment` | Enter customer information and choose a payment method |

## API Routes

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/products` | `GET` | Return available products from MongoDB |
| `/api/seed` | `GET` | Seed eight Dulcé products in development only |
| `/api/checkout` | `POST` | Validate selected items and create a pending checkout |
| `/api/payment/charge` | `POST` | Create a Midtrans Core API charge |
| `/api/payment/status/[paymentId]` | `GET` | Retrieve saved payment and checkout status |
| `/api/webhook/midtrans` | `POST` | Verify and process Midtrans notifications |

## Checkout and Payment Flow

1. Add products to the cart.
2. Select products to buy on `/checkout`.
3. Complete customer information on `/payment`.
4. The app creates a `PENDING` Checkout in MongoDB.
5. The app sends the authoritative checkout total to Midtrans Core API.
6. Midtrans returns the payment instruction, QR code, VA number, or GoPay link.
7. Midtrans sends a signed server notification to `/api/webhook/midtrans`.
8. The webhook verifies the SHA-512 signature and updates Payment and Checkout status.

The browser does **not** decide the price or total. The checkout API reads product prices from MongoDB and calculates subtotal, service fee, and total on the server.

## Configure the Midtrans Webhook

After deployment, set the Midtrans Sandbox notification URL to:

```text
https://your-domain.com/api/webhook/midtrans
```

For local webhook testing, expose the development server with a secure HTTPS tunnel such as ngrok. The webhook accepts only signed Midtrans notifications.

## Manual Test Checklist

1. Open `/api/seed` and confirm products appear on the homepage.
2. Search or select a category to filter products.
3. Click **ADD** or use the product modal to add items.
4. Refresh to confirm the cart persists.
5. On `/checkout`, select items, adjust quantities, and remove an item.
6. Continue to `/payment`, submit customer information, and select a payment method.
7. Complete a Sandbox payment and verify the status in MongoDB after the webhook arrives.

## Notes

- This project deliberately uses the Pages Router, not the App Router.
- The cart is local to the browser. Purchased items should only be removed after a verified `PAID` webhook notification.
- Keep `.env.local` private. Never expose the Midtrans Server Key to client-side code.
