"use client";
import React, { useState, useEffect } from 'react';
import {
  db,
  collection,
  query,
  onSnapshot,
  getTeamCollectionPath
} from '@/app/firebase/config';
import { SidebarButton } from '../common/Sidebar.jsx';
import { LoadingPage } from '../common/Loader.jsx';
import { ManageTeams } from './ManageTeams.jsx';
import { ManageRounds } from './ManageRounds.jsx';
import { ManageRound1 } from './ManageRound1.jsx';
import { ManageRound2 } from './ManageRound2.jsx';
import { ManageUsers } from './ManageUsers.jsx';

export const AdminDashboard = ({ currentUser, setError }) => {
  const [currentView, setCurrentView] = useState('USERS');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, getTeamCollectionPath()));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData = [];
      querySnapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() });
      });
      setTeams(teamsData);
      setLoading(false);
    }, (e) => {
      console.error("Error fetching teams:", e);
      setError("Failed to fetch team data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setError]);

  const renderAdminView = () => {
    if (loading) return <LoadingPage />;
    
    switch (currentView) {
      case 'USERS':
        return <ManageUsers setError={setError} />;
      case 'TEAMS':
        return <ManageTeams teams={teams} setError={setError} />;
      case 'MANAGE_ROUNDS':
        return <ManageRounds setError={setError} />;
      case 'ROUND1':
        return <ManageRound1 teams={teams} setError={setError} />;
      case 'ROUND2':
        return <ManageRound2 teams={teams} setError={setError} />;
      default:
        return <ManageUsers setError={setError} />;
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 rounded-lg p-4 md:mr-8 mb-4 md:mb-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400 mb-4">Admin Menu</h3>
        <ul className="space-y-2">
          <SidebarButton
            label="Manage Users"
            onClick={() => setCurrentView('USERS')}
            active={currentView === 'USERS'}
          />
          <SidebarButton
            label="Manage Payments"
            onClick={() => setCurrentView('TEAMS')}
            active={currentView === 'TEAMS'}
          />
          <SidebarButton
            label="Manage Rounds"
            onClick={() => setCurrentView('MANAGE_ROUNDS')}
            active={currentView === 'MANAGE_ROUNDS'}
          />
          <SidebarButton
            label="Manage Round 1"
            onClick={() => setCurrentView('ROUND1')}
            active={currentView === 'ROUND1'}
          />
          <SidebarButton
            label="Manage Round 2"
            onClick={() => setCurrentView('ROUND2')}
            active={currentView === 'ROUND2'}
          />
        </ul>
      </nav>

      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
        {renderAdminView()}
      </div>
    </div>
  );
};