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
} from '@/app/firebase/config';
import {
  LoadingPage,
  ErrorPage,
  ErrorDisplay,
  Header
} from '@/components/common/Loader';
import { HomePage, LoginPage, RegisterPage } from '@/components/auth/LoginPage';
import { ParticipantDashboard, AdminDashboard } from '@/components/dashboard/Dashboard';

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
      setError("Firebase not initialized.");
      setLoading(false);
      setCurrentPage('ERROR');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const configDoc = await getDoc(doc(db, getConfigDocPath()));
          if (configDoc.exists() && configDoc.data().adminUids?.includes(user.uid)) {
            setIsAdmin(true);
            setCurrentPage('ADMIN');
          } else {
            setIsAdmin(false);
            setCurrentPage('DASHBOARD');
          }
        } catch (e) {
          console.error("Error checking admin status:", e);
          setIsAdmin(false);
          setCurrentPage('DASHBOARD');
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setTeamData(null);
        setIsAdmin(false);
        setCurrentPage('HOME');
      }
      setLoading(false);
    });

    
    
    const authInit = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          // 🚀 CLEANED: Standard signInAnonymously call, relying on real error handling
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
  }, []);

  useEffect(() => {
    if (currentUser && !isAdmin) {
      const userDocRef = doc(db, getUserDocPath(currentUser.uid));
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setDoc(userDocRef, {
            email: currentUser.email,
            uid: currentUser.uid,
            teamId: null,
          }).catch(e => console.error("Error creating user doc:", e));
        }
      }, (e) => console.error("Error listening to user data:", e));

      return () => unsubscribe();
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
          updateDoc(doc(db, getUserDocPath(currentUser.uid)), { teamId: null });
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
      case 'DASHBOARD':
        return <ParticipantDashboard
                  currentUser={currentUser}
                  userData={userData}
                  teamData={teamData}
                  setCurrentPage={setCurrentPage}
                  setError={setError}
                />;
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