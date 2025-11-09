"use client";
import React, { useState, useEffect } from 'react';
import {
  db,
  collection,
  query,
  onSnapshot,
  getUserCollectionPath
} from '@/app/firebase/config';
import Card from '../ui/Card.jsx';
import { LoadingPage } from '../common/Loader.jsx';

export const ManageUsers = ({ setError }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, getUserCollectionPath()));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setLoading(false);
    }, (e) => {
      console.error("Error fetching users:", e);
      setError("Failed to fetch user data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setError]);

  if (loading) return <LoadingPage />;

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Registered Users</h3>
      <p className="mb-4">A list of all users who have created an account.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Team ID</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">No users found.</td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 text-xs">{user.uid}</td>
                <td className="p-2 text-xs">{user.teamId || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};