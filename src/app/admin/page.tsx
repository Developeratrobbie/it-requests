import Link from "next/link";
import styles from "./Admin.module.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminKanbanClient from "@/components/AdminKanbanClient";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    return (
      <main className="container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view the Admin Dashboard.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
        </div>
      </main>
    );
  }

  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <main className="container" style={{ maxWidth: "100%", padding: "0 4rem" }}>
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0, fontSize: "2rem" }}>Admin Dashboard</h1>
            <p className="page-subtitle" style={{ fontSize: "1rem", textAlign: "center" }}>Manage IT Requests</p>
          </div>
        </div>
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", gap: "1rem" }}>
          <Link href="/admin/archived" className="btn-secondary" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            View Archived
          </Link>
          <Link href="/submit" className="btn-primary">
            + New Request
          </Link>
          <Link href="/api/auth/signout" className="btn-secondary">
            Sign Out
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.length}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.filter(r => r.status === 'Open').length}</div>
          <div className={styles.statLabel}>Open</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.filter(r => r.priority === 'Urgent').length}</div>
          <div className={styles.statLabel}>Urgent</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.filter(r => r.status === 'Resolved').length}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.filter(r => r.status === 'Closed').length}</div>
          <div className={styles.statLabel}>Closed</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>
            {requests.filter(r => {
              if (!r.requiredByDate) return false;
              const today = new Date();
              const reqDate = new Date(r.requiredByDate);
              return reqDate.getDate() === today.getDate() &&
                     reqDate.getMonth() === today.getMonth() &&
                     reqDate.getFullYear() === today.getFullYear() &&
                     r.status !== 'Resolved' && r.status !== 'Closed';
            }).length}
          </div>
          <div className={styles.statLabel}>Due Today</div>
        </div>
      </div>

      <AdminKanbanClient requests={requests} />
    </main>
  );
}
