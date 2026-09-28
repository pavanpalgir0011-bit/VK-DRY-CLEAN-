# VK Dry Clean — Professional Dry Cleaning & Laundry Service Platform

A modern, responsive, end-to-end full-stack web application built for **VK Dry Clean**, featuring a customer booking website and a comprehensive **Admin Operations Panel**.

---

## 🌟 Key Features

### 👔 Customer Website
* **Homepage (`/`)**: Hero section, service highlights, How It Works (5-stage guide), Why Choose Us, trust metrics, and responsive navigation with mobile drawer.
* **Services Catalog (`/services`)**: Filter by category (*Dry Cleaning, Wash & Fold, Steam Iron, Premium Care, Household, Footwear*), search bar, live price cards, turnaround times, and direct Add-to-Cart.
* **Service Details (`/services/:id`)**: Rich garment care descriptions, interactive quantity counter `[-] qty [+]`, and instant cart addition.
* **Shopping Cart (`/cart`)**: Real-time quantity adjustment, item removal, dynamic Free Pickup progress bar (Unlocked on orders ₹499+), subtotal, delivery fee calculation, and guest login guard.
* **Doorstep Checkout (`/checkout`)**: Customer contact information, address & nearby landmark, scheduled pickup date & time slot picker, order summary, and Cash on Delivery payment support (ready for Razorpay).
* **Order Success (`/order-success/:orderId`)**: Celebratory confetti animation, unique Order ID generation (`VK-2026-XXXX`), order summary, and direct links to live tracking.
* **My Orders (`/orders`)**: Filter orders by *All, Active, Completed, Cancelled* with live status badges.
* **Order Tracking (`/orders/:id`)**: Visual **10-stage live progress timeline**:
  1. *Order Placed*
  2. *Order Accepted*
  3. *Pickup Assigned*
  4. *Picked Up*
  5. *At Store*
  6. *Processing*
  7. *Ready*
  8. *Out for Delivery*
  9. *Delivered*
  *(or Cancelled)*
* **Authentication (`/login`, `/signup`, `/forgot-password`)**:
  * Email + Password signup and login.
  * Google Sign-In support.
  * Instant 1-click test credentials for demo customer and admin testing.
* **Customer Profile (`/profile`)**: Manage personal details, phone number, and default doorstep pickup address.
* **About Us (`/about`)**: Company heritage, closed-loop Italian eco-friendly solvent technology, certified fabric masters.
* **Contact Us (`/contact`)**: Interactive inquiry form connected directly to MongoDB, store location, phone numbers, and working hours.
* **Policies (`/privacy-policy`, `/terms`)**: Comprehensive, professional privacy policies and terms of garment care.

---

### 🛡️ Admin Operations Panel (`/admin`)
* **Admin Login (`/admin/login`)**: Role-based access control protecting all administrative routes.
* **Operational Dashboard (`/admin`)**: Real-time business metrics:
  * *Total Orders, Pending Orders, In Processing, Delivered, Cancelled*
  * *Registered Clients, Total Lifetime Revenue (₹)*
  * *Status Distribution Summary*
  * *Recent Orders Table with quick action buttons*
* **Order Lifecycle Manager (`/admin/orders`)**:
  * Search by order ID, customer name, phone, email.
  * Filter by status and date range.
  * Order status updater modal to advance orders through the 10 stages with custom admin notes.
  * Dedicated full-page view (`/admin/orders/:id`).
* **Services & Price Manager (`/admin/services`)**:
  * Add new services (Name, Category, Price, Unit, Image URL, Turnaround, Active/Inactive, Featured).
  * Edit service details and pricing on the fly (never hardcoded in frontend).
  * Toggle service visibility or delete services.
* **Customer Management (`/admin/customers`)**:
  * Customer directory with order count, total spending, and contact info.
  * Detailed modal showing complete historical orders placed by any customer.
* **Contact Inquiries (`/admin/messages`)**:
  * Review customer inquiries, mark as read/unread, and delete inquiries.

---

## 🔒 Security & Critical Business Rules

1. **Guest Restriction**: Guest users can browse services and view information, but MUST authenticate before checkout or order placement.
2. **Server-Side Price Validation**: The frontend order prices are **never trusted**. When an order is placed, the backend queries the database for each service's current price, calculates subtotal, applies free delivery logic (orders >= ₹499 free, else ₹50), and sets the final order total.
3. **Data Isolation**: Customers can only view their own orders. Admin routes require verified `admin` role JWT tokens.
4. **Persistent Data Storage**: Automatic embedded persistent MongoDB storage or standard MongoDB connection via `MONGODB_URI`.

---

## ⚡ Administrator Credentials & Access

> 🔒 **Hidden Admin Portal Policy**: The Admin Panel is completely isolated from the customer website. There are NO links in the Navbar, Drawer, or Footer. To access the admin portal, open the URL directly:
> **[http://localhost:5173/admin](http://localhost:5173/admin)** or **[http://localhost:5173/admin/login](http://localhost:5173/admin/login)**

| Role | Admin Email | Default Password |
| :--- | :--- | :--- |
| **Owner / Production Administrator** | `pavanpalgir0011@gmail.com` | `Admin@2026` |

---

## 🚀 Running the Project Locally

### 1. Start Both Frontend and Backend Concurrently
From the root directory:
```bash
npm run dev
```

* **Customer Web & Mobile App**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
* **Admin Portal (Direct URL Only)**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 📂 Project Architecture

```text
├── package.json               # Root scripts
├── server/                    # Node.js + Express + Mongoose Backend
│   ├── config/db.js           # Resilient DB connection with port 27017 persistence
│   ├── models/                # User, Service, Order, ContactMessage
│   ├── middleware/auth.js      # JWT & Role authorization
│   ├── routes/                # Auth, Services, Orders, Admin, Contact REST APIs
│   ├── seed.js                # Auto-seed admin, customer, demo services & orders
│   └── server.js              # Express app entry
└── client/                    # Vite + React 18 Frontend
    ├── index.html             # SEO meta & Google Fonts
    ├── src/
    │   ├── index.css          # Modern Vanilla CSS design system tokens
    │   ├── context/           # AuthContext, CartContext, ToastContext
    │   ├── services/api.js    # API service client
    │   ├── components/        # Navbar, Footer, Timeline, StatusBadge, Modal, AdminLayout
    │   ├── pages/             # Home, Services, Detail, Cart, Checkout, Success, Orders, Profile...
    │   └── pages/admin/       # Dashboard, Orders, Services, Customers, Messages
```
