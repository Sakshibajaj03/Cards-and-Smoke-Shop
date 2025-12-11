# How to Run This Website on Mobile Devices

## Method 1: Using Python Simple HTTP Server (Easiest)

### Step 1: Open Command Prompt or Terminal
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac/Linux**: Open Terminal

### Step 2: Navigate to Your Website Folder
```bash
cd C:\Users\Vrshi0903\Desktop\Website
```

### Step 3: Start the Server

**For Python 3:**
```bash
python -m http.server 8000
```

**For Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

### Step 4: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (e.g., 192.168.1.100)

### Step 5: Access from Mobile
1. Make sure your mobile device is connected to the **same Wi-Fi network** as your computer
2. Open a web browser on your mobile device
3. Type in the address bar:
   ```
   http://YOUR_IP_ADDRESS:8000
   ```
   Example: `http://192.168.1.100:8000`

---

## Method 2: Using Node.js http-server

### Step 1: Install Node.js (if not installed)
Download from: https://nodejs.org/

### Step 2: Install http-server globally
```bash
npm install -g http-server
```

### Step 3: Navigate to Website Folder
```bash
cd C:\Users\Vrshi0903\Desktop\Website
```

### Step 4: Start the Server
```bash
http-server -p 8000
```

### Step 5: Access from Mobile
Same as Method 1 - use your IP address with port 8000

---

## Method 3: Using VS Code Live Server Extension

### Step 1: Install VS Code
Download from: https://code.visualstudio.com/

### Step 2: Install Live Server Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server"
4. Click Install

### Step 3: Open Your Website Folder
1. File → Open Folder
2. Select: `C:\Users\Vrshi0903\Desktop\Website`

### Step 4: Start Live Server
1. Right-click on `index.html`
2. Select "Open with Live Server"
3. The server will start and show your IP address

### Step 5: Access from Mobile
Use the IP address shown in VS Code terminal

---

## Method 4: Using ngrok (For Testing from Anywhere)

### Step 1: Install ngrok
Download from: https://ngrok.com/download

### Step 2: Start Local Server
Use any method above (Python, Node.js, etc.)

### Step 3: Create Public Tunnel
```bash
ngrok http 8000
```

### Step 4: Access from Mobile
1. ngrok will give you a public URL (e.g., `https://abc123.ngrok.io`)
2. Open this URL on your mobile device (works from anywhere, not just same Wi-Fi)

---

## Method 5: Deploy to Free Hosting (Permanent Solution)

### Option A: GitHub Pages (Free)
1. Create a GitHub account
2. Create a new repository
3. Upload your website files
4. Enable GitHub Pages in repository settings
5. Access via: `https://yourusername.github.io/repository-name`

### Option B: Netlify (Free)
1. Go to https://www.netlify.com/
2. Sign up for free account
3. Drag and drop your website folder
4. Get instant live URL

### Option C: Vercel (Free)
1. Go to https://vercel.com/
2. Sign up for free account
3. Import your project
4. Deploy instantly

---

## Troubleshooting

### Can't Access from Mobile?

1. **Check Firewall:**
   - Windows: Allow Python/Node.js through Windows Firewall
   - Mac: System Preferences → Security → Firewall

2. **Check Wi-Fi:**
   - Ensure both devices are on the same network
   - Some public Wi-Fi blocks device-to-device communication

3. **Try Different Port:**
   - If port 8000 is busy, try 3000, 8080, or 5000
   - Example: `python -m http.server 3000`

4. **Check IP Address:**
   - Make sure you're using the correct IP address
   - IP address changes when you reconnect to Wi-Fi

### Mobile Browser Issues?

1. **Clear Browser Cache:**
   - Settings → Clear browsing data

2. **Try Different Browser:**
   - Chrome, Safari, Firefox, Edge

3. **Check Console for Errors:**
   - Open browser developer tools (F12)
   - Check Console tab for JavaScript errors

---

## Quick Start Script (Windows)

Create a file named `start-server.bat` in your website folder:

```batch
@echo off
echo Starting local web server...
echo.
echo Your website will be available at:
ipconfig | findstr /i "IPv4"
echo.
echo Use the IP address above with port 8000
echo Example: http://192.168.1.100:8000
echo.
python -m http.server 8000
pause
```

Double-click this file to start the server!

---

## Recommended Method for Development

**For Quick Testing:** Use Python Simple HTTP Server (Method 1)
**For Better Development:** Use VS Code Live Server (Method 3)
**For Sharing with Others:** Use ngrok (Method 4)
**For Production:** Deploy to Netlify/Vercel (Method 5)

---

## Notes

- The website uses Local Storage, so data is stored in the browser
- Each device will have its own separate data
- For shared data, you'll need a backend server (not included in this setup)
- Make sure to test on actual devices, not just browser emulators






