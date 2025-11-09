import React, { useState, useEffect } from 'react';
import {
  auth,
  db,
  REGISTRATION_FEE,
  MAX_TEAM_MEMBERS,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  getTeamCollectionPath,
  getTeamDocPath,
  getUserCollectionPath,
  getUserDocPath,
  getR1MCQSubmissionsPath,
  getR1CodeSubmissionsPath,
  getR2SubmissionsPath,
} from '@/app/firebase/config';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LoadingPage, Modal } from '@/components/common/Loader';

const SidebarButton = ({ label, onClick, active, disabled = false }) => (
  <li>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
        active
          ? 'bg-blue-600 text-white font-semibold'
          : 'text-gray-300 hover:bg-gray-700'
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
    >
      {label}
    </button>
  </li>
);

const DashboardHome = ({ teamData, setCurrentView }) => {
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
          { uid: currentUser.uid, email: currentUser.email }
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
        members: [...teamData.members, { uid: userData.uid, email: userData.email }]
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
          {teamData.status.replace('_', ' ')}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Members ({teamData.members.length}/{MAX_TEAM_MEMBERS})</h3>
        <ul className="space-y-2">
          {teamData.members.map(member => (
            <li key={member.uid} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span>
                {member.email}
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
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <h4 className="font-semibold">Payment Details (As per PDF):</h4>
            <p>Account Number: XXX</p>
            <p>Account Holder Name: YYYY</p>
            <p>Bank: SBI, Branch: NIT Silchar</p>
            <p>IFSC Code: SBIN0007061</p>
          </div>
          <p className="mb-4 text-yellow-300">
            This is a mock payment for the assignment. Clicking 'Confirm Payment' will simulate a successful payment.
          </p>
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

const TeamManagement = ({ currentUser, userData, teamData, setError }) => {
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

const Round1Page = ({ teamData, setError }) => {
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingSubmission, setCodingSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mcqQuestions = [
    { id: 'q1', text: 'What is the time complexity of a binary search?' },
    { id: 'q2', text: 'Which of these is not a pillar of OOP?' },
    { id: 'q3', text: 'What does "AI" stand for?' },
  ];
  const codingQuestion = "Write a Python function `factorial(n)` that returns the factorial of a non-negative integer `n`.";

  const handleMcqSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, getR1MCQSubmissionsPath(teamData.id)), {
        answers: mcqAnswers,
        submittedAt: serverTimestamp(),
      });
      alert("MCQ answers submitted!");
    } catch (e) {
      console.error(e);
      setError("Failed to submit MCQ answers.");
    }
    setLoading(false);
  };
  
  const handleCodeSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, getR1CodeSubmissionsPath(teamData.id)), {
        code: codingSubmission,
        submittedAt: serverTimestamp(),
      });
      alert("Coding submission received!");
    } catch (e) {
      console.error(e);
      setError("Failed to submit code.");
    }
    setLoading(false);
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Round 1: Screening</h2>
      <p className="mb-6 text-gray-300">This round consists of MCQs, aptitude, and basic coding questions.</p>
      
      <div className="space-y-8">
        <Card className="bg-gray-900">
          <h3 className="text-2xl font-semibold mb-4">Part 1: MCQs</h3>
          <div className="space-y-4">
            {mcqQuestions.map(q => (
              <div key={q.id}>
                <p className="font-medium mb-2">{q.text}</p>
                <select 
                  onChange={(e) => setMcqAnswers({...mcqAnswers, [q.id]: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg"
                >
                  <option value="">Select an answer</option>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            ))}
          </div>
          <Button onClick={handleMcqSubmit} disabled={loading} className="mt-4">
            Submit MCQs
          </Button>
        </Card>
        
        <Card className="bg-gray-900">
          <h3 className="text-2xl font-semibold mb-4">Part 2: Basic Coding</h3>
          <p className="font-medium mb-4">{codingQuestion}</p>
          <textarea
            value={codingSubmission}
            onChange={(e) => setCodingSubmission(e.target.value)}
            rows="10"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your code here..."
          ></textarea>
          <Button onClick={handleCodeSubmit} disabled={loading} className="mt-4">
            Submit Code
          </Button>
        </Card>
      </div>
    </Card>
  );
};

const Round2Page = ({ teamData, setError }) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [loading, setLoading] = useState(false);
  
  const problemStatement = {
    title: "AI/ML Challenge: Predictive Analytics",
    description: "Develop a machine learning model to predict customer churn for a telecommunications company. Your submission should include your model, training code, and a brief report (max 3 pages) explaining your approach, feature engineering, and model evaluation.",
    dataset: "dataset_link_placeholder.csv",
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink) {
      setError("Please provide a submission link.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, getR2SubmissionsPath(teamData.id)), {
        submissionLink: submissionLink,
        submittedAt: serverTimestamp(),
      });
      alert("Round 2 submission received!");
    } catch (e) {
      console.error(e);
      setError("Failed to submit.");
    }
    setLoading(false);
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-4">Round 2: AI/ML Challenge</h2>
      
      <Card className="bg-gray-900 mb-6">
        <h3 className="text-2xl font-semibold mb-3">{problemStatement.title}</h3>
        <p className="mb-4">{problemStatement.description}</p>
        <p className="font-medium">Dataset: <span className="text-blue-400">{problemStatement.dataset}</span></p>
      </Card>
      
      <form onSubmit={handleSubmit}>
        <h3 className="text-xl font-semibold mb-2">Submit Your Work</h3>
        <p className="text-gray-400 mb-4">Upload your project (code, report) to a GitHub repository or Google Drive and paste the public link below.</p>
        <Input
          value={submissionLink}
          onChange={(e) => setSubmissionLink(e.target.value)}
          placeholder="https://github.com/your-team/repo"
        />
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? 'Submitting...' : 'Submit Round 2 Project'}
        </Button>
      </form>
    </Card>
  );
};

const Round3Page = ({ teamData }) => (
  <Card>
    <h2 className="text-3xl font-bold mb-4">Round 3: Final Hackathon (Offline)</h2>
    <div className="text-lg space-y-4">
      <p className="text-green-400 font-bold">Congratulations on reaching the final round!</p>
      <p>The final round is a 36-hour offline hackathon held at the NIT Silchar campus.</p>
      <p><span className="font-semibold">Date:</span> February 2026 (Last Week) - Exact dates TBA.</p>
      <p><span className="font-semibold">Venue:</span> NIT Silchar, Assam</p>
      <p>Free accommodation will be provided. More details regarding travel and logistics will be emailed to your team leader.</p>
      <p>Get ready to build something amazing!</p>
    </div>
  </Card>
);

export const ParticipantDashboard = ({ currentUser, userData, teamData, setError }) => {
  const [currentView, setCurrentView] = useState('DASHBOARD');

  const renderDashboardView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <DashboardHome teamData={teamData} setCurrentView={setCurrentView} />;
      case 'TEAM':
        return <TeamManagement currentUser={currentUser} userData={userData} teamData={teamData} setError={setError} />;
      case 'ROUND1':
        return <Round1Page teamData={teamData} setError={setError} />;
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

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 rounded-lg p-4 mr-8 shadow-lg">
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
            disabled={!teamData?.status || teamData.status === 'pending_payment'}
          />
          <SidebarButton
            label="Round 2"
            onClick={() => setCurrentView('ROUND2')}
            active={currentView === 'ROUND2'}
            disabled={!teamData?.status || !['round_2', 'round_3'].includes(teamData.status)}
          />
          <SidebarButton
            label="Round 3 (Final)"
            onClick={() => setCurrentView('ROUND3')}
            active={currentView === 'ROUND3'}
            disabled={!teamData?.status || teamData.status !== 'round_3'}
          />
        </ul>
      </nav>

      <div className="flex-1">
        {renderDashboardView()}
      </div>
    </div>
  );
};


const ManageTeams = ({ teams, setError }) => {
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

const ManageRound1 = ({ teams, setError }) => {
  const registeredTeams = teams.filter(t => t.status === 'registered');
  
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
      <p className="mb-4">Review Round 1 submissions and advance teams to Round 2.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">Team Name</th>
              <th className="p-2">Status</th>
              <th className="p-2">Submissions</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registeredTeams.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">No teams in Round 1.</td>
              </tr>
            )}
            {registeredTeams.map(team => (
              <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{team.teamName}</td>
                <td className="p-2 capitalize">{team.status}</td>
                <td className="p-2">
                  <span className="text-blue-400 cursor-pointer">View</span>
                </td>
                <td className="p-2 space-x-2">
                  <Button onClick={() => handleAdvanceTeam(team.id)} variant="success" className="text-sm px-2 py-1">
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

const ManageRound2 = ({ teams, setError }) => {
  const round2Teams = teams.filter(t => t.status === 'round_2');
  
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
                  <span className="text-blue-400 cursor-pointer">View Link</span>
                </td>
                <td className="p-2 space-x-2">
                  <Button onClick={() => handleAdvanceTeam(team.id)} variant="success" className="text-sm px-2 py-1">
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

export const AdminDashboard = ({ currentUser, setError }) => {
  const [currentView, setCurrentView] = useState('TEAMS');
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
      case 'TEAMS':
        return <ManageTeams teams={teams} setError={setError} />;
      case 'ROUND1':
        return <ManageRound1 teams={teams} setError={setError} />;
      case 'ROUND2':
        return <ManageRound2 teams={teams} setError={setError} />;
      default:
        return <ManageTeams teams={teams} setError={setError} />;
    }
  };
  
  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 rounded-lg p-4 mr-8 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400 mb-4">Admin Menu</h3>
        <ul className="space-y-2">
          <SidebarButton
            label="Manage Teams"
            onClick={() => setCurrentView('TEAMS')}
            active={currentView === 'TEAMS'}
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