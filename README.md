# Kanban Task Manager

A full-stack Kanban board application where users can create projects and manage tasks across stages such as To Do, In Progress, and Done.

## Try it out

**Live Demo:** https://kanban-task-manage-pi.vercel.app/projects

## Features

- User authentication (register and login)
- Create, edit, and delete projects
- Add, update, and delete tasks within projects
- Move tasks between columns (Kanban workflow)
- Each task has a priority dot you can click to cycle through levels (none, low, medium, high) — colored grey, blue, amber, and red respectively
- Search tasks by title and filter the board by priority
- Subtle three.js 3D background
- Basic responsive UI

## Tech Stack

**Frontend**

- Next.js
- TypeScript
- Tailwind CSS
- @dnd-kit for drag and drop
- @react-three/fiber for the 3D background

**Backend**

- NestJS
- Prisma ORM
- MySQL
- JWT auth (stored in an httpOnly cookie)

## Project Structure

```
/frontend   # Next.js application
/backend    # NestJS API
```

## Setup Instructions

You'll need Node 20+ and a local MySQL server with an empty database.

### 1. Clone the repository

```
git clone https://github.com/sathvik458/kanban-task-manage.git
cd kanban-task-manage
```

### 2. Backend setup

```
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
DATABASE_URL="mysql://user:password@localhost:3306/appdb"
JWT_SECRET="your_secret_key"
```

Run the database migrations and start the server:

```
npx prisma migrate dev
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3001`.

## Deployment

- **Backend:** Railway
- **Frontend:** Vercel

## Notes

- This project was built as part of a technical assessment.
- Focus was on functionality, architecture, and clean integration between frontend and backend.

## Future Improvements

- Real-time updates
- Improved UI/UX
- Role-based access control
- Notifications

## Author

Sathvik Sama
