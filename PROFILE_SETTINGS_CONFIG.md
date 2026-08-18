# Profile & Settings Configuration Guide

## Overview

Complete backend and frontend configuration for user profile and settings management with API integration. This setup provides a seamless experience for users to manage their personal information, resume data, and application preferences.

---

## Backend Configuration

### Database Model (User.js)

Extended User schema with profile and settings fields:

```javascript
// Profile Fields
- full_name: String (max 120 chars)
- headline: String (max 160 chars)
- location: String (max 120 chars)
- target_role: String (max 120 chars)
- avatar_url: String
- profileImage: String (legacy)

// Resume Fields
- resume_text: String
- resume_file_path: String
- resume_file_name: String

// Settings Fields
- settings.emailNotifications: Boolean (default: true)
- settings.jobAlerts: Boolean (default: true)
- settings.weeklyDigest: Boolean (default: false)
- settings.theme: String (enum: 'light', 'dark', 'auto')
- settings.language: String (default: 'en')
```

### API Endpoints

#### Profile Endpoints

**GET /api/users/profile**
- Get current user's profile
- Returns: Full profile object with all fields
- Auth: Required (JWT token)

**PUT /api/users/profile**
- Update profile information
- Body: `{ full_name, headline, location, target_role, avatar_url }`
- Returns: Updated profile
- Auth: Required

#### Resume Endpoints

**PUT /api/users/profile/resume**
- Save resume text
- Body: `{ resume_text }`
- Returns: Saved resume text
- Auth: Required

**POST /api/users/profile/resume-upload**
- Upload resume file
- Body: `{ resume_file_name, resume_file_path, resume_text }`
- Returns: File path and name
- Auth: Required

**DELETE /api/users/profile/resume**
- Remove resume file and text
- Returns: Confirmation message
- Auth: Required

#### Settings Endpoints

**GET /api/users/settings**
- Get user settings
- Returns: Settings object
- Auth: Required

**PUT /api/users/settings**
- Update user settings
- Body: `{ emailNotifications, jobAlerts, weeklyDigest, theme, language }`
- Returns: Updated settings
- Auth: Required

### Controller Functions

Located in `src/controllers/userController.js`:

```javascript
// Profile Operations
exports.getProfile(req, res)
exports.updateProfile(req, res)

// Resume Operations
exports.saveResumeText(req, res)
exports.uploadResumeFile(req, res)
exports.removeResumeFile(req, res)

// Settings Operations
exports.getSettings(req, res)
exports.updateSettings(req, res)
```

### Settings Service

Utility service in `src/services/settingsService.js`:

```javascript
SettingsService.getSettings(userId)
SettingsService.updateSettings(userId, update)
SettingsService.getEmailNotifications(userId)
SettingsService.toggleEmailNotifications(userId, enabled)
SettingsService.toggleJobAlerts(userId, enabled)
SettingsService.setTheme(userId, theme)
SettingsService.setLanguage(userId, language)
SettingsService.resetSettingsToDefaults(userId)
```

---

## Frontend Configuration

### API Functions (lib/profile.ts)

**Profile Functions:**

```typescript
fetchProfile(): Promise<Profile>
// Fetch current user's profile from backend

updateProfile(input: ProfileInput): Promise<User>
// Update profile with new information

updateSettings(settings: Partial<Settings>): Promise<Settings>
// Update user settings
```

**Resume Functions:**

```typescript
saveMasterResume(text: string): Promise<string>
// Save resume text to backend

uploadResumeFile(file: File): Promise<{resume_file_path, resume_file_name}>
// Upload resume file to backend

removeResumeFile(path: string): Promise<{}>
// Remove resume from backend

getResumeFileUrl(path: string): Promise<string>
// Get URL for downloaded resume
```

**Settings Functions:**

```typescript
fetchSettings(): Promise<Settings>
// Get user's settings from backend
```

### Components

**Settings Page** (`routes/_authenticated/settings.tsx`):

- Profile editing form (full_name, headline, location, target_role)
- Master resume upload interface
- Resume text editor
- Integration with React Query for state management
- Toast notifications for success/error feedback

### Type Definitions

```typescript
type Profile = {
  id: string;
  email: string;
  name: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  location: string | null;
  target_role: string | null;
  resume_text: string | null;
  resume_file_path: string | null;
  resume_file_name: string | null;
}

type Settings = {
  emailNotifications: boolean;
  jobAlerts: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
```

---

## Complete Data Flow

### 1. User Profile Update

```
Frontend (settings.tsx)
    ↓
User enters profile info
    ↓
updateProfile() called with ProfileInput
    ↓
API PUT /api/users/profile
    ↓
Backend userController.updateProfile()
    ↓
Mongoose saves to database
    ↓
Response with updated user
    ↓
Frontend updates UI with toast notification
```

### 2. Resume Upload Flow

```
Frontend (settings.tsx)
    ↓
User selects file
    ↓
uploadResumeFile(file) validates and processes
    ↓
Extracts text from text-based files
    ↓
API POST /api/users/profile/resume-upload
    ↓
Backend userController.uploadResumeFile()
    ↓
Mongoose saves file metadata and text
    ↓
Response with file info
    ↓
Frontend stores in localStorage and updates UI
```

### 3. Settings Update Flow

```
Frontend
    ↓
User changes settings preferences
    ↓
updateSettings() called
    ↓
API PUT /api/users/settings
    ↓
Backend userController.updateSettings()
    ↓
Mongoose saves settings
    ↓
Response with updated settings
    ↓
Frontend updates UI
```

---

## Environment Configuration

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobpilot
NODE_ENV=development
PORT=5000

# Auth
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Usage Examples

### Backend - Get User Profile

```javascript
// Route: GET /api/users/profile
// Response:
{
  success: true,
  user: {
    id: "user123",
    email: "user@example.com",
    name: "John Doe",
    full_name: "John Christopher Doe",
    headline: "Senior Software Engineer",
    location: "San Francisco, CA",
    target_role: "Staff Engineer",
    avatar_url: "https://...",
    resume_text: "John Christopher Doe...",
    resume_file_path: "resume-files/resume.pdf",
    resume_file_name: "resume.pdf",
    ...
  }
}
```

### Backend - Update Profile

```javascript
// Route: PUT /api/users/profile
// Body:
{
  full_name: "Jane Doe",
  headline: "Lead Product Manager",
  location: "New York, NY",
  target_role: "Director of Product"
}

// Response:
{
  success: true,
  message: "Profile updated successfully",
  user: {
    id: "user123",
    full_name: "Jane Doe",
    headline: "Lead Product Manager",
    location: "New York, NY",
    target_role: "Director of Product",
    ...
  }
}
```

### Backend - Update Settings

```javascript
// Route: PUT /api/users/settings
// Body:
{
  emailNotifications: true,
  jobAlerts: false,
  weeklyDigest: true,
  theme: "dark",
  language: "es"
}

// Response:
{
  success: true,
  message: "Settings updated successfully",
  settings: {
    emailNotifications: true,
    jobAlerts: false,
    weeklyDigest: true,
    theme: "dark",
    language: "es"
  }
}
```

### Frontend - Fetch and Update Profile

```typescript
import { fetchProfile, updateProfile } from "@/lib/profile";

// Get profile
const profile = await fetchProfile();

// Update profile
await updateProfile({
  full_name: "Jane Smith",
  headline: "Product Manager",
  location: "Boston, MA",
  target_role: "Senior Product Manager"
});
```

---

## Key Features

✅ **Complete Profile Management**
- Full name, headline, location, target role
- Avatar/profile image support
- Timestamps (createdAt, updatedAt)

✅ **Resume Management**
- Resume text editor with AI integration
- File upload support (PDF, DOCX, TXT, MD, RTF)
- Automatic text extraction from files
- Max file size: 8 MB

✅ **Settings & Preferences**
- Email notifications toggle
- Job alerts toggle
- Weekly digest preference
- Theme preference (light/dark/auto)
- Language selection

✅ **API Integration**
- Axios-based HTTP client
- JWT authentication middleware
- Error handling and validation
- Toast notifications

✅ **Data Persistence**
- MongoDB database
- Secure password hashing
- Timestamps for all records
- Atomic updates

---

## Testing the Configuration

### 1. Test Profile Endpoint (Backend)

```bash
# Get profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/profile

# Update profile
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","headline":"Engineer"}' \
  http://localhost:5000/api/users/profile
```

### 2. Test Settings Endpoint

```bash
# Get settings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/settings

# Update settings
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","emailNotifications":false}' \
  http://localhost:5000/api/users/settings
```

### 3. Frontend Settings Page

Navigate to `/settings` when authenticated to see the full UI for profile and settings management.

---

## Troubleshooting

### Profile not saving
- Check authentication token is valid
- Verify user ID in request
- Check MongoDB connection
- Review backend logs for errors

### Resume upload fails
- Validate file type (must be .pdf, .docx, .txt, .md, .rtf)
- Check file size (max 8 MB)
- Verify token in Authorization header
- Check disk space for file storage

### Settings not persisting
- Ensure backend API is responding correctly
- Verify settings schema in User model
- Check for validation errors in response
- Clear browser cache and retry

---

## Security Considerations

✅ **Authentication**
- JWT tokens required for all profile/settings operations
- Middleware validates token before processing

✅ **Authorization**
- Users can only access/modify their own profile
- Admin operations use additional role checks

✅ **Data Validation**
- Input validation using Zod schema
- String length limits enforced
- File type and size restrictions

✅ **Error Handling**
- Sensitive errors not exposed to client
- Consistent error response format
- Logging for debugging

---

## Future Enhancements

- Avatar upload with image processing
- Resume version history
- Profile visibility settings (public/private)
- Resume template selection
- Bulk profile import from LinkedIn
- Email digest scheduling
- Preference export/import

---

**Last Updated:** 2026-08-17
**Version:** 1.0.0
