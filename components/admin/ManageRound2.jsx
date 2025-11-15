
"use client";
import React, { useState } from 'react';
import {
  db,
  doc,
  updateDoc,
  getDoc,
  getTeamDocPath,
  getR2SubmissionsPath
} from '../../app/firebase/config';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export const ManageRound2 = ({ teams, setError }) => {
  const [loadingLink, setLoadingLink] = useState(null);

  const round2Teams = teams.filter(t => t.status === 'round_2' || t.status === 'round_3');
  
  const handleAdvanceTeam = async (teamId) => {
    try {
      await updateDoc(doc(db, getTeamDocPath(teamId)), {
        status: 'round_3'
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

  const handleViewLink = async (teamId) => {
    setLoadingLink(teamId);
    setError('');
    try {
      const submissionDocRef = doc(db, getR2SubmissionsPath(teamId));
      const submissionDoc = await getDoc(submissionDocRef);

      if (submissionDoc.exists()) {
        const link = submissionDoc.data().submissionLink;
        
        if (link) {
          // --- THIS IS THE FIX ---
          // Check if the link already has http:// or https://
          let correctedLink = link;
          if (!link.startsWith('http://') && !link.startsWith('https://')) {
            // If not, add https:// to the beginning
            correctedLink = 'https://' + link;
          }
          // --- END OF FIX ---

          window.open(correctedLink, '_blank', 'noopener,noreferrer');
        } else {
          setError("No submission link found for this team.");
        }
      } else {
        setError("No submission document found for this team.");
      }
    } catch (e) {
      console.error("Error fetching link:", e);
      setError("Failed to fetch submission link.");
    }
    setLoadingLink(null);
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Manage Round 2</h3>
      <p className="mb-4">Review Round 2 submissions and advance teams to the final (Round 3).</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">Team Name</th>
              <th className="p-2">Status</th>
              <th className="p-2">Submission Link</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {round2Teams.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">No teams in Round 2.</td>
              </tr>
            )}
            {round2Teams.map(team => (
              <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{team.teamName}</td>
                <td className="p-2 capitalize">{team.status}</td>
                <td className="p-2">
                  <Button 
                    onClick={() => handleViewLink(team.id)} 
                    variant="secondary" 
                    className="text-sm px-2 py-1"
                    disabled={loadingLink === team.id}
                  >
                    {loadingLink === team.id ? 'Loading...' : 'View Link'}
                  </Button>
                </td>
                <td className="p-2 space-x-2">
                  <Button onClick={() => handleAdvanceTeam(team.id)} variant="success" className="text-sm px-2 py-1" disabled={team.status === 'round_3'}>
                    Advance
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
