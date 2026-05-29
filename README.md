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