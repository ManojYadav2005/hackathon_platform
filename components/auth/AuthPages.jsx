
"use client";
import React, { useState } from 'react';
import {
  auth,
  db,
  HACKATHON_NAME,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setDoc,
  doc,
  getDoc,
  getUserDocPath,
  getConfigDocPath
} from '../../app/firebase/config';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Card from '../ui/Card.jsx';

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

    <div className="mt-12">
      <span
        onClick={() => setCurrentPage('ADMIN_LOGIN')}
        className="text-gray-400 hover:text-white hover:underline cursor-pointer"
      >
        Admin Portal Login
      </span>
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const REGISTRATION_DEADLINE = new Date('2025-12-31T00:00:00');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const now = new Date();
    if (now > REGISTRATION_DEADLINE) {
      setError("Registration for Hackathon 2026 has closed. (Deadline: 30th Dec 2025)");
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
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
        name: name,
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
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />
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

export const AdminLoginPage = ({ setCurrentPage, setError, setIsAdmin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const PREDEFINED_ADMIN_EMAIL = "admin@hackathon.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.email === PREDEFINED_ADMIN_EMAIL) {
        setIsAdmin(true);
        setCurrentPage('ADMIN');
      } else {
        setError("Login successful, but this is not the admin email account.");
        await signOut(auth);
      }
    } catch (e) {
      console.error("Admin Login error:", e);
      setError("Admin login failed. Email or password is wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Admin Portal Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In as Admin'}
          </Button>
        </form>
        <p className="text-center mt-4">
          Not an admin?{' '}
          <span
            onClick={() => setCurrentPage('HOME')}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Go to Participant Site
          </span>
        </p>
      </Card>
    </div>
  );
};
