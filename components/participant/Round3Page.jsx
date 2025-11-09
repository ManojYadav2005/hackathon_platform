"use client";
import React from 'react';
import Card from '../ui/Card.jsx';

export const Round3Page = ({ teamData }) => (
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