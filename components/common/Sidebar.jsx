"use client";
import React from 'react';

export const SidebarButton = ({ label, onClick, active, disabled = false }) => (
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