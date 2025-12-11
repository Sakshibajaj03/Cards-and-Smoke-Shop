# Images Setup Guide

## How Images Are Stored

Images are stored as **separate files** in the `images` folder, NOT in localStorage. This allows you to easily transfer your website to another computer.

## Folder Structure

```
Website/
├── index.html
├── admin.html
├── app.js
├── admin.js
├── styles.css
├── images/              ← Create this folder
│   ├── product-123.jpg
│   ├── product-456.jpg
│   ├── slider-1.jpg
│   └── slider-2.jpg
└── store-data-2025-01-XX.json
```

## Exporting Your Store (To Transfer to Another Computer)

1. **Go to Admin Panel** → **Data Management**
2. **Click "Export All Data"**
   - This downloads a JSON file with all your data
   - This also downloads all images as separate files
3. **Create an "images" folder** in your website directory
4. **Move all downloaded image files** into the "images" folder:
   - `product-*.jpg` files → images folder
   - `slider-*.jpg` files → images folder
5. **Copy the entire website folder** to your new computer:
   - All HTML, CSS, JS files
   - The "images" folder with all images
   - The JSON file (optional, for backup)

## Importing on New Computer

1. **Make sure the "images" folder exists** with all image files
2. **Open Admin Panel** → **Data Management**
3. **Click "Import Data"** and select the JSON file
4. **Verify images are showing** - if not, check that:
   - The "images" folder is in the same directory as HTML files
   - All image files are in the "images" folder
   - Image filenames match what's in the JSON file

## Adding New Images

1. **Go to Admin Panel** → **Products**
2. **Click "Edit"** on any product
3. **Upload image** using the "Product Image" field
4. **Save the product**
5. **Export again** to get the new image as a file

## Important Notes

- Images are stored as files, so you can see them in the `images` folder
- When you export, images are downloaded as separate files
- Always keep the `images` folder with your website files
- The JSON file references images by filename (e.g., `images/product-123.jpg`)
- If images don't show, check that the `images` folder path is correct

## Troubleshooting

**Images not showing?**
- Check that `images` folder exists in the same directory as HTML files
- Verify image files are actually in the `images` folder
- Check browser console for 404 errors (missing images)
- Make sure image filenames match what's stored in the JSON

**Export not working?**
- Make sure you have products with images uploaded
- Check browser download settings
- Try exporting one product at a time


