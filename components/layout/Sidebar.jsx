"use client";
import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 border-r">
      <ul className="space-y-3">
        <li>
          <Link href="/hackathon2026">🏠 Dashboard</Link>
        </li>
        <li>
          <Link href="/hackathon2026/round1">⚙️ Round 1</Link>
        </li>
        <li>
          <Link href="/hackathon2026/round2">🧩 Round 2</Link>
        </li>
        <li>
          <Link href="/hackathon2026/round3">🏁 Round 3</Link>
        </li>
      </ul>
    </aside>
  );
}
