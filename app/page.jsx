// app/page.jsx

// This imports the entire Hackathon app from your subfolder
import HackathonApp from './hackathon2026/page';

// This makes the HackathonApp component the default content for the root URL (/)
export default function RootPage() {
  return <HackathonApp />;
}