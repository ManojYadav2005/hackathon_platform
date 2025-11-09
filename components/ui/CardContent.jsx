"use client"
import React from 'react';

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export default CardContent;