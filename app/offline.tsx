"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Offline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-purple-500 mb-6">
          {isOnline ? "You're back online!" : "You're offline"}
        </h1>

        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full text-purple-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-4.5-8.599M13.5 10l-4-4m4 4l-4 4"
              />
            </svg>
          </div>

          {isOnline ? (
            <p className="text-lg">
              Your connection has been restored. You can continue typing!
            </p>
          ) : (
            <p className="text-lg">
              It looks like you've lost your internet connection.
              TypingMaster works offline, so you can still access previously loaded content.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-200"
        >
          {isOnline ? "Continue Typing" : "Try Offline Mode"}
        </Link>

        {!isOnline && (
          <p className="mt-8 text-sm text-gray-400">
            Some features might be limited while offline. Connect to the internet for the full experience.
          </p>
        )}
      </div>
    </div>
  );
}
