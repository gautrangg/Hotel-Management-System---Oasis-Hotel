# Hotel Management System - Oasis Hotel

## 📋 Overview

A comprehensive full-stack hotel management system designed to streamline operations at Oasis Hotel. The application handles room reservations, guest management, billing, payments, and AI-powered chatbot support.

## ✨ Features

### Guest & Booking Management
- Guest information management and history tracking
- Room availability checking and real-time updates
- Online room booking and reservation system
- Check-in/check-out management
- Room status tracking (available, occupied, maintenance)

### Billing & Payment
- Automated invoice generation
- Multiple payment methods integration (Stripe)
- Payment tracking and history
- Bill calculation with tax support
- Deposit management

### Staff Management
- Employee profiles and role assignments
- Staff scheduling
- Department management
- Performance tracking

### Reports & Analytics
- Revenue reports and analytics
- Occupancy rate statistics
- Booking trends analysis
- Guest feedback reports

### AI Chatbot
- Intelligent customer support chatbot powered by Gemini AI
- 24/7 guest assistance
- Automatic message cleanup (90-day retention)
- Multi-language support

### Additional Features
- Email notifications (Sendinblue SMTP)
- JWT authentication and authorization
- File upload support (max 10MB)
- Responsive web interface

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **JavaScript/ES6+** - Programming language
- **HTML5 & CSS3** - Markup and styling
- **Axios** - HTTP client

### Backend
- **Java 17+** - Programming language
- **Spring Boot** - Web framework
- **Spring Data JPA** - ORM
- **SQL Server** - Database
- **JWT** - Authentication
- **Stripe API** - Payment processing
- **Gemini AI API** - Chatbot intelligence
- **Brevo (Sendinblue)** - Email service

### Tools & DevOps
- **Maven** - Build tool (Backend)
- **npm** - Package manager (Frontend)
- **Git & GitHub** - Version control
- **IntelliJ IDEA** - Backend IDE
- **VS Code** - Frontend IDE

## 📁 Project Structure

```
Hotel-Management-System---Oasis-Hotel/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/                     # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/hotel/
│   │   │   │       ├── controller/    # REST endpoints
│   │   │   │       ├── service/       # Business logic
│   │   │   │       ├── repository/    # Database access
│   │   │   │       ├── model/         # Entity classes
│   │   │   │       └── config/        # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── .env                    # Environment variables (local only)
│   └── README.md
├── .gitignore
└── README.md

```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- Java 17+
- Maven 3.6+
- SQL Server 2019+
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/gautrangg/Hotel-Management-System---Oasis-Hotel.git
cd Hotel-Management-System---Oasis-Hotel
```

#### 2. Backend Setup

```bash
cd backend

# Create .env file with your credentials
cp .env.example .env
# Edit .env and add your API keys

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will run on: `http://localhost:8080`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on: `http://localhost:61924`

## ⚙️ Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `backend` folder:

```env
# Database
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Service
SPRING_MAIL_USERNAME=your_brevo_email
SPRING_MAIL_PASSWORD=your_brevo_smtp_password
```

## 📚 API Documentation

### Main Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

**Bookings**
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

**Guests**
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Register new guest
- `GET /api/guests/{id}` - Get guest details

**Payments**
- `POST /api/payments` - Process payment
- `GET /api/payments/{id}` - Get payment details

**Chatbot**
- `POST /api/chatbot/message` - Send message to chatbot

For full API documentation, see [ADMIN_BOOKING_APIS.md](backend/ADMIN_BOOKING_APIS.md)

## 🔐 Security Features

- JWT token-based authentication
- Password encryption (BCrypt)
- SQL injection prevention (Parameterized queries)
- CORS configuration
- Secure API endpoints with role-based access control
- Environment variables for sensitive data

## 📊 Database Schema

The application uses SQL Server with the following main tables:
- Users
- Guests
- Rooms
- Bookings
- Payments
- Staff
- ChatBot Messages
- Reports

## 🐛 Known Issues

- None reported at this time

## 🤝 Contributing

This is a project for educational purposes. For improvements or bug reports, please create an issue or fork the repository.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💼 Author

**Gau Trang**
- GitHub: [@gautrangg](https://github.com/gautrangg)

## 📞 Support

For questions or support, please contact or create an issue on GitHub.

---

**Last Updated:** November 2025
