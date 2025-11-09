"use client";
import React, { useState } from 'react';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  getTeamDocPath,
  getR1MCQSubmissionsPath,
  getR1CodeSubmissionsPath
} from '@/app/firebase/config';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { LoadingPage } from '../common/Loader.jsx';
import { Timer } from '../common/Timer.jsx';
import { useRoundConfig } from '@/context/RoundConfigContext.jsx';

export const Round1Page = ({ teamData, setError, setCurrentView }) => {
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingSubmission, setCodingSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const roundConfig = useRoundConfig();

  const handleRoundSubmit = async () => {
    setLoading(true);
    setError('');

    let score = 0;
    const answerKey = roundConfig?.round1?.answers;
    if (answerKey) {
      for (const qKey in mcqAnswers) {
        if (mcqAnswers[qKey] === answerKey[qKey]) {
          score += 1;
        }
      }
    }

    try {
      const batch = writeBatch(db);

      const mcqDocRef = doc(db, getR1MCQSubmissionsPath(teamData.id));
      batch.set(mcqDocRef, {
        answers: mcqAnswers,
        submittedAt: serverTimestamp(),
        score: score,
      });

      const codeDocRef = doc(db, getR1CodeSubmissionsPath(teamData.id));
      batch.set(codeDocRef, {
        code: codingSubmission,
        submittedAt: serverTimestamp(),
      });

      const teamDocRef = doc(db, getTeamDocPath(teamData.id));
      batch.update(teamDocRef, {
        status: 'pending_verification',
        round1Score: score,
      });
      
      await batch.commit();
      alert("Round 1 submission received! Your score will be verified by the admin.");
      setCurrentView('ROUND2');
    } catch (e) {
      console.error(e);
      setError("Failed to submit answers.");
    }
    setLoading(false);
  };

  if (!roundConfig) return <LoadingPage />;
  
  const { round1 } = roundConfig;

  if (!round1 || !round1.questions) {
    return <Card><h2 className="text-3xl font-bold mb-4">Round 1 not yet configured by admin.</h2></Card>;
  }
  
  const numMcqs = round1.answers ? Object.keys(round1.answers).length : 3;

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Round 1: Screening</h2>
      <p className="mb-6 text-gray-300">This round consists of MCQs and basic coding questions.</p>
      
      <Timer 
        startTime={round1.startTime}
        durationMinutes={round1.timerMinutes || 30}
        onTimeUp={() => setIsTimeUp(true)}
      />

      <div className="space-y-8">
        <Card className="bg-gray-900">
          <h3 className="text-2xl font-semibold mb-4">Part 1: MCQs</h3>
          <pre className="whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-lg mb-4">{round1.questions}</pre>
          <div className="space-y-4">
            {[...Array(numMcqs).keys()].map(n => {
              const qKey = `q${n + 1}`;
              return (
                <div key={qKey}>
                  <p className="font-medium mb-2">Question {n + 1} Answer:</p>
                  <select 
                    onChange={(e) => setMcqAnswers({...mcqAnswers, [qKey]: e.target.value})}
                    className="w-full p-2 bg-gray-700 rounded-lg"
                    disabled={isTimeUp}
                  >
                    <option value="">Select an answer</option>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card className="bg-gray-900">
          <h3 className="text-2xl font-semibold mb-4">Part 2: Basic Coding</h3>
          <pre className="whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-lg mb-4">{round1.codingQuestion}</pre>
          <textarea
            value={codingSubmission}
            onChange={(e) => setCodingSubmission(e.target.value)}
            rows="10"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your code here..."
            disabled={isTimeUp}
          ></textarea>
        </Card>

        <Button onClick={handleRoundSubmit} disabled={loading || isTimeUp} className="w-full text-lg py-3">
          {isTimeUp ? "Time's Up!" : (loading ? 'Submitting...' : 'Submit Round 1')}
        </Button>
      </div>
    </Card>
  );
};


