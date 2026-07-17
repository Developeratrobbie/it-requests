"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { Request as PrismaRequest } from "@prisma/client";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditRequestForm({ requestData }: { requestData: PrismaRequest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: requestData.title,
    description: requestData.description,
    category: requestData.category,
    priority: requestData.priority,
    attachmentUrl: requestData.attachmentUrl,
    requiredByDate: requestData.requiredByDate ? new Date(requestData.requiredByDate).toISOString().split('T')[0] : "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) setFile(blob);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let updatedAttachmentUrl = formData.attachmentUrl;

    if (removeAttachment) {
      updatedAttachmentUrl = null;
    } else if (file) {
      setFileUploading(true);
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fileFormData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          updatedAttachmentUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      setFileUploading(false);
    }

    try {
      const payload = { ...formData, attachmentUrl: updatedAttachmentUrl };
      const res = await fetch(`/api/requests/${requestData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/requests/${requestData.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label className="input-label">Short Title / Subject</label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Detailed Description</label>
        <div style={{ background: "white", color: "black", borderRadius: "8px", overflow: "hidden" }}>
          <ReactQuill 
            theme="snow" 
            value={formData.description} 
            onChange={(val) => setFormData({...formData, description: val})} 
          />
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Attachment</label>
        {formData.attachmentUrl && !removeAttachment && (
          <div style={{ marginBottom: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>Current Attachment Exists</span>
            <button type="button" className="btn-secondary" onClick={() => setRemoveAttachment(true)} style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem", color: "var(--danger)", borderColor: "rgba(239,68,68,0.3)" }}>
              Remove
            </button>
          </div>
        )}
        {(removeAttachment || !formData.attachmentUrl) && (
          <>
            <input type="file" className="input-field" onChange={e => e.target.files && setFile(e.target.files[0])} accept="image/*,.pdf,.doc,.docx" style={{ padding: "0.5rem" }} />
            {file && <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", marginTop: "0.5rem", display: "block" }}>Attached new: {file.name}</span>}
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select 
            className="input-field"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option>Basic Needs</option>
            <option>Bug Fix</option>
            <option>Hardware/Equipment</option>
            <option>Software Request</option>
            <option>New Feature</option>
            <option>Hardware Purchase</option>
            <option>Other</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Priority</label>
          <select 
            className="input-field"
            value={formData.priority}
            onChange={e => setFormData({...formData, priority: e.target.value})}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Required By (Optional)</label>
          <input
            type="date"
            className="input-field"
            value={formData.requiredByDate}
            onChange={e => setFormData({...formData, requiredByDate: e.target.value})}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button type="submit" disabled={loading || fileUploading} className="btn-primary">
          {loading || fileUploading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
