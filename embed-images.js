const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = getMimeType(path.extname(filePath));
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    } catch (error) {
        console.error(`Error converting ${filePath}:`, error.message);
        return null;
    }
}

// Get MIME type from extension
function getMimeType(ext) {
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
}

// Scan images directory and create embedded data
function createEmbeddedImages() {
    const imagesDir = path.join(__dirname, 'images');
    const imageData = {};

    function scanDirectory(dir, relativePath = '') {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDirectory(fullPath, path.join(relativePath, item));
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                    const relativeFilePath = path.join(relativePath, item).replace(/\\/g, '/');
                    console.log(`Processing: ${relativeFilePath}`);
                    const base64 = imageToBase64(fullPath);
                    if (base64) {
                        imageData[relativeFilePath] = base64;
                    }
                }
            }
        }
    }

    if (fs.existsSync(imagesDir)) {
        scanDirectory(imagesDir);
    }

    return imageData;
}

// Generate the embedded images JavaScript file
function generateEmbeddedImagesFile() {
    console.log('Scanning images directory...');
    const imageData = createEmbeddedImages();

    console.log(`Found ${Object.keys(imageData).length} images`);

    let jsContent = `// Embedded Images Data - Generated on ${new Date().toISOString()}
// This file contains all product images as base64 encoded data for portability
// Total images: ${Object.keys(imageData).length}

const embeddedImages = {\n`;

    let count = 0;
    const total = Object.keys(imageData).length;

    for (const [filePath, base64] of Object.entries(imageData)) {
        count++;
        jsContent += `    "${filePath}": "${base64}",\n`;
        if (count % 10 === 0) {
            console.log(`Processed ${count}/${total} images...`);
        }
    }

    jsContent += `};

// Function to get embedded image
function getEmbeddedImage(imagePath) {
    // Normalize path separators
    const normalizedPath = imagePath.replace(/^\//, '').replace(/\\/g, '/');
    return embeddedImages[normalizedPath] || null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { embeddedImages, getEmbeddedImage };
}

console.log('Embedded images loaded: ${Object.keys(imageData).length} images');
`;

    fs.writeFileSync('embedded-images.js', jsContent);
    console.log('Embedded images file generated: embedded-images.js');
    console.log(`File size: ${(fs.statSync('embedded-images.js').size / 1024 / 1024).toFixed(2)} MB`);
}

// Run the generation
generateEmbeddedImagesFile();
