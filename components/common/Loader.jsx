
"use client";
import React from 'react';
import { HACKATHON_NAME } from '../../app/firebase/config';
import Button from '../ui/Button.jsx';

export const LoadingPage = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export const ErrorPage = ({ message }) => (
  <div className="text-center p-8 bg-red-900 rounded-lg shadow-xl">
    <h2 className="text-3xl font-bold mb-4">An Error Occurred</h2>
    <p className="text-lg">{message}</p>
  </div>
);

export const ErrorDisplay = ({ message, clearError }) => (
  <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center">
    <span>{message}</span>
    <button onClick={clearError} className="ml-4 font-bold text-xl">&times;</button>
  </div>
);

export const Header = ({ currentUser, isAdmin, handleLogout, setCurrentPage }) => (
  <header className="bg-gray-800 shadow-lg">
    <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div
        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 cursor-pointer"
        
        // --- THIS IS THE FIX ---
        // It now always goes to 'HOME' instead of the dashboard
        onClick={() => setCurrentPage('HOME')}
        // --- END OF FIX ---

      >
        {HACKATHON_NAME}
      </div>
      <div>
        {currentUser && !currentUser.isAnonymous ? (
          <>
            <span className="mr-4 text-gray-300">
              {isAdmin ? 'Admin' : currentUser.email}
            </span>
            <Button onClick={handleLogout} variant="danger">
              Log Out
            </Button>
          </>
        ) : (
          !isAdmin && (
            <>
              <Button onClick={() => setCurrentPage('LOGIN')} variant="secondary" className="mr-2">
                Login
              </Button>
              <Button onClick={() => setCurrentPage('REGISTER')} variant="primary">
                Register
              </Button>
            </>
          )
        )}
      </div>
    </nav>
  </header>
);

export const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
