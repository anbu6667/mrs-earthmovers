# MRS Earthmovers - Backend API

A comprehensive Node.js + Express backend for the MRS Earthmovers mobile application, built for production scalability and reliability.

## 🚀 Overview

This backend API provides all the necessary endpoints for the MRS Earthmovers mobile application, supporting three main user roles:

- **ADMIN**: Fleet management, work assignment, reporting
- **USER**: Work requests, tracking, payments  
- **DRIVER**: Work completion, attendance, reporting

## 🛠 Technology Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Validation**: Express-validator
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **Scheduling**: Node-cron
- **Error Handling**: Centralized error management

## 📁 Project Structure

```
mrs-earthmovers-backend/
├── controllers/           # Route controllers
├── models/               # Mongoose schemas
├── routes/               # API routes
├── middleware/           # Auth & validation
├── services/             # Business logic
├── utils/                # Utility functions
├── config/               # Configuration files
├── server.js             # Main server file
├── package.json
└── .env.example
```

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Setup Instructions

1. **Clone and navigate to the backend directory**:
```bash
cd mrs-earthmovers-backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mrs-earthmovers
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@mrsearthmovers.com

# API Configuration
API_BASE_URL=http://localhost:3000/api
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 Database Schema

### Core Collections

#### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String,
  role: ['ADMIN', 'USER', 'DRIVER'],
  profileImage: String,
  isActive: Boolean,
  lastLogin: Date,
  language: ['en', 'ta'],
  createdAt: Date,
  updatedAt: Date
}
```

#### Vehicles Collection
```javascript
{
  vehicleNumber: String (unique),
  make: String,
  model: String,
  year: Number,
  type: ['JCB', 'Hitachi', 'Rocksplitter', 'Tractor', 'Tipper', 'Compressor'],
  hourlyRate: Number,
  capacity: Number,
  status: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'BREAKDOWN', 'EMERGENCY'],
  lastOdometer: Number,
  lastServiceDate: Date,
  nextServiceDate: Date,
  driver: ObjectId (ref: 'User'),
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### WorkRequests Collection
```javascript
{
  customer: ObjectId (ref: 'User'),
  workType: ['PIPELINE', 'EARTHWORK', 'DEMOLITION', 'ROAD_CONSTRUCTION', 'FOUNDATIONS', 'LANDSCAPING'],
  description: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    pincode: String
  },
  expectedDuration: Number,
  startDate: Date,
  endDate: Date,
  status: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  assignedVehicle: ObjectId (ref: 'Vehicle'),
  assignedDriver: ObjectId (ref: 'User'),
  estimatedCost: Number,
  actualCost: Number,
  paymentStatus: ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED'],
  photos: [ObjectId (ref: 'PhotoProof')],
  completedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### WorkAssignments Collection
```javascript
{
  workRequest: ObjectId (ref: 'WorkRequest'),
  vehicle: ObjectId (ref: 'Vehicle'),
  driver: ObjectId (ref: 'User'),
  startTime: Date,
  endTime: Date,
  status: ['ASSIGNED', 'STARTED', 'REACHED_SITE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  actualDuration: Number,
  actualCost: Number,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: String,
  emergencyStatus: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Attendance Collection
```javascript
{
  driver: ObjectId (ref: 'User'),
  vehicle: ObjectId (ref: 'Vehicle'),
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workHours: Number,
  status: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
  siteName: String,
  workCompleted: Boolean,
  overtimeHours: Number,
  salary: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### PhotoProofs Collection
```javascript
{
  workAssignment: ObjectId (ref: 'WorkAssignment'),
  workRequest: ObjectId (ref: 'WorkRequest'),
  type: ['BEFORE', 'AFTER', 'DURING'],
  title: String,
  description: String,
  imageUrl: String,
  thumbnailUrl: String,
  geolocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  timestamp: Date,
  uploadedBy: ObjectId (ref: 'User'),
  fileSize: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: 'User'),
  verifiedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles |
| POST | `/api/vehicles` | Create new vehicle |
| GET | `/api/vehicles/:id` | Get specific vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |
| GET | `/api/vehicles/available` | Get available vehicles |
| GET | `/api/vehicles/emergency` | Get emergency vehicles |
| PUT | `/api/vehicles/:id/location` | Update vehicle location |

### Work Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/work-requests` | Get work requests |
| POST | `/api/work-requests` | Create work request |
| GET | `/api/work-requests/:id` | Get specific work request |
| PUT | `/api/work-requests/:id/assign` | Assign work to driver |
| PUT | `/api/work-requests/:id/status` | Update work status |
| PUT | `/api/work-requests/:id/payment` | Update payment status |
| GET | `/api/work-requests/customer` | Get customer work requests |
| GET | `/api/work-requests/daily-report` | Get daily report |
| GET | `/api/work-requests/monthly-report` | Get monthly report |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |
| PUT | `/api/attendance/:id` | Update attendance |
| GET | `/api/attendance/driver/:driverId` | Get driver attendance |
| GET | `/api/attendance/daily` | Get daily attendance |
| POST | `/api/attendance/calculate-salary` | Calculate salary |
| PUT | `/api/attendance/bulk` | Bulk update attendance |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers/work-list/:driverId` | Get driver work assignments |
| PUT | `/api/drivers/work-assignments/:id/status` | Update work status |
| GET | `/api/drivers/progress/:driverId` | Get driver progress |
| GET | `/api/drivers/attendance/:driverId` | Get driver attendance |
| POST | `/api/drivers/complaints` | Report complaint |
| GET | `/api/drivers/vehicles/:driverId` | Get driver vehicles |
| GET | `/api/drivers/live-location/:driverId` | Get live location |
| GET | `/api/drivers/dashboard/:driverId` | Get driver dashboard |

### Reports & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/work-requests/daily-report` | Daily revenue report |
| GET | `/api/work-requests/monthly-report` | Monthly revenue report |
| GET | `/api/attendance/daily` | Daily attendance report |

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token expiration handling

### Input Validation
- Request body validation with express-validator
- Schema validation with Mongoose
- SQL injection prevention
- XSS protection

### Rate Limiting
- API endpoint rate limiting
- IP-based rate limiting
- Configurable window and max requests

### CORS Protection
- Configurable CORS settings
- Environment-specific configuration
- Secure header configuration

## 📈 Monitoring & Logging

### Logging System
- Winston-based logging
- Structured JSON logging
- Log levels: error, warn, info, debug
- File and console logging

### Health Monitoring
- Health check endpoint: `GET /api/health`
- Database connection monitoring
- Application performance metrics

## 🔄 Background Jobs

### Scheduled Tasks
- **Daily Maintenance Check**: Runs at 9 AM daily
- **Oil Change Reminders**: Runs daily at midnight
- **Overdue Maintenance Detection**: Automatically updates vehicle status

### Job Scheduling
- Node-cron for scheduling
- Error handling and retries
- Logging for job execution

## 🚀 Production Deployment

### Environment Setup
1. **Production MongoDB**: Set up MongoDB Atlas or dedicated server
2. **Environment Variables**: Configure production environment variables
3. **SSL/TLS**: Set up HTTPS with valid certificates
4. **Reverse Proxy**: Configure nginx for load balancing

### Docker Deployment
```dockerfile
# Use this Dockerfile for containerization
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Performance Optimization
- Connection pooling for MongoDB
- Gzip compression
- Caching strategies
- Database indexing

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
- Unit tests for controllers
- Integration tests for API endpoints
- Service layer tests
- Model validation tests

## 📊 Error Handling

### Error Types
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- File upload errors

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Development Workflow

### Code Standards
- ES6+ JavaScript
- Consistent code formatting
- Meaningful variable names
- Proper error handling
- JSDoc comments

### Version Control
- Git for version control
- Semantic versioning
- Branch naming conventions
- Pull request workflow

## 📞 Support & Documentation

### API Documentation
- Comprehensive API documentation
- Request/response examples
- Authentication flow documentation
- Error code reference

### Support Channels
- Email: support@mrsearthmovers.com
- GitHub Issues for bug reports
- Documentation updates and improvements

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🎯 Future Enhancements

### Phase 1 (Current)
- ✅ Complete API implementation
- ✅ Authentication and authorization
- ✅ Database schema optimization
- ✅ Error handling and logging
- ✅ Rate limiting and security

### Phase 2 (Future)
- 🔄 Advanced analytics API
- 🔄 Real-time notifications with WebSockets
- 🔄 Advanced reporting features
- 🔄 Integration with third-party services

### Phase 3 (Future)
- 🔄 Microservices architecture
- 🔄 API versioning
- 🔄 Advanced caching strategies
- 🔄 GraphQL API support

---

Built with ❤️ for MRS Earthmovers
Professional-grade backend API for earthmoving and construction management