
# togethr-app
togethr is a platform for students and developers to form trusted hackathon teams, collaborate on projects, and showcase their skills.

🔗 **Live Demo:** https://togethr-psi.vercel.app/  
📦 **GitHub Repo:** https://github.com/caPt-tanmAY11/togethr-app

## ✨ Highlights

- Built with **Next.js App Router** and **TypeScript**
- Structured team & project collaboration system
- Trust-based ecosystem to reduce spam and fake profiles
- Clean, modern UI with smooth animations
- Optimized UX with cached queries, background refetching, and smooth state transitions
- Fully authenticated flows with email verification
- Efficient client-side data fetching and caching with **TanStack Query**
- Deployed and production-ready on Vercel

## 🚀 Features

### 👥 Hackathon Team Formation
- Create hackathon teams with clear details
- List required skills and available spots
- Send and manage join requests instead of random DMs
- Team leads stay in full control

### 🤝 Project Collaboration
- Post real project ideas (long-term or short-term)
- Accept or reject collaboration requests
- Build teams beyond hackathons

### 🧠 Trust Score System
- Trust points are earned through real actions
- Accepted requests and collaborations increase trust
- Helps identify serious and reliable builders

### 🧑‍💻 Builder Profiles
- Build and share clean, developer-focused profiles
- Showcase skills, projects, achievements, and links
- Profiles grow with real activity on the platform

### 🔐 Authentication & Security
- Email & password authentication
- Email verification and password reset
- Google and GitHub OAuth support
- Secure session handling

## 📂 Project Structure

```bash
togethr-app/
├── app/ # App Router pages & layouts
├── components/ # Reusable UI components
├── hooks/ # Custom hooks
├── lib/ # Utility & helper functions
├── prisma/ # Prisma schema & client
├── public/ # Static assets
```

## ⚙️ Getting Started (Local Setup)

### 1) Clone the repository:
```bash
git clone https://github.com/caPt-tanmAY11/togethr-app.git
cd togethr-app
```

### 2) Install project dependencies:
```bash
npm install
```

### 3) Setup environment variables:
```bash
# Database (Neon PostgreSQL)
DATABASE_URL=

# App URLs
APP_URL=
NEXT_PUBLIC_APP_URL=

# Better Auth (should match your app URL)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Nodemailer (Gmail)
GMAIL_PASS=
GMAIL_USER=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin
ADMIN_EMAIL=
NEXT_PUBLIC_ADMIN_EMAIL=

```

### 4) Prisma setup:
```bash
npx prisma generate
npx prisma migrate dev
```
> This will generate the Prisma client and apply database migrations.

### 5) Start the development server:
```bash
npm run dev
```

### 6) Open the app:
Visit -> http://localhost:3000

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/landing.png)

### Hack Teams Page
![Hack Teams Page](./screenshots/hack-teams.png)

### Create Hack Team Page
![Create Hack Team](./screenshots/create-hack-team.png)

### Projects Page
![Projects Page](./screenshots/projects.png)

### Create Project Page
![Create Project Page](./screenshots/create-project.png)

### Profile Page
![Profile Page](./screenshots/profile.png)

## 🎯 Project Purpose
togethr was built as a portfolio and learning project to solve a real problem faced by students and developers:  

- Difficulty in finding genuine teammates
- Lack of trust in online collaboration
- Too much noise and spam on existing platforms

This project focuses on real collaboration, trust, and clean UX, while also showcasing full-stack development skills.

## 🛠️ Tech Stack

### Language
- **TypeScript**

### Frontend
- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion**
- **TanStack Query** (Client-side data fetching & caching)


### Backend
- **Next.js Server Actions & API Routes**
- **Prisma ORM**
- **PostgreSQL** (Neon)

### Services & Tools
- **Better Auth** (Authentication)
- **Cloudinary** (Image storage)
- **Nodemailer** (Email service)
- **Vercel** (Deployment)

## 🤝 Contributions

This is a personal showcase project.  
Feedback, suggestions, and improvements are always welcome.

## 📄 License

This project is intended for educational and showcase purposes only.

## 👨‍💻 Author

Tanmay Vishwakarma  
Second Year B.Tech Engineering Student @ SPIT Mumbai  
Full-Stack Web Developer  
