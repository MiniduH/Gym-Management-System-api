# Barcode Authentication System - Backend Implementation Guide

## Overview

This document outlines the backend implementation for the barcode-based authentication system in the Gym Management System. The system allows admin users to login using barcode scanning for enhanced security and convenience.

## API Endpoints

### 1. Barcode Login
**Endpoint:** `POST /api/auth/barcode-login`

**Purpose:** Authenticate admin users using barcode scanning

**Request Body:**
```json
{
  "userId": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Barcode login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@gym.com",
      "first_name": "John",
      "last_name": "Admin",
      "role": "admin",
      "permissions": [
        { "id": 1, "name": "create" },
        { "id": 2, "name": "read" }
      ]
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresAt": "2026-01-08T00:00:00.000Z",
      "tokenType": "Bearer"
    }
  }
}
```

**Response (Error):**
```json
{
  "error": "Access denied. Only admin users can login via barcode."
}
```

### 2. Get User Barcode Data
**Endpoint:** `GET /api/users/:id/barcode`

**Purpose:** Generate barcode data for a specific user

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "barcodeValue": "GMS000001",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Admin",
      "username": "admin",
      "email": "admin@gym.com",
      "role": "admin"
    }
  }
}
```

## Barcode Format

### Format Specification
- **Prefix:** `GMS`
- **User ID:** Zero-padded to 6 digits
- **Example:** `GMS000001`, `GMS000042`, `GMS001234`

### Generation Logic
```javascript
const generateBarcodeValue = (userId) => {
  return `GMS${userId.toString().padStart(6, '0')}`;
};
```

## Security Implementation

### Access Control
- **Role Validation:** Only users with `role = 'admin'` can use barcode login
- **Status Check:** User must have `status = 'active'`
- **Token Generation:** Standard JWT tokens with same security as password login

### Audit Logging
All barcode login attempts are logged with:
- User ID
- IP Address
- User Agent
- Success/Failure status
- Timestamp

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  department VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Auth Tokens Table
```sql
CREATE TABLE auth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  refresh_expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### Barcode Login Flow

1. **Barcode Scan:** Frontend captures barcode via USB scanner
2. **Format Validation:** Extract user ID from `GMS{6-digit-id}` format
3. **User Lookup:** Query database for user by ID
4. **Role Validation:** Ensure user has admin role
5. **Status Check:** Verify user account is active
6. **Token Generation:** Create JWT access and refresh tokens
7. **Token Storage:** Save tokens in auth_tokens table
8. **Audit Log:** Record login attempt
9. **Response:** Return user data and tokens

### Error Handling

| Error Scenario | HTTP Status | Error Message |
|----------------|-------------|---------------|
| Invalid barcode format | 400 | User ID is required |
| User not found | 404 | User not found |
| Non-admin user | 403 | Access denied. Only admin users can login via barcode. |
| Inactive account | 403 | Account is not active |
| Server error | 500 | Failed to login via barcode |

## Frontend Integration

### Barcode Processing
```javascript
const processBarcodeLogin = async (barcodeText) => {
  // Validate format
  const match = barcodeText.match(/^GMS(\d+)$/);
  if (!match) throw new Error('Invalid barcode format');

  const userId = parseInt(match[1], 10);

  // Call barcode login API
  const response = await fetch('/api/auth/barcode-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  return await response.json();
};
```

### Barcode Generation
```javascript
const getUserBarcode = async (userId) => {
  const response = await fetch(`/api/users/${userId}/barcode`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  return data.data.barcodeValue; // e.g., "GMS000001"
};
```

## Testing

### Unit Tests
```javascript
// Test barcode login for admin user
describe('Barcode Login', () => {
  test('should login admin user via barcode', async () => {
    const response = await request(app)
      .post('/api/auth/barcode-login')
      .send({ userId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens).toBeDefined();
  });

  test('should reject non-admin user', async () => {
    const response = await request(app)
      .post('/api/auth/barcode-login')
      .send({ userId: 2 }); // Regular user

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Only admin users');
  });
});
```

### Integration Tests
```javascript
// Test complete barcode flow
describe('Barcode Authentication Flow', () => {
  test('should generate and validate barcode', async () => {
    // Get barcode for user
    const barcodeResponse = await request(app)
      .get('/api/users/1/barcode')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(barcodeResponse.body.data.barcodeValue).toBe('GMS000001');

    // Login with barcode
    const loginResponse = await request(app)
      .post('/api/auth/barcode-login')
      .send({ userId: 1 });

    expect(loginResponse.status).toBe(200);
  });
});
```

## Deployment Considerations

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=gym
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### Hardware Requirements
- **Barcode Readers:** Any USB barcode scanner that emulates keyboard input
- **Supported Formats:** Code128, Code39, QR codes (with appropriate decoding)
- **No special drivers required**

### Monitoring
- Track barcode login success/failure rates
- Monitor for unusual login patterns
- Log all authentication attempts for security auditing

## Future Enhancements

### Advanced Security
- **Time-based validity:** Barcodes expire after certain time
- **Location-based access:** Restrict login to specific locations
- **Device registration:** Register approved barcode readers

### Additional Features
- **Bulk barcode generation:** Generate barcodes for multiple users
- **Barcode reader management:** Track and manage barcode scanners
- **Offline support:** Cache barcode validation for offline scenarios

### Analytics
- **Usage statistics:** Track barcode login frequency
- **Security reports:** Generate reports on authentication attempts
- **Performance metrics:** Monitor login response times

---

## Quick Reference

**Barcode Format:** `GMS{6-digit-user-id}`
**Login Endpoint:** `POST /api/auth/barcode-login`
**Barcode Data:** `GET /api/users/:id/barcode`
**Allowed Roles:** `admin` only
**Security:** JWT tokens with standard expiry
**Hardware:** USB barcode scanners (keyboard emulation)

For implementation questions, refer to the controller methods in `authController.js` and `usersController.js`.</content>
<parameter name="filePath">/Users/miniduhimal/Documents /Minindu/Projects/GMS/gms-api/BARCODE_AUTHENTICATION_BACKEND_GUIDE.md