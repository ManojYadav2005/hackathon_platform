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

export const ManageTeams = ({ teams, setError }) => {
  const filteredTeams = teams.filter(t => t.status === 'pending_payment');

  const handleApprovePayment = async (teamId) => {
    try {
      await updateDoc(doc(db, getTeamDocPath(teamId)), {
        status: 'registered'
      });
    } catch (e) {
      console.error(e);
      setError("Failed to approve payment.");
    }
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Pending Registrations</h3>
      <p className="mb-4">Review teams that are pending payment confirmation.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">Team Name</th>
              <th className="p-2">Leader Email</th>
              <th className="p-2">Members</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">No teams pending payment.</td>
              </tr>
            )}
            {filteredTeams.map(team => (
              <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{team.teamName}</td>
                <td className="p-2">{team.members.find(m => m.uid === team.leaderUid)?.email}</td>
                <td className="p-2">{team.members.length}</td>
                <td className="p-2">
                  <Button onClick={() => handleApprovePayment(team.id)} variant="success" className="text-sm px-2 py-1">
                    Approve Payment
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