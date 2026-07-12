import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-primary-500 mb-4 text-center">
          Welcome to AssetFlow
        </h1>
        <p className="text-muted-light dark:text-muted-dark text-lg text-center">
          A premium, modern asset/resource management system built with Vite + React + Tailwind.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button className="px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition">
            Get Started
          </button>
          <button className="px-6 py-2 rounded-md border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
