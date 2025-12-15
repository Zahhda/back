import React from 'react';

const AdminDashboardSimple = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard (Simple Version)</h1>
      <p>This is a simplified version of the Admin Dashboard component for debugging purposes.</p>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl mb-2">Debug Information</h2>
        <ul className="list-disc pl-5">
          <li>URL: {window.location.href}</li>
          <li>Path: {window.location.pathname}</li>
          <li>User Agent: {navigator.userAgent}</li>
        </ul>
      </div>
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => window.location.href = '/'}
      >
        Go Home
      </button>
    </div>
  );
};

export default AdminDashboardSimple; 