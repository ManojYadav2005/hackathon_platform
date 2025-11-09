
"use client";
import React, { useState, useEffect } from 'react';
import {
  auth,
  db,
  initialAuthToken,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  getConfigDocPath,
  getUserDocPath,
  getTeamDocPath
} from '../firebase/config';
import {
  LoadingPage,
  ErrorPage,
  ErrorDisplay,
  Header
} from '../../components/common/Loader.jsx';
import { HomePage, LoginPage, RegisterPage, AdminLoginPage } from '../../components/auth/AuthPages.jsx';
import { ParticipantDashboard } from '../../components/participant/ParticipantDashboard.jsx';
import { AdminDashboard } from '../../components/admin/AdminDashboard.jsx';
import { RoundConfigProvider } from '../../context/RoundConfigContext.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('LOADING');
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setCurrentPage('HOME');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user && !user.isAnonymous && !isAdmin) {
        setCurrentUser(user);
        setIsAdmin(false);
        setCurrentPage('DASHBOARD');
      } else if (user && user.isAnonymous) {
        setCurrentUser(user);
        setIsAdmin(false);
        setCurrentPage('HOME');
      } else if (!user) {
        setCurrentUser(null);
        setUserData(null);
        setTeamData(null);
        setIsAdmin(false);
        setCurrentPage('HOME');
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Anonymous sign-in error:", e);
          setError("Failed to get anonymous access.");
        }
      }
      setLoading(false);
    });
    
    
    const authInit = async () => {
      if (!auth) return;
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else if (!auth.currentUser) {
           await signInAnonymously(auth); 
        }
      } catch (e) {
        console.error("Auth init error:", e);
        setError("Failed to initialize authentication.");
        setCurrentPage('ERROR');
      }
    };

    authInit();
    
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (currentUser && !isAdmin && !currentUser.isAnonymous) {
      const userDocRef = doc(db, getUserDocPath(currentUser.uid));
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setDoc(userDocRef, {
            email: currentUser.email,
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email,
            teamId: null,
          }).catch(e => console.error("Error creating user doc:", e));
        }
      }, (e) => console.error("Error listening to user data:", e));

      return () => unsubscribe();
    } else {
      setUserData(null);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (userData && userData.teamId) {
      const teamDocRef = doc(db, getTeamDocPath(userData.teamId));
      const unsubscribe = onSnapshot(teamDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setTeamData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setTeamData(null);
          if (currentUser) {
            updateDoc(doc(db, getUserDocPath(currentUser.uid)), { teamId: null });
          }
        }
      }, (e) => console.error("Error listening to team data:", e));

      return () => unsubscribe();
    } else {
      setTeamData(null);
    }
  }, [userData, currentUser]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setCurrentPage('HOME');
    } catch (e) {
      console.error("Logout error:", e);
      setError("Failed to log out.");
    }
  };

  const renderPage = () => {
    if (loading || currentPage === 'LOADING') {
      return <LoadingPage />;
    }
    
    if (currentPage === 'ERROR') {
      return <ErrorPage message={error} />
    }

    switch (currentPage) {
      case 'HOME':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'LOGIN':
        return <LoginPage setCurrentPage={setCurrentPage} setError={setError} />;
      case 'REGISTER':
        return <RegisterPage setCurrentPage={setCurrentPage} setError={setError} />;
      case 'ADMIN_LOGIN':
        return <AdminLoginPage 
                  setCurrentPage={setCurrentPage} 
                  setError={setError} 
                  setIsAdmin={setIsAdmin} 
                />;
      case 'DASHBOARD':
        return (
          <RoundConfigProvider>
            <ParticipantDashboard
              currentUser={currentUser}
              userData={userData}
              teamData={teamData}
              setCurrentPage={setCurrentPage}
              setError={setError}
            />
          </RoundConfigProvider>
        );
      case 'ADMIN':
        return <AdminDashboard currentUser={currentUser} setError={setError} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-inter">
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
        setCurrentPage={setCurrentPage}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
        {error && <ErrorDisplay message={error} clearError={() => setError('')} />}
      </main>
    </div>
  );
}
