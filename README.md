# 🎟️ Eventora – Event Booking Management System

Eventora is a full-stack **Event Booking Management System** that allows users to browse events, view event details, book tickets, and manage their bookings. It also provides an **admin dashboard** for managing events and bookings.

## ✨ Features

### 👤 User

* User registration and login
* JWT-based authentication
* OTP verification
* Browse and search events
* View detailed event information
* Book event tickets
* Cancel bookings
* View booking history and status
* Responsive user interface

### 🔐 Admin

* Role-based access control
* Admin dashboard
* Create, update and delete events
* Manage event ticket availability
* View and manage user bookings
* Approve or reject bookings

### ☁️ Additional Features

* Cloudinary for image and file uploads
* Nodemailer for email/OTP functionality
* Protected routes for authenticated users
* Dynamic event pages using event IDs

## 🛠️ Tech Stack

**Frontend**

* React.js
* React Router
* Tailwind CSS
* Axios
* Vite

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT

**Services**

* Cloudinary
* Nodemailer
* Multer

## 🔄 Application Flow

### User Flow

```text
Register / Login
       ↓
     Home
       ↓
 Browse Events
       ↓
 Event Details
       ↓
   Book Event
       ↓
 OTP Verification
       ↓
  My Dashboard
       ↓
 View / Cancel Booking
```

### Admin Flow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Manage Events
     ↓
Manage Bookings
     ↓
Approve / Reject
```

## 📁 Project Structure

```text
Event-Booking-Management-System/
│
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
└── README.md
```

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Event-Booking-Management-System
```

### 2. Install frontend dependencies

```bash
cd client
npm install
npm run dev
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the server folder and add the required configuration:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

## 🔗 Main Routes

| Route              | Description        |
| ------------------ | ------------------ |
| `/login`           | User Login         |
| `/register`        | User Registration  |
| `/`                | Events Home Page   |
| `/events/:id`      | Event Details      |
| `/dashboard`       | User Dashboard     |
| `/admin`           | Admin Dashboard    |
| `/payment/success` | Successful Payment |
| `/payment/failed`  | Failed Payment     |

## 🎯 Objective

The main objective of Eventora is to provide a simple and secure platform for **online event discovery and booking**, while giving administrators an efficient system to manage events, tickets, and bookings.

## 👨‍💻 Project

**Eventora – Event Booking Management System**

Built using the **MERN Stack** with authentication, role-based access control, dynamic routing, event management, and booking functionality.
