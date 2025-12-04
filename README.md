# Cards & Smoke Shop - Complete E-commerce Solution

A full-featured e-commerce website built with Firebase Firestore, featuring a modern UI and comprehensive admin panel.

## Features

### Customer Features
- ✅ **Product Catalog** - Browse products with categories and filters
- ✅ **Product Search** - Search products by name or description
- ✅ **Product Details** - Detailed product pages with images and descriptions
- ✅ **Shopping Cart** - Add/remove items, update quantities
- ✅ **Checkout Process** - Complete order placement with shipping information
- ✅ **Order Confirmation** - Order success page with order details
- ✅ **Real-time Updates** - Products update in real-time across all devices

### Admin Features
- ✅ **Dashboard** - Overview with stats (products, orders, revenue)
- ✅ **Product Management** - Add, edit, delete products with full CRUD
- ✅ **Order Management** - View and update order statuses
- ✅ **Category Management** - Organize products by categories
- ✅ **Real-time Monitoring** - See orders and products update live
- ✅ **Stock Management** - Track and manage inventory

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Firebase Firestore (NoSQL Database)
- **Authentication**: Firebase Auth
- **Hosting**: Static files (can be hosted on Firebase Hosting, Netlify, etc.)

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Firestore Database** (Start in test mode for development)
4. Enable **Authentication** (Email/Password)
5. Get your Firebase config from Project Settings

### 2. Configure Firebase

Open `firebase-config.js` and update with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

For development (test mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, implement proper authentication:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Run the Application

Simply open `index.html` in a web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## File Structure

```
├── index.html              # Home/Shop page
├── product.html            # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── order-success.html      # Order confirmation
├── admin.html              # Admin panel
├── firebase-config.js      # Firebase configuration
├── database.js             # Database operations
├── auth.js                 # Authentication
├── app.js                  # Common utilities
├── shop.js                 # Shop page logic
├── product-detail.js       # Product detail logic
├── cart-page.js            # Cart page logic
├── checkout.js             # Checkout logic
├── admin.js                # Admin panel logic
└── styles.css              # All styles
```

## Default Data

The app automatically initializes with:
- 4 default categories (Vape Products, Smoking Accessories, Cards & Games, Tobacco Products)
- 2 sample products

You can add more through the admin panel.

## Admin Access

To access the admin panel:
1. Go to `admin.html`
2. Click "Login" 
3. Register a new account (first user becomes admin)
4. Or use: `admin@cardsandsmoke.com` (if you set it up)

## Features in Detail

### Shopping Cart
- Stored in localStorage for instant access
- Persists across sessions
- Real-time stock validation
- Quantity management

### Order Management
- Automatic stock deduction
- Order status tracking (Pending → Processing → Shipped → Delivered)
- Order history in admin panel
- Email notifications (can be added)

### Product Management
- Full CRUD operations
- Image URLs (can be extended to Firebase Storage)
- Stock tracking
- Category assignment
- Active/Inactive status

## Customization

### Adding Payment Gateway
The checkout currently supports Cash on Delivery. To add online payments:

1. Integrate payment SDK (Razorpay, Stripe, etc.)
2. Update `checkout.js` to handle payment processing
3. Update order status after successful payment

### Adding Images
Currently uses image URLs. To use Firebase Storage:

1. Enable Firebase Storage
2. Add file upload functionality in admin panel
3. Store image URLs in Firestore

### Email Notifications
Add email functionality using:
- Firebase Cloud Functions
- SendGrid
- Nodemailer with a backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- Firestore Documentation: https://firebase.google.com/docs/firestore

---

**Built with ❤️ for Cards & Smoke Shop**

