# Robbie IT Requests Dashboard

A lightweight, modern IT ticketing and request management system built with Next.js, React, and Prisma.

## Features

- **User Dashboard:** Employees can easily submit IT requests, track the status, and view updates in real-time.
- **Admin Kanban Board:** IT administrators have access to a drag-and-drop Kanban board to manage requests across stages (Urgent, To Do, In Progress, Done).
- **Time Tracking:** Built-in real-time timer for IT staff to track time spent on individual tickets.
- **Rich Text Editing:** Users can format their request descriptions using a modern WYSIWYG editor.
- **Role-Based Access Control:** Secure routes ensuring only authorized admins can access management dashboards.
- **Modern UI:** Built using standard CSS with a sleek, dark-themed "glassmorphism" aesthetic.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** MySQL (Configured for standard shared hosting environments like Plesk via phpMyAdmin)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Drag & Drop:** [@dnd-kit/core](https://dndkit.com/)
- **Rich Text:** [react-quill-new](https://github.com/zenoamaro/react-quill)

## Getting Started

### 1. Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Database connection string (MySQL format)
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/it_requests"

# NextAuth Secret for encrypting sessions (Generate a secure random string)
NEXTAUTH_SECRET="your-super-secret-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup the Database

Generate the Prisma client and push the schema to your MySQL database:

```bash
npx prisma generate
npx prisma db push
```

*Note: Since there is no user registration page built-in (for internal security), you will need to manually insert an Admin user into your database to log in for the first time.*

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to Plesk (Node.js Extension)

1. Upload the files to your Plesk file manager (excluding `node_modules` and `.next`).
2. Ensure your domain's **Node.js** extension is enabled in Plesk.
3. Configure the Document Root to point to the correct folder.
4. Set the Application Startup File to Next.js's standard entry (e.g., `node_modules/next/dist/bin/next` or a custom `server.js`).
5. Run `npm install` and `npm run build` within the Plesk Node.js terminal or via SSH.
6. Ensure the `.env` file is properly set with your Plesk MySQL database credentials.
