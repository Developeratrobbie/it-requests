"use client";

import { useState } from "react";
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
    requiredByDate: requestData.requiredByDate ? new Date(requestData.requiredByDate).toISOString().split('T')[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/requests/${requestData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
            <option>Low (When you have time)</option>
            <option>Medium (Important)</option>
            <option>High (Very Important)</option>
            <option>Urgent (Drop everything)</option>
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
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
