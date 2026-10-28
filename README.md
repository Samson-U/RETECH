# ReTech — Used Electronics Marketplace

ReTech is a premium, monochrome marketplace for buying and selling pre-loved electronics. The project demonstrates a complete Web Technology stack while keeping the interface editorial, responsive, and intentionally restrained.

## Project objectives

- Present carefully curated used electronics through a polished responsive interface.
- Support product search, category/condition filters, price sorting, wishlist state, and product details.
- Provide seller registration, login, listing creation, editing, deletion, and sold-status management.
- Support private buyer-seller negotiations with immutable offers, counteroffers, locked-price agreements, and negotiated checkout.
- Include a repeatable, additive demo catalog covering Computing, Mobiles, Audio, Gaming, Photography, and Accessories.
- Persist users and products in MongoDB through a REST API.
- Demonstrate semantic HTML, custom CSS, React components, Node.js, Express, HTTP, JSON, and REST conventions.

## Technology stack

- HTML5 and JSX for semantic page structure.
- CSS3 with custom variables, Grid, Flexbox, media queries, hover/focus states, and reduced-motion support.
- JavaScript ES6+ for validation, state, API calls, and event handling.
- React with functional components, hooks, Context providers, and React Router.
- Vite for frontend development and production builds.
- Node.js and Express for the backend REST API.
- MongoDB and Mongoose for persistent data storage and schema validation.
- bcryptjs for password hashing.
- JSON Web Tokens for authenticated API requests.
- Lucide React for interface icons.

## Folder structure

```text
WebTechProject/
├── src/
│   ├── components/       Shared UI components
│   ├── context/          Marketplace and authentication state
│   ├── data/             Frontend sample/category data
│   ├── pages/            Home, shop, auth, account, sell, about, details
│   ├── services/         Centralized API service
│   └── styles/           External global stylesheet
├── server/
│   ├── src/
│   │   ├── config/       Environment and MongoDB connection
│   │   ├── controllers/ REST request handlers
│   │   ├── data/         Clearly labeled seed data
│   │   ├── middleware/   Auth, validation, and error handling
│   │   ├── models/       Product, User, Order, chat, offer, and agreement models
│   │   ├── routes/       Auth, account, product, order, and negotiation routes
│   │   └── scripts/      Database seed script
│   ├── uploads/          Persistent local product image uploads
│   └── .env.example
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB Community Server running locally, or a MongoDB Atlas cluster.
- MongoDB Shell (`mongosh`) is useful for inspecting local data.

## Environment configuration

Frontend `.env`:

```text
VITE_API_URL=http://localhost:5000/api
```

Backend `server/.env`:

```text
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017/retech
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
OFFER_EXPIRY_HOURS=48
DEAL_RESERVATION_MINUTES=30
```

Copy the examples on Windows:

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

Never commit `.env` files, passwords, JWT secrets, or real MongoDB connection strings.

## Database setup and run instructions

### Local MongoDB on Windows

Run PowerShell as Administrator and start the MongoDB service:

```powershell
Start-Service MongoDB
```

Then use two terminals.

Terminal 1 — backend:

```powershell
cd C:\Users\samso\OneDrive\Documents\College\WebTechProject\server
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Terminal 2 — frontend:

```powershell
cd C:\Users\samso\OneDrive\Documents\College\WebTechProject
npm install
Copy-Item .env.example .env
npm run dev
```

### MongoDB Atlas

Create a database user and allow the development IP address in Atlas, then put the connection string only in `server/.env`:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/retech?retryWrites=true&w=majority
```

Run the same seed and start commands above.

`npm run seed` upserts the clearly labeled 16-product demo catalog plus a sample seller account without deleting existing product listings. It is safe to rerun for local demonstration data. Ten additional demo products were added for the negotiation and category demonstrations; their prices are illustrative sample data.

## Routes and API

Frontend routes:

- `/` — editorial home page.
- `/shop` — searchable, filterable, sortable product collection.
- `/sell` — authenticated seller listing form.
- `/about` — project point of view.
- `/product/:productId` — product detail page.
- `/cart` — persistent single-quantity shopping cart.
- `/checkout` — authenticated demo pay-on-delivery checkout.
- `/orders` — authenticated buyer order history.
- `/orders/:orderId` — order confirmation and summary.
- `/auth` — registration and login.
- `/account` — authenticated seller listing management.

REST API:

```text
GET    /api/health
GET    /api/products
GET    /api/products/:id
POST   /api/products              Authenticated seller
PUT    /api/products/:id          Listing owner or admin
DELETE /api/products/:id          Listing owner or admin
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me               Authenticated user
GET    /api/account/listings      Authenticated user
GET    /api/products/:id/contact  Authenticated seller-contact workflow
POST   /api/orders                Authenticated demo checkout
GET    /api/orders                Authenticated buyer order history
GET    /api/orders/:id            Authenticated order details
POST   /api/negotiation/conversations                         Start or reopen a private deal chat
GET    /api/negotiation/conversations                         Current user's conversations
GET    /api/negotiation/conversations/:conversationId         Private conversation and history
GET  /api/negotiation/conversations/:conversationId/messages
POST /api/negotiation/conversations/:conversationId/messages
POST   /api/negotiation/conversations/:conversationId/offers
POST   /api/negotiation/offers/:offerId/counter
POST   /api/negotiation/offers/:offerId/accept
POST   /api/negotiation/offers/:offerId/reject
GET    /api/negotiation/agreements/:agreementId
```

Product writes accept the frontend-compatible `name` and `image` fields or the model-oriented `title` and `imageUrl` fields. Product responses include compatibility fields (`id`, `name`, `image`) for the current React UI.

### Product image uploads

Authenticated sellers can upload up to eight JPG, JPEG, PNG, or WebP images per listing. Each file is limited to 5 MB. Multer stores files in `server/uploads` using generated filenames; MongoDB stores only the `/uploads/<filename>` paths. Express serves these files through `/uploads/...`. The directory is created automatically when the server starts and should be included in deployment storage backups.

### Cart and checkout

The cart is persisted in browser localStorage under `retech-cart`, prevents duplicate single-quantity listings, and can be cleared only after a successful order response. Checkout is intentionally a clearly labelled demo pay-on-delivery flow: it creates a MongoDB order, revalidates product price and availability on the server, atomically reserves each available listing, and does not collect card details or claim that payment was received. Order item details are stored as snapshots so order history remains meaningful after product updates.

### Private deals

`MAKE A DEAL` requires authentication and opens a buyer/seller conversation tied to one listing. Conversations, messages, offers, and agreements are private MongoDB records. The frontend polls the conversation every five seconds, keeping the messaging service modular without introducing a second realtime infrastructure dependency. Buyers submit offers; sellers can counter, accept, or reject buyer offers; buyers can accept seller counteroffers. Offers are immutable history records and move through `PENDING`, `COUNTERED`, `ACCEPTED`, `REJECTED`, `EXPIRED`, or `CANCELLED`.

An accepted offer creates an immutable agreement and atomically reserves the available listing for the configured duration. The default reservation is 30 minutes and is released by a server cleanup task, not by the buyer's browser. Negotiated checkout sends only the agreement ID; the backend retrieves the locked amount, verifies ownership, expiry, reservation, and availability, then marks the product sold only when the order is created.

## How the Web Technology concepts are used

- **HTML5 / JSX:** React components render semantic `header`, `main`, `section`, `article`, `form`, `label`, and `footer` structures.
- **CSS3:** `global.css` defines the monochrome design tokens, layout grids, responsive breakpoints, form states, focus states, and reduced-motion behavior.
- **JavaScript:** Form validation, filtering, sorting, local wishlist persistence, API requests, authentication state, and listing actions use ES6+ JavaScript.
- **React:** Components, hooks, Context providers, and Router create reusable pages and interactive UI without duplicating markup.
- **Node.js:** Runs the server-side JavaScript process and database/API integration.
- **Express:** Defines middleware, routes, controllers, CORS, JSON parsing, and centralized error handling.
- **MongoDB:** Persists users and products across server restarts.
- **HTTP methods:** `GET` reads, `POST` creates, `PUT` updates, and `DELETE` removes resources.
- **JSON:** Request and response bodies provide a language-neutral data format between React and Express.
- **REST API:** Resources are represented by `/api/products`, `/api/auth`, and `/api/account` endpoints with conventional status codes.

## Demonstration sequence

1. Start MongoDB, seed the database, then start backend and frontend in separate terminals.
2. Open the home page and identify the header, editorial hero, category grid, curated products, sell banner, and footer.
3. Open Shop and demonstrate a name/description search.
4. Apply a category filter, condition filter, and both price sort directions.
5. Open a product card and show the detail route.
6. Toggle a wishlist heart, refresh, and show that the state remains.
7. Open Sell while logged out and show the seller-account requirement.
8. Register a seller account through `/auth`.
9. Create a listing with the Sell form and show its success feedback.
10. Open My Account, edit the title/description, mark the listing sold, and delete it.
11. Log out and show that protected account/listing actions require authentication again.
12. Explain that MongoDB persistence survives backend restarts, while payment-provider processing is intentionally outside the project scope; demo orders still reserve listings and persist order history.

## Test cases

| ID | Test | Expected result |
|---|---|---|
| QA-01 | Open `/`, `/shop`, `/about`, `/auth`, `/sell`, `/account` | Each route renders without a React crash |
| QA-02 | Search `MacBook` | Matching product cards remain |
| QA-03 | Select Computing, Mobiles, Audio, Gaming | Only the selected category remains |
| QA-04 | Select Excellent, Good, Fair | Only the selected condition remains |
| QA-05 | Sort low-to-high and high-to-low | Product order changes by numeric price |
| QA-06 | Search an unmatched term | Empty-state message appears |
| QA-07 | Toggle wishlist and refresh | Heart state persists in browser storage |
| QA-08 | Register with invalid email/short password | Helpful validation error appears |
| QA-09 | Register with valid seller credentials | Account is created and authenticated |
| QA-10 | Login with incorrect password | `401` response and helpful error |
| QA-11 | Create a valid seller listing | `201` response, listing appears in Shop and Account |
| QA-12 | Edit own listing | Updated title/description persists in MongoDB |
| QA-13 | Mark own listing sold | Status changes between `available` and `sold` |
| QA-14 | Delete own listing | Listing disappears and returns `200` |
| QA-15 | Modify another seller's listing | Server returns `403` |
| QA-16 | Call protected route without token | Server returns `401` |
| QA-17 | Submit invalid product data | Server returns `400` with details |
| QA-18 | Restart backend after creating a listing | MongoDB-backed listing remains |
| QA-19 | Resize to desktop, tablet, and mobile widths | No intentional horizontal overflow; layouts stack responsively |
| QA-20 | Run `npm run build` and `npm run lint` | Both complete successfully |
| QA-21 | Add a product to cart twice | One single-quantity cart entry remains |
| QA-22 | Refresh the cart page | Cart contents and subtotal persist |
| QA-23 | Submit checkout with missing delivery fields | Inline validation prevents submission |
| QA-24 | Purchase an available listing | Order is created, listing becomes sold, and confirmation shows its order number |
| QA-25 | Attempt to purchase a sold listing or own listing | Server rejects the request without creating an order |
| QA-26 | Upload an invalid or oversized image | Client and server reject it with a clear error |
| QA-27 | Click Make a Deal while logged out | User is sent to the authentication page |
| QA-28 | Start a deal with an available listing | Authenticated buyer sees a private conversation |
| QA-29 | Submit, counter, accept, and reject offers | Immutable history and correct permissions are shown |
| QA-30 | Read another user's conversation URL | Server returns `404` without private data |
| QA-31 | Accept an offer on an available listing | Active agreement locks the server-validated amount |
| QA-32 | Checkout an active agreement twice | First order succeeds; later attempt is rejected |
| QA-33 | Let an agreement expire | Cleanup releases the reservation and checkout is rejected |

## Current limitations

- Live MongoDB CRUD/authentication testing requires a configured local MongoDB service or Atlas URI; no database credentials are included.
- JWTs are stored in browser localStorage for this academic phase. A production deployment should consider secure, httpOnly cookies and refresh-token rotation.
- Sample remote images depend on network availability; failed image loads use the bundled local fallback image.
- Payment-provider processing, moderation, email verification, password reset, and advanced admin workflows are intentionally not implemented. Checkout is pay-on-delivery demo order creation only.
- Socket.IO is intentionally not used; the private conversation page uses five-second authenticated polling. A production deployment could replace the transport with Socket.IO without changing the negotiation models or API boundaries.
