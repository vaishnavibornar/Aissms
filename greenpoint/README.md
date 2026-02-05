# GreenPoints - Features Documentation

## Complete Feature Breakdown

### 🔐 Authentication System

#### Sign Up
- **Email/Password Registration**
  - Validates email format
  - Requires minimum 6-character password
  - Password confirmation check
  - Username requirement
  - Role selection (Citizen/Admin)
  
- **User Document Creation**
  - Automatic Firestore document creation
  - Initial points set to 0
  - Complaints counter initialized
  - Timestamp of account creation

#### Login
- **Credential Validation**
  - Firebase Authentication verification
  - Error handling for invalid credentials
  - Automatic role detection
  - Redirect based on user role

#### Role-Based Access Control
- **Protected Routes**
  - Citizen routes accessible only to citizens
  - Admin routes accessible only to admins
  - Automatic redirect if wrong role attempts access
  - Session persistence across page refreshes

#### Logout
- **Secure Session Termination**
  - Firebase sign out
  - Context state cleanup
  - Redirect to login page

---

### 👨‍👩‍👧‍👦 Citizen Features

#### 1. Citizen Dashboard

**Statistics Display:**
- Total Points Earned
- Total Complaints Raised
- Resolved Complaints Count
- Pending Complaints Count

**Personal Complaints List:**
- Complaint title and description
- Current status with color coding
- Upvote count
- Priority level indication
- Location information
- Submission date
- Thumbnail image

**Real-time Updates:**
- Firestore onSnapshot listener
- Automatic refresh when data changes
- No page reload needed

**Navigation:**
- Quick access to all citizen features
- Highlighted current page
- Logout option

---

#### 2. Raise Complaint

**Photo Capture System:**
- **Camera Integration**
  - Access device camera directly
  - No gallery/file upload allowed
  - Preview before submission
  - Retake option available
  - Uses `navigator.mediaDevices.getUserMedia()`
  
- **Image Processing**
  - Canvas-based photo capture
  - JPEG format compression
  - Automatic upload to Firebase Storage
  - Unique filename generation
  - URL retrieval and storage

**Location Detection:**
- **GPS Integration**
  - `navigator.geolocation.getCurrentPosition()`
  - Latitude and longitude capture
  - Coordinate-based region identification
  - Permission request handling
  - Error handling for denied permissions

**Form Fields:**
- Title (required, text input)
- Description (required, textarea)
- Anonymous submission checkbox
- All fields validated before submission

**Submission Process:**
1. Validate all required fields
2. Upload image to Firebase Storage
3. Create complaint document in Firestore
4. Update user's complaint counter
5. Redirect to dashboard
6. Show success/error feedback

**Data Stored:**
```javascript
{
  title: string,
  description: string,
  imageUrl: string,
  latitude: number,
  longitude: number,
  region: string,
  userId: string | 'anonymous',
  userEmail: string | 'anonymous',
  anonymous: boolean,
  status: 'pending',
  upvotes: 0,
  upvotedBy: [],
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp
}
```

---

#### 3. Community Feed

**Complaint Display:**
- Grid layout of all complaints
- Card-based design
- Image thumbnails
- Title and description
- Location information
- Upvote count
- Status badge
- Priority indicator

**Upvoting System:**
- **One Vote Per User Per Complaint**
  - Tracked via `upvotedBy` array
  - Visual indication if already upvoted
  - Real-time upvote count updates
  
- **Point Allocation**
  - Complaint creator earns 1 point per upvote
  - Points added to user document
  - Anonymous complaints don't earn points
  
- **Priority Calculation**
  - Low: < 10 upvotes (gray)
  - Medium: 10-19 upvotes (blue)
  - High: 20-49 upvotes (orange)
  - Critical: 50+ upvotes (red)

**Filtering Options:**
- Filter by region
- "All Regions" default view
- Real-time filter application
- Maintains sort order (by upvotes)

**Real-time Updates:**
- Live feed using Firestore listeners
- Automatic refresh on new complaints
- Immediate upvote count changes
- Status updates reflected instantly

---

#### 4. Citizen Profile

**User Information:**
- Avatar with first letter of username
- Username display
- Email display
- Member since date

**Statistics Section:**
- Total Points Earned
- Total Complaints Raised
- Resolved Complaints Count

**Complaints History Table:**
- All complaints in tabular format
- Columns: Title, Status, Upvotes, Date
- Color-coded status badges
- Sortable by date
- Pagination (if needed)

**Community Leaderboard:**
- **Top 10 Contributors**
  - Ranked by points
  - Gold/Silver/Bronze medals for top 3
  - Shows username
  - Displays points and complaint count
  - Highlights current user
  
- **Gamification Elements**
  - Visual medals for top performers
  - Position numbers for others
  - Current user highlighted with special styling

---

#### 5. Emergency & Help

**Emergency Contacts:**
- **Fire Brigade** - 101
  - Icon: 🚒
  - Description: Fire emergencies and rescue
  - Click-to-call functionality
  
- **Ambulance** - 102
  - Icon: 🚑
  - Description: Medical emergencies
  
- **Police** - 100
  - Icon: 👮
  - Description: Law and order emergencies
  
- **Municipal Helpline** - 1800-123-4567
  - Icon: 🏛️
  - Description: Civic and environmental issues

**Frequently Asked Questions:**
1. How to raise a complaint?
2. What happens after submission?
3. How does upvoting work?
4. How to earn points?
5. Can I edit my complaint?
6. What are the different statuses?
7. Why enable location?
8. What types of issues can I report?

**Interactive Design:**
- Collapsible FAQ items
- Click to expand/collapse
- Clean, readable layout
- Search-friendly (if implemented)

---

### 👨‍💼 Administrator Features

#### 1. Admin Dashboard

**Overview Statistics:**
- **Total Complaints** - All time
- **Pending Review** - Awaiting approval
- **Approved** - Verified complaints
- **Assigned** - Given to departments
- **Resolved** - Completed issues
- **High Priority** - 20+ upvotes

**Region-wise Overview:**
- Top 5 regions by complaint count
- Breakdown per region:
  - Total complaints
  - Pending count
  - Resolved count
- Card-based layout

**High Priority Alerts:**
- List of critical complaints (50+ upvotes)
- Shows upvote count
- Displays title and region
- Quick view button
- Sorted by priority (highest first)

**Quick Actions:**
- Manage All Complaints button
- Review Pending button (with count)
- Direct navigation to management screen

**Real-time Updates:**
- Live statistics using Firestore listeners
- Automatic recalculation
- No manual refresh needed

---

#### 2. Manage Complaints

**Advanced Filtering:**
- **By Status:**
  - All Status
  - Pending
  - Approved
  - Assigned
  - Resolved
  - Rejected

- **By Region:**
  - All Regions
  - Individual regions (populated from data)

- **By Priority:**
  - All Priorities
  - Critical (50+ votes)
  - High (20-49 votes)
  - Medium (10-19 votes)
  - Low (<10 votes)

**Complaint Table:**
- **Columns:**
  - Title (with date)
  - Region
  - Priority badge
  - Status badge
  - Upvote count
  - Assigned department
  - Action buttons

- **Color Coding:**
  - Pending: Orange (#f59e0b)
  - Approved: Blue (#3b82f6)
  - Assigned: Purple (#8b5cf6)
  - Resolved: Green (#10b981)
  - Rejected: Red (#ef4444)

**Workflow Actions:**

1. **For Pending Complaints:**
   - ✓ Approve Button
   - ✗ Reject Button
   
2. **For Approved Complaints:**
   - 📋 Assign Button
   
3. **For Assigned Complaints:**
   - ✓ Resolve Button
   
4. **For All Complaints:**
   - 👁️ View Button (modal with details)

**Department Assignment:**
- Available Departments:
  - Waste Management
  - Water Supply
  - Sanitation
  - Roads & Infrastructure
  - Parks & Gardens
  - Environmental Health
  - Public Works

**Detailed View Modal:**
- Full-size image
- Complete description
- All metadata:
  - Region and coordinates
  - Status
  - Upvote count
  - Creation date
  - Assignment details (if applicable)
- Assignment interface (for approved complaints)

**Admin Actions Workflow:**

```
Pending → Approve → Assigned → Resolved
          ↓
        Reject (end)
```

**Real-time Sync:**
- All admins see same data
- Changes reflect immediately
- Conflict resolution (last write wins)

---

## Technical Implementation Details

### State Management

**AuthContext:**
- Current user object
- User role
- Authentication functions
- Loading state
- Automatic auth state persistence

### Real-time Features

**Firestore Listeners:**
```javascript
onSnapshot(query, (snapshot) => {
  // Handle updates
})
```

**Benefits:**
- No polling required
- Instant updates
- Bandwidth efficient
- Automatic reconnection

### Security

**Client-side Validation:**
- Email format check
- Password length validation
- Required field checks
- Image size limits
- Location permission checks

**Firebase Security:**
- Authentication required for all operations
- Role-based access in security rules
- Storage access controls
- Rate limiting (in production)

### Performance Optimizations

**Image Handling:**
- Camera resolution control
- JPEG compression
- Lazy loading in feeds
- Thumbnail generation (recommended)

**Query Optimization:**
- Indexed Firestore queries
- Limit query results
- Pagination (for large datasets)
- Efficient filtering

**Caching:**
- Browser caching for static assets
- Firebase built-in caching
- Service Worker (if implemented)

---

## User Experience Features

### Visual Feedback

**Loading States:**
- Spinner during data fetch
- Button disabled during submission
- "Loading..." messages
- Skeleton screens (recommended)

**Success/Error Messages:**
- Toast notifications
- Error banners
- Success redirects
- Inline validation messages

### Animations

**Entrance Animations:**
- Fade in for sections
- Slide up for cards
- Stagger delays for lists

**Hover Effects:**
- Button lift on hover
- Card shadow increase
- Color transitions
- Scale transformations

**Transitions:**
- Smooth page changes
- Modal fade in/out
- Dropdown animations

### Accessibility

**Keyboard Navigation:**
- Tab order
- Enter to submit
- Escape to close modals

**Screen Reader Support:**
- Semantic HTML
- ARIA labels
- Alt text for images

**Color Contrast:**
- WCAG AA compliance
- High contrast mode support
- Colorblind-friendly palettes

---

## Data Flow Diagrams

### Complaint Lifecycle

```
Citizen Raises Complaint
        ↓
   Stored in Firestore (status: pending)
        ↓
   Admin Views in Dashboard
        ↓
   Admin Approves (status: approved)
        ↓
   Admin Assigns to Department (status: assigned)
        ↓
   Department Works on Issue
        ↓
   Admin Marks Resolved (status: resolved)
        ↓
   Citizen Sees Resolution in Dashboard
```

### Upvoting Flow

```
Citizen Clicks Upvote
        ↓
   Check if already upvoted
        ↓
   If No: Add user ID to upvotedBy array
          Increment upvote count
          Add 1 point to complaint creator
        ↓
   If Yes: Remove user ID from upvotedBy array
           Decrement upvote count
           (No point removal)
        ↓
   UI Updates Automatically (Firestore listener)
```

---

## Best Practices Implemented

### Code Organization
- Component-based architecture
- Separation of concerns
- Reusable components
- Consistent naming conventions

### Error Handling
- Try-catch blocks
- User-friendly error messages
- Graceful degradation
- Fallback UI

### Performance
- Lazy loading
- Code splitting
- Optimized images
- Efficient queries

### Maintainability
- Clear folder structure
- Commented code
- Modular design
- Consistent styling

---

This comprehensive feature set makes GreenPoints a robust, user-friendly platform for community-driven environmental management.
