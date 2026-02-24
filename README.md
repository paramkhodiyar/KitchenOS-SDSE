# KitchenOS

KitchenOS is a comprehensive, full-stack Point of Sale (POS) and Kitchen Management System designed for cafes and restaurants. It streamlines operations by integrating order taking, kitchen display, inventory management, and analytics into a single, cohesive platform.

## Features

### Role-Based Access Control
- **Owner**: Full access to dashboard, analytics, settings, and staff management.
- **Cashier**: Optimized POS interface for quick order entry and payment processing.
- **Kitchen**: dedicated display system (KDS) to view and manage incoming orders in real-time.

### Point of Sale (POS)
- Fast and intuitive interface for taking orders.
- Product search and categorization.
- Cart management with quantity adjustments.
- Support for multiple payment modes (Cash, UPI, etc.).
- Conflict detection for "Out of Stock" items with override capabilities for owners.

### Kitchen Display System (KDS)
- Real-time view of new, preparing, and ready orders.
- Status management (Pending -> Preparing -> Ready -> Completed).
- Visual cues for order urgency and status.

### Inventory & Menu Management
- **Products**: Manage menu items, prices, and stock levels.
- **Raw Materials**: Track ingredients and raw material availability (Available, Low, Out).
- **Auto-Status**: Products automatically marked as "Out of Stock" if linked raw materials are depleted.

### Analytics & Reports
- **Revenue**: Visual charts for revenue trends (Daily, Weekly, Monthly).
- **Orders**: Tracking of order volume, completion rates, and cancellations.
- **Stock Alerts**: Real-time alerts for low stock and out-of-stock items.

### Security
- **Store Code**: Unique identifier for accessing store data.
- **PIN Authentication**: Secure, role-specific PINs access (Owner, Cashier, Kitchen).
- **Session Management**: Persistent sessions with secure logout and store switching.

---

## System Design

KitchenOS is built as a monorepo containing both the client and server applications.

### Architecture

- **Frontend**: A comprehensive Single Page Application (SPA) built with performance and user experience in mind. It communicates with the backend via RESTful APIs.
- **Backend**: A robust REST API server that handles business logic, authentication, and database interactions.
- **Database**: Relational database (PostgreSQL) managed via an ORM for structured data persistence.

### Tech Stack

**Frontend**
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS, generic CSS variables for theming.
- **State Management**: Zustand (Global store for Cart, Auth).
- **UI Components**: Custom components built with Radix UI primitives and Lucide Icons.
- **Charts**: Recharts for analytics visualization.
- **Animations**: Framer Motion for smooth UI interactions.

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on Neon Tech).
- **ORM**: Prisma (Schema modeling, migrations, and type-safe queries).
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for PIN hashing.
- **Logging**: Custom middleware for request/error logging.

---

## API Endpoints

The backend exposes a JSON REST API. All protected endpoints require a valid Bearer Token in the `Authorization` header.

### Authentication (`/v1/auth`)

| Method | Endpoint | Description | Access |
|sd|---|---|---|
| POST | `/setup` | Initialize a new store with owner details | Public |
| POST | `/check` | Check if a store code exists | Public |
| POST | `/unlock` | Authenticate user via PIN and Role | Public |
| POST | `/reset-pin` | Reset PIN for specific roles | Owner |

### Products (`/v1/products`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all available products | Authenticated |
| POST | `/` | Create a new product | Owner |
| PUT | `/:id` | Update product details (price, stock) | Owner |
| DELETE | `/:id` | Soft delete/archive a product | Owner |

### Inventory (`/v1/inventory`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List raw materials and statuses | Authenticated |
| POST | `/` | Add new raw material | Owner |
| PATCH | `/:id` | Update raw material status (Available/Low/Out) | Authenticated |

### Orders (`/v1/orders`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Fetch orders (filter by status/date) | Authenticated |
| POST | `/` | Create a new empty order | Cashier/Owner |
| POST | `/:id/items` | Add items to an order | Cashier/Owner |
| PATCH | `/:id/status` | Update order status (Preparing/Ready/Completed) | Kitchen/Owner |

### Accounts & Transactions (`/v1/accounts`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List store accounts (Cash, UPI, etc.) | Owner |
| POST | `/transaction` | Record a payment/transaction for an order | Cashier/Owner |

### Reports (`/v1/reports`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/revenue` | Get revenue data (Custom date range support) | Owner |
| GET | `/orders` | Get order statistics and trends | Owner |
| GET | `/stock` | Get low stock and inventory alerts | Owner |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KitchenOS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env with DATABASE_URL and JWT_SECRET
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Configure .env.local with NEXT_PUBLIC_API_URL
   npm run dev
   ```

4. **Seed Demo Data** (Optional)
   ```bash
   cd backend
   node src/scripts/seed-demo.js
   ```

The application should now be running with Frontend on `https://kitchen-os-seven.vercel.app/` and Backend on `https://kitchenos-mo2z.onrender.com/`.
