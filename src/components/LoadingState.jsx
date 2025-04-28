// components/LoadingState.jsx
import React from 'react';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 flex justify-center items-center">
      <div className="text-white text-xl">Cargando datos de sensores...</div>
    </div>
  );
}