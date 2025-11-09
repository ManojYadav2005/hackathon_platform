import { Inter } from "next/font/google";
import "./globals.css";

// Define the Inter font, which is standard and already used in your UI components
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hackathon 2026 Registration",
  description: "Participant and Admin Portal for the Hackathon 2026 Competition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the Inter font class to the body */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}