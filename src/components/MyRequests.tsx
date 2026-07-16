"use client";

import { useEffect, useState } from "react";
import styles from "../app/admin/Admin.module.css";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import TimerButton from "./TimerButton";

type Request = {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  timeSpent: number;
  timerStartedAt: string | null;
};

export default function MyRequests({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/requests?me=true");
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [refreshKey]);

  if (loading) return <div style={{ textAlign: "center", margin: "2rem" }}>Loading your requests...</div>;
  
  if (requests.length === 0) {
    return (
      <div className="glass-card" style={{ margin: "4rem auto", maxWidth: "600px", textAlign: "center", padding: "4rem 2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No Requests Yet</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          You haven&apos;t submitted any IT requests. Need help or reporting an issue? Click below to get started.
        </p>
        <Link href="/submit" className="btn-primary" style={{ fontSize: "1.25rem", padding: "1rem 2rem" }}>
          + Create New Request
        </Link>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent": return "badge urgent";
      case "High": return "badge high";
      case "Medium": return "badge medium";
      case "Low": return "badge low";
      default: return "badge";
    }
  };

  return (
    <div className="glass-card" style={{ margin: "2rem auto", maxWidth: "800px" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>My Recent Requests</h3>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Priority</th>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Time</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>#{req.id}</td>
                <td>
                  <span className={getPriorityBadgeClass(req.priority)}>
                    {req.priority}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{req.title}</td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  <span style={{ 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: "4px", 
                    fontSize: "0.85rem",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--glass-border)"
                  }}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <TimerButton id={req.id} isRunning={!!req.timerStartedAt} timeSpent={req.timeSpent} timerStartedAt={req.timerStartedAt} readOnly={true} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <a href={`/requests/${req.id}`} className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>
                      View
                    </a>
                    <DeleteButton id={req.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
