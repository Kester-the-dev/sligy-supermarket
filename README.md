# Sligy E-commerce

A full-stack e-commerce website built with React (frontend) and Express.js (backend). Sligy sells a variety of products including clothes, gadgets, phones, provisions, and supermarket items.

## Features

- Product catalog with categories
- Shopping cart functionality
- Responsive design

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API with product data

## Getting Started

1. Install dependencies for all parts:
   ```
   npm run install-all
   ```

2. Configure email settings for the backend (optional):
   ```
   cp server/.env.example server/.env
   ```
   Then update `server/.env` with your SMTP provider credentials.

3. Start the development servers:
   ```
   npm start
   ```

   This will start both the React app on http://localhost:3000 and the Express server on http://localhost:5000.

## Available Scripts

- `npm run install-client` - Install client dependencies
- `npm run install-server` - Install server dependencies
- `npm run start-client` - Start React development server
- `npm run start-server` - Start Express development server
- `npm start` - Start both servers concurrently

## Local network access

To access the app from another device on the same Wi-Fi network, run the backend only and open the app at your machine's IP address:

```bash
cd server
npm start
```

Then open the URL in your phone or other computer:

```text
http://<your-machine-ip>:5000/
```

Example:

```text
http://172.20.10.7:5000/
```

If you use `npm start` from the root, the React development server will run on port `3000` and that setup is not the cross-device production-style experience.

## Public access from anywhere

To expose your local app with a secure public URL, use `localtunnel`:

```bash
cd server
npm install
npm run tunnel
```

When started, `localtunnel` will print a public `https://...localtunnel.me` URL you can open from any device.

> Note: this repo now includes a Vercel-compatible `/api/products` endpoint, so the product list can load correctly when the site is deployed as a static frontend on Vercel.
