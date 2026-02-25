#  TARS Chat App

A modern full-stack real-time chat application built using **Next.js, Convex, and Clerk Authentication**.

This project was built as part of the **Tars Full Stack Engineer Internship Coding Challenge 2026**.

---

##  Features

### Authentication
- Secure login & signup using **Clerk**
- Session management
- Protected routes

###  Real-time Chat
- One-to-one private conversations
- Group chat support
- Real-time message sync using Convex

###  Messaging Features
- Instant send & receive messages
- Seen / delivered status
- Typing indicator
- Last message preview
- Unread message count

###  Users & Conversations
- View all registered users
- Start new chats
- Create group conversations with multiple users

###  UI / UX
- Clean and modern interface
- Responsive layout (desktop + mobile)
- Chat-style layout similar to production apps
- Smooth user experience

---

##  Tech Stack

### Frontend
- **Next.js 14 (App Router)**
- **React**
- **Tailwind CSS**

### Backend
- **Convex** (Realtime database + server functions)

### Authentication
- **Clerk**

### Deployment
- **Vercel**

---

## 📂 Project Structure


/app
layout.tsx
page.tsx
providers.tsx

/components
ChatBox.tsx
ConversationLists.tsx
UserList.tsx
CreateGroupModal.tsx

/convex
schema.ts
users.ts
conversations.ts
messages.ts
typing.ts
auth.config.ts


---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/ashkarev/tars-chat-app
cd tars-chat-app
2. Install dependencies
npm install
3. Configure Environment Variables

Create a .env.local file and add:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=

NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_SITE_URL=

4. Run the development server
npm run dev

 Deployment

This project is deployed using Vercel with Convex cloud backend.

👉 Live Application:
https://tars-chat-app-95g5.vercel.app/

 Demo Video

👉 Loom Walkthrough:
https://www.loom.com/share/3c18caba5e49448b8ecb5f368ccd42bc

 Author

Ashkar S

GitHub: https://github.com/ashkarev

LinkedIn: https://linkedin.com/in/YOUR-LINKEDIN

 AI Tools Used

ChatGPT & ANTIGRAVITY (for debugging & architecture guidance)