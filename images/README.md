# Vape Product Images

Place your vape product banner images in this folder.

## Recommended Image Specifications:
- **Width:** 1200px
- **Height:** 450px (or 400px)
- **Format:** JPG, PNG, or WebP
- **File Size:** Keep under 500KB for fast loading

## Image File Names:
You can name your images:
- `vape-banner-1.jpg` (for ELUX ASTRA)
- `vape-banner-2.jpg` (for TYN 50000 Puffs)
- `vape-banner-3.jpg` (for Geek Bar)
- `vape-banner-4.jpg` (for RAZ Vape)
- `vape-banner-5.jpg` (for Volf Bar)

Or use any names you prefer and update the URLs in `image-carousel.js`.

## How to Add Images:

1. **Download vape product images** from your supplier or take photos of your products
2. **Resize them** to 1200x450px (or similar aspect ratio)
3. **Save them** in this `images` folder
4. **Update the image URLs** in `image-carousel.js` to point to your images:
   ```javascript
   image: 'images/your-image-name.jpg'
   ```

## Online Image URLs:

If you prefer to host images online, you can use:
- Your own website/server
- Image hosting services (Imgur, Cloudinary, etc.)
- CDN services

Then update the URLs in `image-carousel.js` with the full URL:
```javascript
image: 'https://your-domain.com/images/vape-product.jpg'
```


