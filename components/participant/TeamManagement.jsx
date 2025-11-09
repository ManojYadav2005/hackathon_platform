"use client";
import React, { useState } from 'react';
import {
  db,
  REGISTRATION_FEE,
  MAX_TEAM_MEMBERS,
  doc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  getTeamCollectionPath,
  getTeamDocPath,
  getUserCollectionPath,
  getUserDocPath
} from '@/app/firebase/config';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Card from '../ui/Card.jsx';
import { LoadingPage, Modal } from '../common/Loader.jsx';

const CreateTeamModal = ({ show, onClose, currentUser, setError }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName) {
      setError("Please enter a team name.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const teamCollectionRef = collection(db, getTeamCollectionPath());
      const newTeamDoc = await addDoc(teamCollectionRef, {
        teamName: teamName,
        leaderUid: currentUser.uid,
        members: [
          { uid: currentUser.uid, email: currentUser.email, name: currentUser.displayName || currentUser.email }
        ],
        status: 'pending_payment',
        createdAt: serverTimestamp(),
        round1Score: null,
      });

      await updateDoc(doc(db, getUserDocPath(currentUser.uid)), {
        teamId: newTeamDoc.id,
      });

      onClose();
    } catch (e) {
      console.error("Error creating team:", e);
      setError("Failed to create team.");
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onClose={onClose} title="Create New Team">
      <div className="space-y-4">
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
        />
        <Button onClick={handleCreateTeam} disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </div>
    </Modal>
  );
};

const InviteMemberModal = ({ show, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onInvite(email);
    setLoading(false);
  };

  return (
    <Modal show={show} onClose={onClose} title="Invite Team Member">
      <div className="space-y-4">
        <p>Enter the email of the user you want to invite. They must have registered an account first.</p>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? 'Inviting...' : 'Send Invite'}
        </Button>
      </div>
    </Modal>
  );
};

const TeamView = ({ teamData, currentUser, setError }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const isLeader = teamData.leaderUid === currentUser.uid;

  const handleInviteMember = async (email) => {
    if (teamData.members.length >= MAX_TEAM_MEMBERS) {
      setError(`Team is full. Max ${MAX_TEAM_MEMBERS} members allowed.`);
      return;
    }
    if (teamData.members.some(m => m.email === email)) {
      setError("User is already in the team.");
      return;
    }
    
    setError('');
    try {
      const q = query(collection(db, getUserCollectionPath()), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("No user found with this email. They must register first.");
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.teamId) {
        setError("This user is already in another team.");
        return;
      }

      const batch = writeBatch(db);
      
      const teamDocRef = doc(db, getTeamDocPath(teamData.id));
      batch.update(teamDocRef, {
        members: [...teamData.members, { uid: userData.uid, email: userData.email, name: userData.name || userData.email }]
      });
      
      const userDocRef = doc(db, getUserDocPath(userData.uid));
      batch.update(userDocRef, { teamId: teamData.id });
      
      await batch.commit();
      setShowInviteModal(false);
      
    } catch (e) {
      console.error("Error inviting member:", e);
      setError("Failed to invite member.");
    }
  };

  const handleRemoveMember = async (memberUid) => {
    if (memberUid === teamData.leaderUid) {
      setError("Cannot remove the team leader.");
      return;
    }
    
    try {
      const batch = writeBatch(db);

      const teamDocRef = doc(db, getTeamDocPath(teamData.id));
      batch.update(teamDocRef, {
        members: teamData.members.filter(m => m.uid !== memberUid)
      });
      
      const userDocRef = doc(db, getUserDocPath(memberUid));
      batch.update(userDocRef, { teamId: null });
      
      await batch.commit();
    } catch (e) {
      console.error("Error removing member:", e);
      setError("Failed to remove member.");
    }
  };
  
  const handleMakePayment = async () => {
    try {
      await updateDoc(doc(db, getTeamDocPath(teamData.id)), {
        status: 'registered'
      });
    } catch (e) {
      setError("Failed to process payment.");
      console.error(e);
    }
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Team: {teamData.teamName}</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Team Status</h3>
        <p className="text-lg p-3 bg-gray-700 rounded-lg capitalize">
          {teamData.status.replace(/_/g, ' ')}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Members ({teamData.members.length}/{MAX_TEAM_MEMBERS})</h3>
        <ul className="space-y-2">
          {teamData.members.map(member => (
            <li key={member.uid} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span>
                {member.name} ({member.email})
                {member.uid === teamData.leaderUid && <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded-full">Leader</span>}
              </span>
              {isLeader && member.uid !== currentUser.uid && (
                <Button onClick={() => handleRemoveMember(member.uid)} variant="danger" className="px-2 py-1 text-sm">
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isLeader && teamData.members.length < MAX_TEAM_MEMBERS && (
        <Button onClick={() => setShowInviteModal(true)} variant="secondary" className="mr-2">
          Invite Member
        </Button>
      )}

      {teamData.status === 'pending_payment' && (
        <Card className="mt-6 border border-blue-500">
          <h3 className="text-2xl font-bold mb-4">Complete Registration</h3>
          <p className="mb-4">To complete your team's registration, please pay the fee of <span className="font-bold text-xl">₹{REGISTRATION_FEE}</span>.</p>
          <Button onClick={handleMakePayment} variant="success">
            Confirm Payment (Mock)
          </Button>
        </Card>
      )}

      <InviteMemberModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
      />
    </Card>
  );
};

export const TeamManagement = ({ currentUser, userData, teamData, setError }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  if (!userData) return <LoadingPage />;

  if (teamData) {
    return <TeamView teamData={teamData} currentUser={currentUser} setError={setError} />;
  }

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Team Management</h2>
      <p className="text-lg mb-6">You are not currently in a team. Create a new team to get started.</p>
      <Button onClick={() => setShowCreateModal(true)} variant="primary">
        Create New Team
      </Button>

      <CreateTeamModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        setError={setError}
      />
    </Card>
  );
};