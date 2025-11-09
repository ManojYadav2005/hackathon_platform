"use client";
import React, { useState } from 'react';
import {
  db,
  doc,
  setDoc,
  serverTimestamp,
  getR2SubmissionsPath
} from '@/app/firebase/config';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Card from '../ui/Card.jsx';
import { LoadingPage } from '../common/Loader.jsx';
import { Timer } from '../common/Timer.jsx';
import { useRoundConfig } from '@/context/RoundConfigContext.jsx';

export const Round2Page = ({ teamData, setError }) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const roundConfig = useRoundConfig();

  if (teamData.status === 'pending_verification') {
    return (
      <Card>
        <h2 className="text-3xl font-bold mb-4 text-blue-400">Round 2: Pending Verification</h2>
        <p className="text-lg">Your Round 1 submission has been received. Please wait for the admin to verify your results.</p>
        <p className="text-lg mt-2">You will be notified here once you qualify for Round 2.</p>
      </Card>
    );
  }
  
  if (!roundConfig) return <LoadingPage />;
  
  const { round2 } = roundConfig;

  if (!round2 || !round2.problemStatement) {
    return <Card><h2 className="text-3xl font-bold mb-4">Round 2 not yet configured by admin.</h2></Card>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink) {
      setError("Please provide a submission link.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, getR2SubmissionsPath(teamData.id)), {
        submissionLink: submissionLink,
        submittedAt: serverTimestamp(),
      });
      alert("Round 2 submission received!");
    } catch (e) {
      console.error(e);
      setError("Failed to submit.");
    }
    setLoading(false);
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Round 2: AI/ML Challenge</h2>
      
      <Timer 
        startTime={round2.startTime}
        durationMinutes={(round2.timerHours || 24) * 60}
        onTimeUp={() => setIsTimeUp(true)}
      />

      <Card className="bg-gray-900 mb-6">
        <h3 className="text-2xl font-semibold mb-3">Problem Statement</h3>
        <pre className="whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-lg mb-4">{round2.problemStatement}</pre>
        <p className="font-medium">Dataset: <span className="text-blue-400">{round2.datasetLink || "Not specified."}</span></p>
      </Card>
      
      <form onSubmit={handleSubmit}>
        <h3 className="text-xl font-semibold mb-2">Submit Your Work</h3>
        <p className="text-gray-400 mb-4">Upload your project (code, report) to a GitHub repository or Google Drive and paste the public link below.</p>
        <Input
          value={submissionLink}
          onChange={(e) => setSubmissionLink(e.target.value)}
          placeholder="https://github.com/your-team/repo"
          disabled={isTimeUp}
        />
        <Button type="submit" disabled={loading || isTimeUp} className="mt-4">
          {isTimeUp ? "Time's Up!" : (loading ? 'Submitting...' : 'Submit Round 2 Project')}
        </Button>
      </form>
    </Card>
  );
};