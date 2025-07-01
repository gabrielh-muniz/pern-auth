# PERN Authentication

A full stack authentication example built with **PostgreSQL**, **Express**, **React** and **Node**. The project demonstrates common features such as email verification, password reset and OAuth login.

## Features

- User registration with hashed passwords using `bcrypt`.
- Email verification via a 6‑digit token (with [Resend](https://resend.com/docs/introduction)).
- Login and logout with JWT.
- Google OAuth login using [Passport.js](https://www.passportjs.org/).
- Password reset flow with reset tokens.
- Endpoint to check authentication status.
- React frontend powered by Zustand for state and React Hook Form for forms.

## Screenshots

Sign up
![image](https://github.com/user-attachments/assets/6eac1c1c-e83b-433b-8ebe-cdc8d2a75d71)

Login
![image](https://github.com/user-attachments/assets/68029525-a2f0-4ad0-8893-03dc1c190c69)

Verify email
![image](https://github.com/user-attachments/assets/1f6a4471-23fa-4451-a457-8baa3c69178b)

Forgot password
![image](https://github.com/user-attachments/assets/65b339bf-1d4f-47ca-b0c5-974018e475cd)

Reset password
![image](https://github.com/user-attachments/assets/42df7fea-90e0-4ee2-9379-de0086e5a2e7)

## What I learned

This project helped me practice:

- Creating REST endpoints with Express and PostgreSQL.
- Handling tokens and cookies for authentication.
- Sending emails through Resend.
- Integrating Google OAuth with Passport.
- Building reusable React components with Shadcn UI and Framer Motion.
- Validating forms with Zod and React Hook Form.
- Managing global state with Zustand.

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL database

### Installation

Clone the repository and install the dependencies for both the server and the client:

```bash
npm install
cd frontend && npm install
```

### Environment Variables

Create a `.env` file in the project root with the following keys:

```
DATABASE_URL=postgres://<db_username>:<db_password>@localhost:5432/<db_name>
SECRET_KEY=yourSecretKey
RESEND_API_KEY=yourResendKey
FRONTEND_URL=http://localhost:<PORT>
GOOGLE_CLIENT_ID=yourGoogleId
GOOGLE_CLIENT_SECRET=yourGoogleSecret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
PORT=3000
```

### Running the App

Start the Express API:

```bash
npm run dev
```

In another terminal start the React app:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Repository Structure

- `backend/` – Express server with routes and controllers.
- `frontend/` – React application bootstrapped with Vite.
