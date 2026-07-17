"use client";

import { useState, useEffect } from "react";
import styles from "./RequestForm.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RequestForm({ onCreated }: { onCreated?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch(err => console.error("Failed to fetch users", err));
    }
  }, [session]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setFile(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      alert("You must be logged in to submit a request.");
      return;
    }
    
    setLoading(true);
    
    // Capture form data synchronously before any awaits
    const formData = new FormData(e.currentTarget);
    const formElement = e.target as HTMLFormElement;

    let attachmentUrl = null;

    if (file) {
      setFileUploading(true);
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        } else {
          console.error("Failed to upload file");
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      setFileUploading(false);
    }
    
    const data = {
      title: formData.get("title"),
      description: description,
      category: formData.get("category"),
      priority: formData.get("priority"),
      attachmentUrl,
      requiredByDate: formData.get("requiredByDate") ? new Date(formData.get("requiredByDate") as string).toISOString() : null,
      requestedForUserId: formData.get("requestedForUserId"),
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        formElement.reset();
        setDescription("");
        setFile(null);
        if (onCreated) onCreated();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  if (!session) {
    return (
      <div className="glass-card" style={{ textAlign: "center", margin: "2rem auto", maxWidth: "600px" }}>
        <h2>Please log in to submit a request.</h2>
        <button onClick={() => router.push("/login")} className="btn-primary" style={{ marginTop: "1rem" }}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <form className={`glass-card ${styles.form}`} onSubmit={handleSubmit} style={{ margin: "2rem auto", maxWidth: "800px" }}>
      <h2 className={styles.formTitle}>Submit a Request</h2>
      
      {success && (
        <div className={styles.successMessage}>
          Request submitted successfully! The IT team has been notified.
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="title">Short Title / Subject</label>
        <input required type="text" id="title" name="title" className="input-field" placeholder="e.g. Printer on 2nd floor is broken" />
      </div>

      {session?.user?.role === "ADMIN" && (
        <div className="input-group">
          <label className="input-label" htmlFor="requestedForUserId">Requested For (User)</label>
          <select id="requestedForUserId" name="requestedForUserId" className="input-field">
            <option value="">-- Assign to myself --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="description">Detailed Description</label>
        <div style={{ background: "white", color: "black", borderRadius: "8px", overflow: "hidden" }}>
          <ReactQuill theme="snow" value={description} onChange={setDescription} />
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label" htmlFor="file">Upload Screenshot (Choose file or Ctrl+V to paste)</label>
        <input type="file" id="file" name="file" className="input-field" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" style={{ padding: "0.5rem" }} />
        {file && <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", marginTop: "0.5rem", display: "block" }}>Attached: {file.name}</span>}
      </div>

      <div className={styles.grid3}>
        <div className="input-group">
          <label className="input-label" htmlFor="category">Category</label>
          <select required id="category" name="category" className="input-field">
            <option value="Basic Needs">Basic Needs</option>
            <option value="Bug Fix">Bug Fix</option>
            <option value="New Feature">New Feature</option>
            <option value="Hardware Purchase">Hardware Purchase</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="priority">Priority</label>
          <select required id="priority" name="priority" className="input-field">
            <option value="Low">Low (When you have time)</option>
            <option value="Medium">Medium (Normal)</option>
            <option value="High">High (Important)</option>
            <option value="Urgent">Urgent (Blocks my work)</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="requiredByDate">Required By (Optional)</label>
          <input type="date" id="requiredByDate" name="requiredByDate" className="input-field" />
        </div>
      </div>

      <div className={styles.actions} style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <button type="submit" className="btn-primary" disabled={loading || fileUploading} style={{ minWidth: "200px" }}>
          {loading || fileUploading ? <><span className="spinner"></span> Submitting...</> : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
