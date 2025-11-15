
"use client";
import React, { useState, useEffect } from 'react';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getRoundConfigDocPath
} from '../../app/firebase/config';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { LoadingPage } from '../common/Loader.jsx';

export const ManageRounds = ({ setError }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [r1Questions, setR1Questions] = useState('');
  const [r1Coding, setR1Coding] = useState('');
  const [r1Timer, setR1Timer] = useState(30);
  const [r1Ans1, setR1Ans1] = useState('');
  const [r1Ans2, setR1Ans2] = useState('');
  const [r1Ans3, setR1Ans3] = useState('');

  const [r2Problem, setR2Problem] = useState('');
  const [r2Dataset, setR2Dataset] = useState('');
  const [r2Timer, setR2Timer] = useState(48);

  useEffect(() => {
    const configDocRef = doc(db, getRoundConfigDocPath());
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);
        
        setR1Questions(data.round1?.questions || '');
        setR1Coding(data.round1?.codingQuestion || '');
        setR1Timer(data.round1?.timerMinutes || 30);
        setR1Ans1(data.round1?.answers?.q1 || '');
        setR1Ans2(data.round1?.answers?.q2 || '');
        setR1Ans3(data.round1?.answers?.q3 || '');
        
        setR2Problem(data.round2?.problemStatement || '');
        setR2Dataset(data.round2?.datasetLink || '');
        setR2Timer(data.round2?.timerHours || 48);
      } else {
        setConfig({});
      }
      setLoading(false);
    }, (e) => {
      console.error("Error fetching round config:", e);
      setError("Failed to load round configuration.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setError]);

  const handleSaveConfig = async () => {
    setSaving(true);
    setError('');
    try {
      const configDocRef = doc(db, getRoundConfigDocPath());
      const newConfig = {
        round1: {
          ...config?.round1,
          questions: r1Questions,
          codingQuestion: r1Coding,
          timerMinutes: Number(r1Timer),
          answers: {
            q1: r1Ans1.toUpperCase(),
            q2: r1Ans2.toUpperCase(),
            q3: r1Ans3.toUpperCase(),
          }
        },
        round2: {
          ...config?.round2,
          problemStatement: r2Problem,
          datasetLink: r2Dataset,
          timerHours: Number(r2Timer),
        }
      };
      await setDoc(configDocRef, newConfig, { merge: true });
      alert("Round configuration saved!");
    } catch (e) {
      console.error("Error saving config:", e);
      setError("Failed to save configuration.");
    }
    setSaving(false);
  };

  const startRound = async (roundKey) => {
    setSaving(true);
    try {
      const configDocRef = doc(db, getRoundConfigDocPath());
      await updateDoc(configDocRef, {
        [`${roundKey}.startTime`]: serverTimestamp()
      });
      alert(`${roundKey === 'round1' ? 'Round 1' : 'Round 2'} has been started!`);
    } catch (e) {
      console.error("Error starting round:", e);
      setError("Failed to start round.");
    }
    setSaving(false);
  };

  if (loading) return <LoadingPage />;

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Manage Rounds</h3>
      <p className="mb-6">Set the questions, problem statements, and timers for each round. Click "Start Round" to begin the timer for all participants.</p>
      
      <div className="space-y-8">
        <Card className="bg-gray-900">
          <h4 className="text-xl font-semibold mb-3">Round 1 Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">MCQ Questions</label>
              <textarea
                value={r1Questions}
                onChange={(e) => setR1Questions(e.target.value)}
                rows="5"
                className="w-full p-2 bg-gray-700 rounded-lg font-mono"
                placeholder="Enter all MCQ questions here (e.g., Q1: What is... A) ... B) ...)"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Coding Question</label>
              <textarea
                value={r1Coding}
                onChange={(e) => setR1Coding(e.target.value)}
                rows="3"
                className="w-full p-2 bg-gray-700 rounded-lg font-mono"
                placeholder="Enter the coding question here..."
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Timer (minutes)</label>
              <Input
                type="number"
                value={r1Timer}
                onChange={(e) => setR1Timer(e.target.value)}
              />
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg">
              <h5 className="text-lg font-semibold mb-2">MCQ Answer Key</h5>
              <p className="text-sm text-gray-400 mb-2">Set the correct answer (A, B, C, or D) for auto-grading.</p>
              <div className="grid grid-cols-3 gap-4">
                <Input value={r1Ans1} onChange={(e) => setR1Ans1(e.target.value)} placeholder="Q1 Answer" />
                <Input value={r1Ans2} onChange={(e) => setR1Ans2(e.target.value)} placeholder="Q2 Answer" />
                <Input value={r1Ans3} onChange={(e) => setR1Ans3(e.target.value)} placeholder="Q3 Answer" />
              </div>
            </div>

            <Button onClick={() => startRound('round1')} disabled={saving} variant="secondary">
              Start Round 1
            </Button>
            {config?.round1?.startTime && <p className="text-green-400">Round 1 started at: {new Date(config.round1.startTime.toDate()).toLocaleString()}</p>}
          </div>
        </Card>

        <Card className="bg-gray-900">
          <h4 className="text-xl font-semibold mb-3">Round 2 Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Problem Statement</label>
              <textarea
                value={r2Problem}
                onChange={(e) => setR2Problem(e.target.value)}
                rows="8"
                className="w-full p-2 bg-gray-700 rounded-lg font-mono"
                placeholder="Enter the full AI/ML problem statement here..."
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Dataset Link</label>
              <Input
                value={r2Dataset}
                onChange={(e) => setR2Dataset(e.target.value)}
                placeholder="https://link.to/dataset.csv"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Timer (hours)</label>
              <Input
                type="number"
                value={r2Timer}
                onChange={(e) => setR2Timer(e.target.value)}
              />
            </div>

            <Button onClick={() => startRound('round2')} disabled={saving} variant="secondary">
              Start Round 2
            </Button>
            {config?.round2?.startTime && <p className="text-green-400">Round 2 started at: {new Date(config.round2.startTime.toDate()).toLocaleString()}</p>}
          </div>
        </Card>

        <Button onClick={handleSaveConfig} disabled={saving} className="w-full text-lg py-3">
          {saving ? 'Saving...' : 'Save All Configurations'}
        </Button>
      </div>
    </Card>
  );
};
