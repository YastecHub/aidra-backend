# 🚀 Aidra Backend

Complete backend API for Aidra donation platform built with TypeScript, Express, MongoDB, and Swagger documentation.

## ✨ Features

- ✅ **TypeScript** - Full type safety
- ✅ **Swagger UI** - Interactive API documentation at `/api-docs`
- ✅ **Request Validation** - express-validator on all routes
- ✅ **JWT Authentication** - Access + Refresh tokens
- ✅ **Email OTP** - Verification & password reset
- ✅ **KYC System** - Document submission & verification
- ✅ **Campaign Management** - CRUD operations
- ✅ **Donation Tracking** - Payment processing
- ✅ **Dashboard Analytics** - Real-time stats

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Update `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/aidra
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 🏃 Running the Server

### Development (with hot reload):
```bash
npm run dev
```

### Build TypeScript:
```bash
npm run build
```

### Production:
```bash
npm start
```

## 📚 API Documentation

Once the server is running, visit:

**Swagger UI:** `http://localhost:5000/api-docs`

Interactive documentation with:
- All endpoints listed
- Request/response schemas
- Try it out feature
- Authentication support

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout (Protected)

### Users
- `GET /api/users/me` - Get profile (Protected)
- `PATCH /api/users/me` - Update profile (Protected)
- `PATCH /api/users/change-password` - Change password (Protected)
- `POST /api/users/kyc/submit` - Submit KYC (Protected)
- `GET /api/users/kyc/status` - Get KYC status (Protected)

### Campaigns
- `POST /api/campaigns` - Create campaign (Protected, KYC required)
- `GET /api/campaigns` - Get all approved, active campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `GET /api/campaigns/my-campaigns` - Get user's campaigns (Protected)
- `PATCH /api/campaigns/:id` - Update campaign (Protected)
- `DELETE /api/campaigns/:id` - Delete campaign (Protected)

### Donations
- `POST /api/donations` - Create donation (Protected)
- `GET /api/donations/my-donations` - Get user's donations (Protected)
- `GET /api/donations/campaign/:id` - Get campaign donations (Protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard stats (Protected)

## 🔐 Authentication

Protected routes require JWT token in header:

```
Authorization: Bearer <your_access_token>
```

## ✅ Request Validation

All routes have input validation using express-validator:

- Email format validation
- Password strength checks
- Required field validation
- Type checking
- MongoDB ID validation

Validation errors return:
```json
{
  "errors": [
    {
      "msg": "Valid email required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 📁 Project Structure

```
src/
├── config/
│   ├── database.ts          # MongoDB connection
│   └── swagger.ts            # Swagger configuration
├── models/
│   ├── User.ts
│   ├── OTP.ts
│   ├── Campaign.ts
│   └── Donation.ts
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── campaignController.ts
│   ├── donationController.ts
│   └── dashboardController.ts
├── services/
│   ├── authService.ts
│   ├── userService.ts
│   ├── campaignService.ts
│   ├── donationService.ts
│   └── dashboardService.ts
├── middleware/
│   ├── auth.ts               # JWT verification
│   ├── rbac.ts               # Role-based access
│   ├── kyc.ts                # KYC verification
│   └── validate.ts           # Validation handler
├── routes/
│   ├── authRoutes.ts         # + Swagger docs
│   ├── userRoutes.ts         # + Swagger docs
│   ├── campaignRoutes.ts     # + Swagger docs
│   ├── donationRoutes.ts     # + Swagger docs
│   └── dashboardRoutes.ts    # + Swagger docs
├── validators/
│   ├── authValidator.ts
│   ├── userValidator.ts
│   ├── campaignValidator.ts
│   └── donationValidator.ts
├── utils/
│   ├── jwt.ts
│   ├── otp.ts
│   └── email.ts
├── types/
│   └── index.ts              # TypeScript interfaces
└── server.ts                 # Entry point
```

## 🧪 Testing the API

### Option 1: Swagger UI (Recommended)
1. Start server: `npm run dev`
2. Open browser: `http://localhost:5000/api-docs`
3. Click "Try it out" on any endpoint
4. Fill in parameters and execute

### Option 2: cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Key Features Explained

### 1. TypeScript Type Safety
All models, controllers, and services are fully typed:
```typescript
interface IUser {
  _id: string;
  email: string;
  fullName: string;
  role: 'donor' | 'campaignOwner' | 'admin';
  // ...
}
```

### 2. Swagger Documentation
Every route has complete Swagger annotations:
```typescript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     // ... full documentation
 */
```

### 3. Request Validation
Validators for every endpoint:
```typescript
export const registerValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty()
];
```

### 4. Middleware Chain
```
Request → Validator → Validate → Auth → RBAC → KYC → Controller
```

## 🔧 Development Tips

### Hot Reload
Uses `ts-node-dev` for instant TypeScript compilation on file changes.

### Type Checking
```bash
npx tsc --noEmit
```

### View Compiled JS
After `npm run build`, check `dist/` folder.

## 📊 Database Models

### User
- Authentication & profile
- KYC status tracking
- Role-based permissions

### Campaign
- Fundraising campaigns
- Goal tracking
- Owner relationship

### Donation
- Payment records
- Transaction tracking
- Campaign updates

### OTP
- Email verification
- Password reset
- Auto-expiry (TTL index)

## 🚀 Next Steps

1. **File Upload**: Add Multer + AWS S3 for images
2. **Payment Gateway**: Integrate Stripe/PayPal
3. **Admin Panel**: KYC approval endpoints
4. **Real-time**: Socket.io for live updates
5. **Testing**: Jest + Supertest
6. **Docker**: Containerization
7. **CI/CD**: GitHub Actions

## 📝 License

MIT

---

**Built with:** TypeScript, Express, MongoDB, Mongoose, JWT, Swagger, express-validator
