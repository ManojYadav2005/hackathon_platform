
"use client";
import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useRoundConfig } from '../../context/RoundConfigContext.jsx';
import { HACKATHON_NAME } from '../../app/firebase/config.js';

const getCertificateDetails = (teamData, userData, roundConfig) => {
  const { status, round1Score } = teamData;
  const numMcqs = roundConfig?.round1?.answers ? Object.keys(roundConfig.round1.answers).length : 0;
  
  let percentage = 0;
  if (numMcqs > 0 && round1Score !== null) {
    percentage = (round1Score / numMcqs) * 100;
  }

  if (percentage >= 80 || status === 'round_3') {
    return {
      title: "Certificate of Outstanding Performance",
      color: "text-yellow-400",
      bgColor: "bg-gray-900",
      borderColor: "border-yellow-400",
      message: `This certificate is awarded to ${userData.name} for demonstrating exceptional skill and qualifying for the final round and/or achieving a score of ${percentage.toFixed(0)}% in Round 1.`
    };
  }
  
  if (percentage >= 50 || status === 'round_2') {
    return {
      title: "Certificate of Appreciation",
      color: "text-blue-400",
      bgColor: "bg-gray-900",
      borderColor: "border-blue-500",
      message: `This certificate is awarded to ${userData.name} for successfully qualifying for Round 2 and achieving a score of ${percentage.toFixed(0)}% in the preliminary round.`
    };
  }

  return {
    title: "Certificate of Participation",
    color: "text-gray-300",
    bgColor: "bg-gray-900",
    borderColor: "border-gray-500",
    message: `This certificate is awarded to ${userData.name} for successfully participating in ${HACKATHON_NAME}. We appreciate your hard work and dedication.`
  };
};

export const CertificatePage = ({ teamData, userData }) => {
  const roundConfig = useRoundConfig();

  if (!teamData || !userData || !roundConfig) {
    return <Card><p>Loading certificate data...</p></Card>;
  }

  const { title, color, message, bgColor, borderColor } = getCertificateDetails(teamData, userData, roundConfig);

  return (
    <Card>
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
          }
          .certificate-container {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !imptant;
            border-width: 4px !important;
          }
          .print-text-yellow-400 { color: #facc15 !important; }
          .print-text-blue-400 { color: #60a5fa !important; }
          .print-text-gray-300 { color: #d1d5db !important; }
          .print-text-white { color: #ffffff !important; }
          .print-text-gray-400 { color: #9ca3af !important; }
          .print-text-gray-500 { color: #6b7280 !important; }
          .print-bg-gray-900 { background-color: #111827 !important; }
          .print-border-yellow-400 { border-color: #facc15 !important; }
          .print-border-blue-500 { border-color: #3b82f6 !important; }
          .print-border-gray-500 { border-color: #6b7280 !important; }
          .print-border-gray-700 { border-color: #374151 !important; }
        }
      `}</style>
      
      <div 
        className={`certificate-container ${bgColor} ${borderColor} border-4 p-8 rounded-lg text-center shadow-2xl print:bg-gray-900 print:border-blue-500`} 
        id="certificate-to-print"
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 print:text-blue-400">
          {HACKATHON_NAME}
        </h2>
        
        <h3 className={`text-4xl font-semibold ${color} mb-8 print-text-${color.split('-')[1]}-400`}>
          {title}
        </h3>
        
        <p className="text-lg text-gray-300 mb-4 print:text-gray-300">This is to certify that</p>
        
        <p className="text-5xl font-bold text-white mb-8 print:text-white">
          {userData.name}
        </p>
        
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 print:text-gray-400">
          {message}
        </p>
        
        <div className="flex justify-between items-center border-t border-gray-700 pt-8 print:border-gray-700">
          <div>
            <p className="font-semibold text-white print:text-white">Prof. [Faculty Name]</p>
            <p className="text-sm text-gray-500 print:text-gray-500">Faculty Coordinator, CSE</p>
          </div>
          <div>
            <p className="font-semibold text-white print:text-white">[Student Coordinator]</p>
            <p className="text-sm text-gray-500 print:text-gray-500">Student Coordinator</p>
          </div>
        </div>
      </div>
      
      <Button onClick={() => window.print()} className="mt-6 w-full print:hidden">
        Download as PDF (Print)
      </Button>
    </Card>
  );
};
