"use client";
import React from "react";
import { Button } from "@/components/ui";

export default function Navbar({ onLogout }) {
  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white px-6 py-3">
      <h1 className="font-bold text-lg">Hackathon 2026</h1>
      <Button variant="secondary" onClick={onLogout}>
        Logout
      </Button>
    </nav>
  );
}
