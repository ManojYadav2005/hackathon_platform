"use client";
import React, { useState } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Button, Input } from "@/components/ui";

export default function Round1Page() {
  const [submission, setSubmission] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "round1"), { submission });
      setSubmission("");
      alert("Submission uploaded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubmissions = async () => {
    const querySnapshot = await getDocs(collection(db, "round1"));
    setSubmissions(querySnapshot.docs.map((doc) => doc.data()));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Round 1 Submission</h2>
      <div className="space-y-4">
        <Input
          placeholder="Enter your submission link or details"
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
        />
        <Button onClick={handleSubmit}>Submit</Button>
        <Button variant="outline" onClick={loadSubmissions}>
          View All Submissions
        </Button>

        <ul className="mt-4 space-y-2">
          {submissions.map((s, i) => (
            <li key={i} className="border p-2 rounded">
              {s.submission}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
