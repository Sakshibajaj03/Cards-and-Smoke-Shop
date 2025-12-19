// Slider Images Data
// This file contains slider images for the homepage carousel
// Auto-updated by permanent storage system

// Function to get slider images
// Returns an array of image URLs or base64 data URLs
window.getSliderImages = function() {
    // Try to get from localStorage first (user's current slider images)
    const storedImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
    
    // If there are stored images, return them
    if (storedImages && storedImages.length > 0 && storedImages.some(img => img && img.trim() !== '')) {
        return storedImages;
    }
    
    // Default slider images (placeholder URLs - replace with your actual images)
    return [
        'https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=Slide+1',
        'https://via.placeholder.com/1200x400/E94B3C/FFFFFF?text=Slide+2',
        'https://via.placeholder.com/1200x400/50C878/FFFFFF?text=Slide+3',
        'https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=Slide+4',
        'https://via.placeholder.com/1200x400/9B59B6/FFFFFF?text=Slide+5'
    ];
};

// Store initial slider images data
window.SLIDER_IMAGES_DATA = window.getSliderImages();
