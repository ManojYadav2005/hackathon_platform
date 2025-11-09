"use client"
import React from 'react';

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-3xl font-bold ${className}`}>
    {children}
  </h2>
);

export default CardTitle;