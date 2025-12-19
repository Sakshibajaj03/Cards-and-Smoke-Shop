const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\Vrshi0903\\OneDrive\\Desktop\\all files (2)\\all files\\import products.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

const lines = csvContent.split('\n');
const header = lines[0].split(',');

const productsMap = new Map();

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Simple CSV parser (assuming no commas in values based on the sample)
    const [productName, brand, flavor, status] = lines[i].split(',').map(s => s.trim());
    
    if (!productName || !brand) continue;
    
    const key = `${brand}|${productName}`;
    if (!productsMap.has(key)) {
        productsMap.set(key, {
            id: productName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            name: productName,
            brand: brand,
            price: 0, // Need a default price or extract from somewhere
            stock: 100,
            status: status.toLowerCase() === 'available' ? 'available' : 'out of stock',
            flavor: flavor,
            flavors: [],
            image: `images/${brand.toLowerCase()}/${productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.jpg`,
            description: `${productName} by ${brand}. High quality vaping product.`,
            specs: []
        });
    }
    
    const product = productsMap.get(key);
    product.flavors.push({
        name: flavor,
        image: `images/${brand.toLowerCase()}/${productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.jpg`
    });
}

const productsArray = Array.from(productsMap.values());

// Sort by brand then name
productsArray.sort((a, b) => {
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    return a.name.localeCompare(b.name);
});

console.log(JSON.stringify(productsArray, null, 2));

