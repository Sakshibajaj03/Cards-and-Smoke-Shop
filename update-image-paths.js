const fs = require('fs');

// Read the admin.js file
let adminJsContent = fs.readFileSync('admin.js', 'utf8');

// Function to convert image path to embedded image call
function convertImagePath(match, imagePath) {
    // Remove 'images/' prefix and quotes
    const cleanPath = imagePath.replace(/^['"]images\//, '').replace(/['"]$/, '');
    return `getProductImage('${cleanPath}')`;
}

// Replace all image paths in the products array
adminJsContent = adminJsContent.replace(/'images\/([^']+)'/g, (match, path) => {
    return `getProductImage('${path}')`;
});

adminJsContent = adminJsContent.replace(/"images\/([^"]+)"/g, (match, path) => {
    return `getProductImage('${path}')`;
});

// Write the updated content back
fs.writeFileSync('admin.js', adminJsContent);

console.log('Image paths updated in admin.js');
