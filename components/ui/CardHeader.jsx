"use client"
import React from 'react';
import Card from './Card';

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export default CardHeader;