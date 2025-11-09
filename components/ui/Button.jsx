"use client"
import React from 'react';

const Button = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-75";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    disabled: "bg-gray-500 text-gray-300 cursor-not-allowed",
  };
  const style = disabled ? variants.disabled : variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${style} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;