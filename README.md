# 🚀 JobFlow – AI-powered Job Application Tracker

JobFlow is a modern full-stack web application that helps you track, manage, and optimize your job applications with AI-powered insights.

🔗 **Live Demo:** https://job-flow-wheat.vercel.app 

🔗 **GitHub Repo:** https://github.com/KovacsAttilaSandor/jobflow  

---

##  Features

###  Dashboard
- Overview of your job applications
- Statistics (total jobs, active applications, interviews, offers)
- Recent activity tracking

###  Job Management
- Create, edit, delete job applications
- Track company, role, location, and status
- Status pipeline: Saved -> Applied -> Interviewing -> Offer -> Rejected

###  AI Features
-  **CV Parsing** (PDF → text)
-  **Job Match Score**
-  **AI-generated Cover Letter**
-  **AI Job Summary**

###  Kanban Board (Drag & Drop)
- Move jobs between statuses visually
- Optimistic UI updates
- Real-time persistence

###  Advanced Filtering
- Live search (debounced)
- Dynamic filters (status, location, source)
- Sorting and pagination

###  Events & Tracking
- Track interviews, deadlines, follow-ups
- Linked to job applications

---

##  Tech Stack

### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Dnd-kit** (drag & drop)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**

### AI Integration
- **OpenAI / Google Gemini API**
- CV parsing & job matching
- Cover letter generation

### Deployment
- **Vercel**

---

##  Architecture

- Full-stack monolithic Next.js app
- Server Components + API routes
- Prisma-based relational database
- Modular component structure

---

