const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, 'admin.js');
let content = fs.readFileSync(adminJsPath, 'utf8');

// Find where the broken function starts
const brokenMarker = '// Function to export current products to a downloadable .js file';
const startIndex = content.indexOf(brokenMarker);

if (startIndex !== -1) {
    const before = content.substring(0, startIndex);
    const correctFunction = `// Function to export current products to a downloadable .js file
function exportDataToFile() {
    try {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        if (products.length === 0) {
            alert("No products to export!");
            return;
        }

        const fileContent = "// Static Product Data\\n// Generated for portability\\nwindow.INITIAL_PRODUCTS = " + JSON.stringify(products, null, 4) + ";\\n";
        
        const blob = new Blob([fileContent], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "products-data.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("✅ products-data.js generated successfully!\\n\\nTo make your changes permanent in the folder:\\n1. Copy the downloaded file\\n2. Replace the existing \\"products-data.js\\" in your website folder\\n3. Now you can move the folder to any PC and the data will be there!");
    } catch (error) {
        console.error("Export error:", error);
        alert("Error generating data file.");
    }
}
window.exportDataToFile = exportDataToFile;`;
    
    fs.writeFileSync(adminJsPath, before + correctFunction);
    console.log('✅ Fixed admin.js');
} else {
    console.log('❌ Could not find the broken part in admin.js');
}




