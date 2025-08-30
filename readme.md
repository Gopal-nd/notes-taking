# Live Links

- **Frontend:** https://notes-taking-7o7y.vercel.app/
- **Backend:** https://notes-taking-qab8.onrender.com

---

# **Fullstack Notes App – Auth + CRUD**

A production-ready **fullstack Notes App** built with:

- **Backend:** Express + Prisma + PostgreSQL + Passport (Google OAuth) + Nodemailer
- **Frontend:** React + Vite + Tailwind + Zustand + React Query
- **Authentication:** Google OAuth and Email + OTP
- **Features:** Secure authentication, JWT-based sessions, CRUD operations for notes, and CORS + cookie handling for cross-origin deployments.

---

## **Tech Stack**

| Layer          | Technologies                                                              |
| -------------- | ------------------------------------------------------------------------- |
| **Backend**    | Bun, Express, Prisma, PostgreSQL, Passport, JWT, Nodemailer               |
| **Frontend**   | React, Vite, Tailwind CSS, Zustand, React Query                           |
| **Deployment** | Render (backend), Vercel (frontend),                                      |
| **Security**   | HTTP-only cookies, CORS, environment-based configs, CSRF protection ready |

---

## **Features**

- 🔐 **Authentication**

  - Google OAuth 2.0
  - Email-based OTP login
  - JWT-based sessions with secure, HTTP-only cookies

- 📝 **Notes Management**

  - Create, Read, Update, Delete notes
  - Linked to authenticated user

- 🚀 **Production-Ready**

  - Secure cookie handling for Render/Vercel/AWS
  - CORS configured for multiple environments
  - Prisma migrations for database schema

---

## **Project Structure**

```
project-root
├── backend/
│   ├── index.ts          # Express entry point
│   ├── prisma/           # Prisma schema & migrations
│   ├── routes/
│   │   ├── auth.ts       # Google & Email OTP auth routes
│   │   ├── notes.ts      # CRUD routes for notes
│   └── utils/            # JWT, mail, cookie utils
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Shared UI components
│   │   ├── store/        # Zustand state management
│   │   ├── api/          # API service using axios
│   │   └── hooks/        # React Query hooks
└── README.md
```

---

## **Environment Variables**

### **Backend `.env`**

```env
PORT=8000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

# Email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

---

### **Frontend `.env`**

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## **Installation**

### **1. Clone Repository**

```bash
git clone https://github.com/gopal-nd/notes-app.git
cd notes-app
```

---

### **2. Backend Setup**

```bash
cd backend
bun install
bun run db   # generates prisma client & pushes schema
bun run dev  # start development server
```

---

### **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

---

## **Running Locally**

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## **Cookie & CORS Configuration**

For production, cookies must be **HTTP-only, secure, and sameSite=None**.
Example backend config:

```ts
res.cookie("token", jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None",
  domain: ".yourdomain.com", // set for Vercel + Render
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

Frontend requests should include credentials:

```js
axios.defaults.withCredentials = true;
```

---
