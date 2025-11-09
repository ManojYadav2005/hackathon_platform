"use client";
import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export const DashboardHome = ({ teamData, setCurrentView }) => {
  const getStatusMessage = () => {
    if (!teamData) {
      return (
        <p className="text-lg">
          You are not part of a team. Please{' '}
          <span onClick={() => setCurrentView('TEAM')} className="text-blue-400 hover:underline cursor-pointer">
            create or join a team
          </span>
          {' '}to participate.
        </p>
      );
    }
    switch (teamData.status) {
      case 'pending_payment':
        return <p className="text-lg text-yellow-400">Your team is created. Please complete the registration by paying the fee.</p>;
      case 'registered':
        return <p className="text-lg text-green-400">Your team is registered! Round 1 will begin soon. Good luck!</p>;
      case 'pending_verification':
        return <p className="text-lg text-blue-400">Your Round 1 submission is complete and is awaiting verification by the admin.</p>;
      case 'round_2':
        return <p className="text-lg text-green-400">Congratulations! Your team has advanced to Round 2.</p>;
      case 'round_3':
        return <p className="text-lg text-green-400">Amazing! Your team has made it to the final offline round at NIT Silchar!</p>;
      case 'eliminated':
        return <p className="text-lg text-red-400">Thank you for participating. Unfortunately, your team has not advanced to the next round.</p>;
      default:
        return <p className="text-lg">Welcome to your dashboard.</p>;
    }
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">My Dashboard</h2>
      {getStatusMessage()}
      
      {teamData && teamData.status === 'pending_payment' && (
        <div className="mt-6">
          <Button onClick={() => setCurrentView('TEAM')} variant="primary">
            Go to Team Page to Pay
          </Button>
        </div>
      )}
    </Card>
  );
};