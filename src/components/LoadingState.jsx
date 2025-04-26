// components/LoadingState.jsx
import React from 'react';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 flex justify-center items-center">
      <div className="text-white text-xl">Cargando datos de sensores...</div>
    </div>
  );
}

// components/ErrorState.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col justify-center items-center">
      <div className="text-red-500 text-xl mb-4">
        <AlertCircle size={48} className="mx-auto mb-4" />
        {error}
      </div>
      <div className="text-white text-md max-w-lg text-center">
        La API podría estar inaccesible o no contener datos adecuados para este dashboard.
      </div>
    </div>
  );
}