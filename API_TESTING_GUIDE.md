# API Testing Guide - Profile & Settings Endpoints

This guide provides curl commands and examples to test all the new profile and settings endpoints.

## Prerequisites

1. Backend running on `http://localhost:5000`
2. Valid JWT token from authentication
3. curl installed or use Postman/Insomnia

## Getting a JWT Token

First, you need to authenticate and get a token. Example login request:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response will include a token. Store it as:
```bash
TOKEN="your_jwt_token_here"
```

## Profile Endpoints

### 1. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John Doe",
    "full_name": "John Christopher Doe",
    "headline": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "target_role": "Staff Engineer",
    "avatar_url": null,
    "resume_text": null,
    "resume_file_path": null,
    "resume_file_name": null,
    "role": "user",
    "isVerified": true,
    "createdAt": "2026-08-17T...",
    "updatedAt": "2026-08-17T..."
  }
}
```

### 2. Update Profile

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "headline": "Lead Product Manager",
    "location": "New York, NY",
    "target_role": "Director of Product"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John Doe",
    "full_name": "Jane Doe",
    "headline": "Lead Product Manager",
    "location": "New York, NY",
    "target_role": "Director of Product",
    "avatar_url": null,
    "profileImage": null
  }
}
```

## Resume Endpoints

### 1. Save Resume Text

```bash
curl -X PUT http://localhost:5000/api/users/profile/resume \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "John Doe\n123 Main St\nSan Francisco, CA\njohn@example.com\n\nEXPERIENCE\nSenior Engineer at TechCorp (2020-Present)\n- Led team of 5 engineers\n- Increased performance by 40%\n\nEDUCATION\nB.S. Computer Science, University of California"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume saved successfully",
  "resume_text": "John Doe\n123 Main St\n..."
}
```

### 2. Upload Resume File

```bash
curl -X POST http://localhost:5000/api/users/profile/resume-upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_file_name": "resume.pdf",
    "resume_file_path": "resume-files/resume.pdf",
    "resume_text": "John Doe..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume file uploaded successfully",
  "resume_file_path": "resume-files/resume.pdf",
  "resume_file_name": "resume.pdf"
}
```

### 3. Remove Resume

```bash
curl -X DELETE http://localhost:5000/api/users/profile/resume \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume removed successfully"
}
```

## Settings Endpoints

### 1. Get User Settings

```bash
curl -X GET http://localhost:5000/api/users/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "emailNotifications": true,
    "jobAlerts": true,
    "weeklyDigest": false,
    "theme": "auto",
    "language": "en"
  }
}
```

### 2. Update Settings

Update all settings:
```bash
curl -X PUT http://localhost:5000/api/users/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": false,
    "jobAlerts": true,
    "weeklyDigest": true,
    "theme": "dark",
    "language": "es"
  }'
```

Update specific settings:
```bash
curl -X PUT http://localhost:5000/api/users/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "language": "fr"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "emailNotifications": false,
    "jobAlerts": true,
    "weeklyDigest": true,
    "theme": "dark",
    "language": "es"
  }
}
```

## Using Postman/Insomnia

1. **Create a new request collection** for JobPilot API
2. **Set up authorization:**
   - Type: Bearer Token
   - Token: Paste your JWT token
3. **Import the following requests:**

### Example Postman Collection (JSON)

Save this as `jobpilot-api.postman_collection.json`:

```json
{
  "info": {
    "name": "JobPilot API - Profile & Settings",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Profile",
      "item": [
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/profile",
              "host": ["{{baseUrl}}"],
              "path": ["users", "profile"]
            }
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"full_name\": \"Jane Doe\",\n  \"headline\": \"Product Manager\",\n  \"location\": \"NYC\",\n  \"target_role\": \"Director\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/profile",
              "host": ["{{baseUrl}}"],
              "path": ["users", "profile"]
            }
          }
        }
      ]
    },
    {
      "name": "Settings",
      "item": [
        {
          "name": "Get Settings",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/settings",
              "host": ["{{baseUrl}}"],
              "path": ["users", "settings"]
            }
          }
        },
        {
          "name": "Update Settings",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"emailNotifications\": true,\n  \"theme\": \"dark\",\n  \"language\": \"en\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/settings",
              "host": ["{{baseUrl}}"],
              "path": ["users", "settings"]
            }
          }
        }
      ]
    },
    {
      "name": "Resume",
      "item": [
        {
          "name": "Save Resume Text",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"resume_text\": \"Your resume content here\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/profile/resume",
              "host": ["{{baseUrl}}"],
              "path": ["users", "profile", "resume"]
            }
          }
        },
        {
          "name": "Upload Resume File",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"resume_file_name\": \"resume.pdf\",\n  \"resume_file_path\": \"resume-files/resume.pdf\",\n  \"resume_text\": \"Your resume text\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/profile/resume-upload",
              "host": ["{{baseUrl}}"],
              "path": ["users", "profile", "resume-upload"]
            }
          }
        },
        {
          "name": "Remove Resume",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/profile/resume",
              "host": ["{{baseUrl}}"],
              "path": ["users", "profile", "resume"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid theme: invalid_value. Must be one of: light, dark, auto"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to update profile: [error details]"
}
```

## Testing Tips

1. **Store the token as a Postman variable:**
   ```
   Get the token from login response → Copy → Set as {{token}} variable
   ```

2. **Test in sequence:**
   - Get profile (verify current data)
   - Update profile (make changes)
   - Get profile again (verify changes)

3. **Check MongoDB directly:**
   ```bash
   # Connect to MongoDB
   mongosh
   use jobpilot
   db.users.findOne({email: "user@example.com"})
   ```

4. **Monitor backend logs:**
   - Watch the terminal running `npm run dev` for any errors
   - Check console output for validation errors

## Troubleshooting

**Issue: Token expired**
- Get a new token by logging in again

**Issue: 404 User not found**
- Verify the token is from an existing user
- Check MongoDB for user record

**Issue: Fields not updating**
- Verify field names match exactly (case-sensitive)
- Check for validation errors in response
- Monitor backend console for errors

**Issue: Resume upload fails**
- Verify file size is under 8 MB
- Check file type is supported (.pdf, .docx, .txt, .md, .rtf)
- Ensure resume_file_path is valid

## Performance Tips

- Batch updates when possible (update multiple settings together)
- Use caching headers for profile fetches
- Monitor database query performance
- Consider implementing pagination for large datasets

---

**Last Updated:** 2026-08-17
**API Version:** 1.0.0
