# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "Crads and Smoke")
4. Disable Google Analytics (optional, you can enable it later)
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In your Firebase project, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
   - ⚠️ **Important**: For production, you'll need to set up proper security rules
4. Choose a location (select the closest to your users)
5. Click **"Enable"**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app with a nickname (e.g., "Crads and Smoke Web")
6. Copy the `firebaseConfig` object

## Step 4: Configure Your App

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. For development/testing, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /brands/{document=**} {
      allow read, write: if true;  // ⚠️ Only for testing!
    }
  }
}
```

3. Click **"Publish"**

⚠️ **For Production**: You should implement proper authentication and security rules. Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /brands/{document=**} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

## Step 6: Test Your Setup

1. Open `index.html` in your browser
2. Open browser console (F12)
3. Check for any Firebase errors
4. Try adding a brand/product in the admin panel
5. Refresh the page - data should persist!

## Benefits You'll Get

✅ **Real-time synchronization** - Changes appear instantly across all devices  
✅ **Offline support** - Works even when internet is slow/unavailable  
✅ **Server-based storage** - No more localStorage limitations  
✅ **Better performance** - Fast queries and caching  
✅ **Scalable** - Handles growth easily  
✅ **Free tier** - Generous free quota for small to medium apps

## Firebase Free Tier Limits

- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day

This is more than enough for most small to medium applications!

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console → Project Settings → Authorized domains
- Add your domain (or `localhost` for local testing)

### "Firebase: Error (permission-denied)"
- Check your Firestore security rules
- Make sure rules allow read/write operations

### Data not saving
- Check browser console for errors
- Verify Firebase config is correct
- Check Firestore rules allow writes

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Support](https://firebase.google.com/support)


