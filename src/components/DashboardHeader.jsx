// components/DashboardHeader.jsx
import React from 'react';
import { format } from 'date-fns';
import { DigitalClock } from './DigitalClock.jsx';
import LogoutButton from './LogoutButton.jsx';

export default function DashboardHeader({ loading, lastUpdate }) {
  return (
    <>
      <DigitalClock />
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-400 text-sm">
          {lastUpdate && (
            <>Última actualización: {format(lastUpdate, 'HH:mm:ss')} {loading && '(actualizando...)'}</>
          )}
        </div>
      </div>
      <LogoutButton />
    </>
  );
}