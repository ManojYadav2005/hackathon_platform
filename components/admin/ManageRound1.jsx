"use client";
import React from 'react';
import {
  db,
  doc,
  updateDoc,
  getTeamDocPath
} from '@/app/firebase/config';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export const ManageRound1 = ({ teams, setError }) => {
  const relevantTeams = teams.filter(t => 
    t.status === 'registered' || t.status === 'pending_verification'
  );
  
  const handleAdvanceTeam = async (teamId) => {
    try {
      await updateDoc(doc(db, getTeamDocPath(teamId)), {
        status: 'round_2'
      });
    } catch (e) {
      console.error(e);
      setError("Failed to advance team.");
    }
  };
  
  const handleEliminateTeam = async (teamId) => {
    try {
      await updateDoc(doc(db, getTeamDocPath(teamId)), {
        status: 'eliminated'
      });
    } catch (e) {
      console.error(e);
      setError("Failed to eliminate team.");
    }
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Manage Round 1</h3>
      <p className="mb-4">Review Round 1 submissions and advance or eliminate teams. The score is auto-graded from MCQs.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">Team Name</th>
              <th className="p-2">Status</th>
              <th className="p-2">MCQ Score</th>
              <th className="p-2">Submissions</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {relevantTeams.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">No teams in Round 1 or pending verification.</td>
              </tr>
            )}
            {relevantTeams.map(team => (
              <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{team.teamName}</td>
                <td className="p-2 capitalize">{team.status.replace(/_/g, ' ')}</td>
                <td className="p-2 font-bold">
                  {team.status === 'pending_verification' ? 
                    (team.round1Score !== null ? `${team.round1Score}` : 'N/A') :
                    '--'
                  }
                </td>
                <td className="p-2">
                  {team.status === 'pending_verification' ? (
                    <span className="text-blue-400 cursor-pointer">View Code</span>
                  ) : (
                    <span className="text-gray-500">Not submitted</span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  <Button onClick={() => handleAdvanceTeam(team.id)} variant="success" className="text-sm px-2 py-1">
                    Approve
                  </Button>
                  <Button onClick={() => handleEliminateTeam(team.id)} variant="danger" className="text-sm px-2 py-1">
                    Eliminate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};