# Premium Store - E-commerce Website

A professional, fully-featured e-commerce website with admin panel for managing products, brands, flavors, and images.

## 🚀 Portability - Copy to Any PC

This website is designed to be **completely portable**. Simply copy the entire folder to any Windows PC and it will work exactly the same way with all your data, images, and settings preserved.

### What's Included for Portability:
- ✅ **Embedded Images**: All product and slider images are embedded as base64 in the code
- ✅ **Automatic Data Initialization**: All store data initializes automatically on first load
- ✅ **localStorage Persistence**: Settings, products, brands, and cart data persist locally
- ✅ **No External Dependencies**: Everything works offline without internet connection
- ✅ **Cross-PC Compatibility**: Works identically on any Windows computer

### How to Transfer to Another PC:
1. Copy the entire `Website - Copy` folder
2. Paste it anywhere on the new computer
3. Open `index.html` in any web browser
4. All your products, images, settings, and data will be there!

### Excel Import for Bulk Data Entry:
Use the admin panel's Excel import feature to quickly add hundreds of products with brands and flavors automatically created.

## Features

### Customer Features
1. **Homepage**
   - Store name and admin login button in header
   - Automatic image slider with 5 images (auto-rotating every 5 seconds)
   - Left and right side image viewers for featured items
   - Product filters (Search, Brand, Flavor, Price Range, Sort)
   - Product grid display with view and add to cart buttons

2. **Product Detail Page**
   - Full product information
   - Multiple product images with thumbnail navigation
   - Product specifications
   - Quantity selector
   - Add to cart functionality

3. **Shopping Cart**
   - View all cart items
   - Update quantities
   - Remove items
   - Order summary with subtotal, tax, and shipping
   - Payment form with checkout functionality

### Admin Features
1. **Store Settings**
   - Change store name

2. **Data Export & Import**
   - **Export All Data**: Download all store data as JSON file
   - **Import Data**: Import data from another computer
   - **Import Excel with Brands**: Upload Excel file with products, brands, and flavors
   - **Download Excel Template**: Get a sample Excel file to fill out
   - **Create Backup**: Create a backup including cart data
   - Perfect for transferring your store to another PC

3. **Excel Import Features**
   - Automatically creates brands if they don't exist
   - Automatically creates flavors if they don't exist
   - Creates brand-flavor associations automatically
   - Supports multiple flavors per product (comma or semicolon separated)
   - Includes help and template download

3. **Slider Images Management**
   - Upload 5 slider images (one for each slide)
   - Images are stored locally and displayed on homepage

4. **Brands Management**
   - Add new brands
   - Delete existing brands
   - Brands are used in product filters

5. **Flavors Management**
   - Add new flavors
   - Delete existing flavors
   - Flavors are used in product filters

6. **Products Management**
   - Add new products with:
     - Product name, price, brand, flavor
     - Description and specifications
     - Main product image (upload from device)
     - Additional images (optional, multiple)
     - Stock quantity and status
   - Edit existing products
   - Delete products
   - All product data is manageable from admin panel

## File Structure

```
Website/
├── index.html          # Main homepage
├── product-detail.html # Product detail page
├── cart.html          # Shopping cart page
├── admin.html         # Admin panel
├── styles.css         # All styling
├── app.js             # Main JavaScript functionality
├── admin.js           # Admin panel functionality
└── README.md          # This file
```

## Transferring Data to Another Computer

### Export Data
1. Open the admin panel
2. Scroll to "Data Export & Import" section
3. Click "Export All Data" button
4. Save the downloaded JSON file
5. Copy this file to another computer (via USB, email, cloud storage, etc.)

### Import Data
1. On the new computer, open the website files
2. Open the admin panel
3. Scroll to "Data Export & Import" section
4. Click "Import Data" button
5. Select the exported JSON file
6. Confirm the import
7. All your data (products, brands, flavors, images, store name) will be restored!

**Note**: The exported file contains all images as base64 data, so the file size may be large. This is normal.

## Mobile & Tablet Support

The website is fully responsive and optimized for:
- **Mobile phones** (320px and up)
- **Tablets** (481px - 1024px)
- **Desktop** (1025px and up)

### Mobile Features
- Touch-friendly buttons (minimum 44px touch targets)
- Swipe gestures for image slider
- Responsive grid layouts
- Optimized font sizes
- Mobile-friendly forms (prevents zoom on input focus)

### Tablet Features
- Optimized layouts for medium screens
- Touch support for all interactions
- Responsive product grids

## How to Use

### For Customers

1. **Browse Products**
   - Visit `index.html` to see all products
   - Use filters to find specific products
   - Click "View" to see product details
   - Click "Add to Cart" to add items to cart

2. **View Product Details**
   - Click "View" button on any product
   - See full product information, images, and specifications
   - Select quantity and add to cart

3. **Shopping Cart**
   - Click cart icon in header to view cart
   - Update quantities or remove items
   - Click "Proceed to Checkout" to enter payment information
   - Complete order (demo - no actual payment processing)

### For Admin

1. **Access Admin Panel**
   - Click "Admin Login" button in header
   - No password required (static website)

2. **Manage Store**
   - **Store Settings**: Update store name
   - **Slider Images**: Upload 5 images for homepage slider
   - **Brands**: Add/delete product brands
   - **Flavors**: Add/delete product flavors
   - **Products**: Add/edit/delete products with images

3. **Adding Products**
   - Click "+ Add New Product"
   - Fill in all required fields (marked with *)
   - Upload main product image (required)
   - Upload additional images (optional)
   - Click "Save Product"

4. **Editing Products**
   - Find product in products list
   - Click "Edit" button
   - Modify any fields
   - Upload new images if needed
   - Click "Save Product"

## Data Storage

All data is stored in browser's LocalStorage:
- Store settings
- Products
- Brands
- Flavors
- Slider images
- Shopping cart

**Note**: Data is stored locally in your browser. If you clear browser data, all information will be lost. For production use, consider implementing a backend database.

## Image Upload

- All images are converted to base64 format and stored in LocalStorage
- Supported formats: JPG, PNG, GIF, etc.
- For best performance, use optimized images (recommended max 500KB per image)

## Browser Compatibility

Works on all modern browsers:
- Chrome (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop & iOS)
- Edge (Desktop & Mobile)
- Opera (Desktop & Mobile)

## Mobile Testing

To test on mobile:
1. **Option 1**: Open the HTML files directly on your mobile device
2. **Option 2**: Use a local server and access via your network IP
3. **Option 3**: Use browser developer tools to simulate mobile devices

## Customization

### Changing Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* ... */
}
```

### Modifying Layout
All layout styles are in `styles.css`. The website is responsive and works on mobile devices.

## Notes

- This is a static website - no server required
- All data is stored in browser LocalStorage
- Images are stored as base64 strings
- No actual payment processing (demo only)
- Perfect for local use or hosting on static hosting services

## Support

For questions or issues, refer to the code comments in each file.
