# GreenPoints - Community-Driven Environmental Complaint Management System

A full-stack web application built with React JS and Firebase that enables citizens to report environmental and civic issues while allowing administrators to efficiently manage and resolve these complaints.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Key Features Breakdown](#key-features-breakdown)
- [Application Flow](#application-flow)

## ✨ Features

### Citizen Features
- 📷 Camera-based complaint submission (direct camera capture only)
- 📍 Automatic location detection
- 🔒 Anonymous complaint submission option
- 👍 Community upvoting system
- 🎯 Point-based gamification
- 📊 Personal dashboard with complaint tracking
- 👥 Community leaderboard
- 🚨 Emergency contacts and FAQs
- 📱 Real-time complaint status updates

### Administrator Features
- ✅ Complaint approval/rejection workflow
- 📋 Department assignment system
- 🔍 Advanced filtering (region, status, priority)
- 📈 Comprehensive analytics dashboard
- 🏢 Department-wise complaint tracking
- 🚨 High-priority complaint monitoring
- 📊 Real-time statistics

## 🛠️ Technology Stack

### Frontend
- **React JS** (JavaScript - No TypeScript)
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **CSS3** - Custom styling with animations

### Backend & Services
- **Firebase Authentication** - Email/Password authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - Image storage
- **Firebase Hosting** - Optional deployment

## 📁 Project Structure

```
greenpoints/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── Auth.css
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── CitizenDashboard.css
│   │   │   ├── RaiseComplaint.jsx
│   │   │   ├── RaiseComplaint.css
│   │   │   ├── CommunityFeed.jsx
│   │   │   ├── CommunityFeed.css
│   │   │   ├── CitizenProfile.jsx
│   │   │   ├── CitizenProfile.css
│   │   │   ├── Emergency.jsx
│   │   │   └── Emergency.css
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.css
│   │   │   ├── ManageComplaints.jsx
│   │   │   └── ManageComplaints.css
│   │   └── common/
│   │       └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Step 1: Create Vite + React Project

```bash
# Create project with Vite
npm create vite@latest greenpoints

# When prompted:
# ✔ Select a framework: › React
# ✔ Select a variant: › JavaScript (NOT TypeScript)
```

### Step 2: Navigate and Install Dependencies

```bash
# Navigate to project folder
cd greenpoints

# Install base dependencies
npm install

# Install required packages
npm install firebase react-router-dom
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `greenpoints`
4. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** authentication
4. Save changes

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **Test Mode** (for development)
4. Choose a location
5. Click **Enable**

### 4. Set Up Storage

1. Go to **Storage**
2. Click **Get Started**
3. Start in **Test Mode** (for development)
4. Click **Done**

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the web icon `</>`
4. Register your app (name: "GreenPoints Web")
5. Copy the configuration object

### 6. Configure Firebase in Project

Open `src/services/firebase.js` and replace the configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 7. Firestore Security Rules (Optional for Production)

In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Complaints collection
    match /complaints/{complaintId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.uid == resource.data.userId);
    }
  }
}
```

### 8. Storage Security Rules (Optional for Production)

In Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎮 Running the Application

### Development Mode

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 👥 User Roles

### Citizen
- Access after registration with role: "citizen"
- Can raise complaints with photo evidence
- Can upvote community complaints
- Earns points for community engagement
- Tracks personal complaint status

### Administrator
- Access after registration with role: "admin"
- Reviews and approves/rejects complaints
- Assigns complaints to departments
- Monitors high-priority issues
- Tracks resolution metrics

## 🎯 Key Features Breakdown

### 1. Authentication System
- Email/Password authentication via Firebase
- Role-based access control (Citizen/Admin)
- Protected routes based on user role
- Secure logout functionality

### 2. Complaint Raising (Citizen)
- **Camera Integration**: Direct camera capture (no gallery upload)
- **Location Detection**: Auto-fetch GPS coordinates
- **Anonymous Option**: Submit without revealing identity
- **Image Storage**: Firebase Storage integration
- **Metadata**: Title, description, location, timestamp

### 3. Community Feed
- **Real-time Updates**: Live complaint feed using Firestore listeners
- **Upvoting System**: One vote per user per complaint
- **Priority Calculation**: Automatic priority based on upvotes
  - Low: < 10 upvotes
  - Medium: 10-19 upvotes
  - High: 20-49 upvotes
  - Critical: 50+ upvotes
- **Region Filtering**: Filter complaints by geographic area

### 4. Point System
- Citizens earn 1 point for each upvote on their complaints
- Points displayed on profile and leaderboard
- Encourages quality complaint submissions
- Community leaderboard shows top contributors

### 5. Admin Workflow
- **Complaint Lifecycle**:
  1. **Pending** → Awaiting admin review
  2. **Approved** → Verified by admin
  3. **Assigned** → Given to specific department
  4. **Resolved** → Issue fixed
  5. **Rejected** → Invalid complaint

### 6. Dashboard Analytics
- **Citizen Dashboard**:
  - Total points earned
  - Complaints raised
  - Resolved count
  - Pending count
  - Personal complaint history

- **Admin Dashboard**:
  - Total complaints
  - Status-wise breakdown
  - High-priority alerts
  - Region-wise statistics
  - Department performance

### 7. Emergency & Help
- Emergency contact numbers (Fire, Ambulance, Police, Municipal)
- Comprehensive FAQs
- User guidance and support

## 📱 Application Flow

### For Citizens

1. **Sign Up** → Select "Citizen" role
2. **Login** → Access citizen dashboard
3. **Raise Complaint**:
   - Click "Raise Complaint"
   - Open camera and capture photo
   - Enable location
   - Add title and description
   - Choose anonymous option (optional)
   - Submit
4. **Track Status** → View in dashboard
5. **Community Engagement**:
   - Browse Community Feed
   - Upvote important issues
   - Earn points
6. **Profile** → View stats and leaderboard

### For Administrators

1. **Sign Up** → Select "Administrator" role
2. **Login** → Access admin dashboard
3. **Review Complaints**:
   - Go to "Manage Complaints"
   - Filter by status/region/priority
   - View complaint details
4. **Approve/Reject** → Verify authenticity
5. **Assign Department** → Route to responsible team
6. **Mark Resolved** → Close completed issues
7. **Monitor** → Track metrics and performance

## 🎨 Design Philosophy

The application features a clean, civic-focused design aesthetic:

- **Typography**: Bitter (serif headings) + Archivo (sans-serif body)
- **Colors**: Earth-toned greens emphasizing environmental themes
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design approach
- **Accessibility**: High contrast, clear hierarchy

## 🔒 Security Features

- Firebase Authentication for secure user management
- Role-based route protection
- Secure image uploads to Firebase Storage
- Real-time data validation
- Protected API endpoints

## 🌟 Best Practices Implemented

- **Component Architecture**: Modular, reusable components
- **State Management**: React Context API for auth state
- **Real-time Updates**: Firestore listeners for live data
- **Error Handling**: User-friendly error messages
- **Loading States**: Feedback during async operations
- **Responsive Design**: Mobile and desktop optimized
- **Code Organization**: Clear folder structure
- **Naming Conventions**: Consistent and descriptive

## 📝 Future Enhancements

- Push notifications for status updates
- Multi-language support
- Advanced analytics dashboard
- Export reports functionality
- Mobile app (React Native)
- Email notifications
- Comment system on complaints
- Photo comparison (before/after resolution)

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS or localhost (camera requires secure context)
- Check browser permissions
- Verify camera hardware availability

### Location not detected
- Enable location services in browser
- Grant permission when prompted
- Check device GPS settings

### Firebase connection issues
- Verify Firebase configuration in `firebase.js`
- Check Firebase project status
- Ensure all Firebase services are enabled

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite && npm run dev`
- Verify all dependencies are installed

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

This is an educational project. Feel free to fork and enhance!

---

**Built with ❤️ for a cleaner, greener community**
