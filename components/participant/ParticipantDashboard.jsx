"use client";
import React, { useState, useEffect } from 'react';
import { SidebarButton } from '../common/Sidebar.jsx';
import { DashboardHome } from './DashboardHome.jsx';
import { TeamManagement } from './TeamManagement.jsx';
import { Round1Page } from './Round1Page.jsx';
import { Round2Page } from './Round2Page.jsx';
import { Round3Page } from './Round3Page.jsx';
import { LoadingPage } from '../common/Loader.jsx';

export const ParticipantDashboard = ({ currentUser, userData, teamData, setError }) => {
  const [currentView, setCurrentView] = useState('DASHBOARD');

  useEffect(() => {
    if (teamData?.status === 'pending_verification') {
      setCurrentView('ROUND2');
    }
  }, [teamData]);

  const renderDashboardView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <DashboardHome teamData={teamData} setCurrentView={setCurrentView} />;
      case 'TEAM':
        return <TeamManagement currentUser={currentUser} userData={userData} teamData={teamData} setError={setError} />;
      case 'ROUND1':
        return <Round1Page teamData={teamData} setError={setError} setCurrentView={setCurrentView} />;
      case 'ROUND2':
        return <Round2Page teamData={teamData} setError={setError} />;
      case 'ROUND3':
        return <Round3Page teamData={teamData} />;
      default:
        return <DashboardHome teamData={teamData} setCurrentView={setCurrentView} />;
    }
  };
  
  if (!userData) {
    return <LoadingPage />;
  }

  const isR1Disabled = !teamData?.status || !['registered', 'pending_verification', 'round_2', 'round_3'].includes(teamData.status);
  const isR2Disabled = !teamData?.status || !['pending_verification', 'round_2', 'round_3'].includes(teamData.status);
  const isR3Disabled = !teamData?.status || teamData.status !== 'round_3';

  return (
    <div className="flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 rounded-lg p-4 md:mr-8 mb-4 md:mb-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400 mb-4">Participant Menu</h3>
        <ul className="space-y-2">
          <SidebarButton
            label="Dashboard"
            onClick={() => setCurrentView('DASHBOARD')}
            active={currentView === 'DASHBOARD'}
          />
          <SidebarButton
            label="My Team"
            onClick={() => setCurrentView('TEAM')}
            active={currentView === 'TEAM'}
          />
          <SidebarButton
            label="Round 1"
            onClick={() => setCurrentView('ROUND1')}
            active={currentView === 'ROUND1'}
            disabled={isR1Disabled}
          />
          <SidebarButton
            label="Round 2"
            onClick={() => setCurrentView('ROUND2')}
            active={currentView === 'ROUND2'}
            disabled={isR2Disabled}
          />
          <SidebarButton
            label="Round 3 (Final)"
            onClick={() => setCurrentView('ROUND3')}
            active={currentView === 'ROUND3'}
            disabled={isR3Disabled}
          />
        </ul>
      </nav>

      <div className="flex-1">
        {renderDashboardView()}
      </div>
    </div>
  );
};