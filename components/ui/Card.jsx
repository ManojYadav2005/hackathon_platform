"use client"
import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 p-6 rounded-lg shadow-xl ${className}`}>
    {children}
  </div>
);

export default Card;