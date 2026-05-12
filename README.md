# Smart Complaint Management System

A full-stack web application for managing complaints within an organization — submit, track, assign, and resolve issues with AI-powered assistance.

**Live Demo:** [smart-complaint-managemen1t.netlify.app](https://smart-complaint-managemen1t.netlify.app)

---

## Features

- **Role-based access** — separate dashboards for Users, Staff, and Admins
- **Submit complaints** with title, description, category, priority, and file attachments
- **Track complaints** publicly via complaint ID (no login required)
- **AI suggestions** — automated priority detection and response drafting
- **Real-time notifications** — in-app bell notifications for status updates and comments
- **Google OAuth** — sign in with Google alongside email/password auth
- **Cloudinary uploads** — attach images or documents to complaints
- **Comment threads** — discussion on each complaint between user and staff
- **Admin panel** — manage users, assign staff, view analytics with charts
- **QR code sharing** — share complaint detail links via QR code

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 + Vite | UI framework and build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Recharts | Analytics charts |
| qrcode.react | QR code generation |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Passport.js | Google OAuth |
| Cloudinary + Multer | File uploads |
| Nodemailer | Email notifications |

### Deployment
| Service | Role |
|---------|------|
| Netlify | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## Project Structure

```
complaint-system/
├── src/                        # React frontend
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Track.jsx           # Public complaint tracker
│   │   ├── Dashboard/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── Complaint/
│   │   │   ├── ComplaintForm.jsx
│   │   │   └── ComplaintDetail.jsx
│   │   ├── Onboarding/
│   │   └── Profile/
│   ├── components/             # Navbar, Sidebar, ProtectedRoute, etc.
│   ├── context/                # AuthContext
│   └── utils/                  # apiClient, aiClient
│
└── backend/                    # Express API
    ├── server.js
    ├── config/                 # DB connection, Passport config
    ├── models/                 # User, Complaint, Comment, Notification, Organization
    └── routes/                 # auth, users, complaints, comments, notifications, ai
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/rajayush0/Smart-complaint-management-app.git
cd Smart-complaint-management-app
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root and in `backend/` using `.env.example` as reference:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

For the frontend root `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the app

```bash
# Start backend (in /backend)
npm run dev

# Start frontend (in root)
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Roles

| Role | Capabilities |
|------|-------------|
| **User** | Submit complaints, track status, add comments, view own history |
| **Staff** | View assigned complaints, update status, reply to comments |
| **Admin** | Full access — assign staff, manage users, view all complaints and analytics |

---

## Deployment

The app is split across two services:

- **Frontend** deployed on [Netlify](https://netlify.com) — auto-deploys from the `main` branch
- **Backend** deployed on [Render](https://render.com) — set root directory to `backend`, start command `node server.js`

Set `VITE_API_URL` in Netlify environment variables to your Render backend URL.
Set `CLIENT_URL` in Render environment variables to your Netlify frontend URL.

---

## Author

**Ayush Raj** — [github.com/rajayush0](https://github.com/rajayush0)
