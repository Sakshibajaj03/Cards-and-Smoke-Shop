const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, 'admin.js');
let content = fs.readFileSync(adminJsPath, 'utf8');

const exportFuncSearch = `// Function to export current products to a downloadable .js file
function exportDataToFile() {
    try {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        if (products.length === 0) {
            alert("No products to export!");
            return;
        }

        const fileContent = "// Static Product Data\\n// Generated for portability\\nwindow.INITIAL_PRODUCTS = " + JSON.stringify(products, null, 4) + ";\\n";`;

const exportFuncReplace = `// Function to export all store data to a downloadable .js file
function exportDataToFile() {
    try {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        const brands = JSON.parse(localStorage.getItem("brands") || "[]");
        const flavors = JSON.parse(localStorage.getItem("flavors") || "[]");
        const storeName = localStorage.getItem("storeName") || "Premium Store";
        const sliderImages = JSON.parse(localStorage.getItem("sliderImages") || "[]");

        const storeData = {
            storeName,
            brands,
            flavors,
            sliderImages
        };

        const fileContent = "// Static Store Data\\n// Generated for portability\\n" + 
            "window.INITIAL_PRODUCTS = " + JSON.stringify(products, null, 4) + ";\\n\\n" +
            "window.INITIAL_STORE_DATA = " + JSON.stringify(storeData, null, 4) + ";\\n";`;

content = content.replace(exportFuncSearch, exportFuncReplace);

fs.writeFileSync(adminJsPath, content);
console.log('✅ Updated admin.js export logic');




