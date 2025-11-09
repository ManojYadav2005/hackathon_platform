import React, { useState } from 'react';
import {
  auth,
  db,
  HACKATHON_NAME,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  doc,
  getUserDocPath
} from '@/app/firebase/config';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export const HomePage = ({ setCurrentPage }) => (
  <div className="text-center py-16">
    <h1 className="text-5xl font-extrabold mb-4">Welcome to {HACKATHON_NAME}</h1>
    <p className="text-xl text-gray-300 mb-8">
      The premier national-level coding competition by NIT Silchar.
    </p>
    <div className="space-x-4">
      <Button onClick={() => setCurrentPage('REGISTER')} variant="primary" className="text-lg px-6 py-3">
        Register Your Team
      </Button>
      <Button onClick={() => setCurrentPage('LOGIN')} variant="secondary" className="text-lg px-6 py-3">
        Participant Login
      </Button>
    </div>
    <Card className="mt-16 text-left max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-blue-400">About the Hackathon</h2>
      <p className="mb-4">Tackle real-world problems using Artificial Intelligence, Machine Learning, and other emerging technologies. Showcase your skills, collaborate with peers, and win exciting prizes!</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-xl font-semibold">Round 1 (Online)</h3>
          <p className="text-gray-400">MCQs, Aptitude, & Basic Coding</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Round 2 (Online)</h3>
          <p className="text-gray-400">AI/ML Problem Statements</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Round 3 (Offline)</h3>
          <p className="text-gray-400">Final Hackathon at NIT Silchar</p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-2xl font-bold mb-3">Prizes</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-semibold text-yellow-400">1st Prize:</span> ₹50,000 + Certificate</li>
          <li><span className="font-semibold text-gray-300">2nd Prize:</span> ₹40,000 + Certificate</li>
          <li><span className="font-semibold text-orange-400">3rd Prize:</span> ₹30,000 + Certificate</li>
        </ul>
      </div>
    </Card>
  </div>
);

export const LoginPage = ({ setCurrentPage, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error("Login error:", e);
      setError("Failed to log in. Check email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Participant Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <span
            onClick={() => setCurrentPage('REGISTER')}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Register here
          </span>
        </p>
      </Card>
    </div>
  );
};

export const RegisterPage = ({ setCurrentPage, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, getUserDocPath(userCredential.user.uid)), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        teamId: null,
      });
    } catch (e) {
      console.error("Registration error:", e);
      setError("Failed to register. Email may already be in use.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <span
            onClick={() => setCurrentPage('LOGIN')}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </Card>
    </div>
  );
};