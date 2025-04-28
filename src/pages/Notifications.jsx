import React, { useState, useEffect } from 'react';
import AlertsList from '../components/AlertsList';

const Notifications = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar áreas desde la API
    const fetchAreas = async () => {
      try {
        const response = await fetch('https://apisensoresmina-production.up.railway.app/api/areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('Error al cargar las áreas');
        }

        const areasData = await response.json();
        setAreas(areasData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Notificaciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Administra las notificaciones del sistema.</p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-gray-500 dark:text-white">Cargando áreas...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          areas.map((area, index) => (
            <div key={area.id}>
              <h1 className="text-gray-800 dark:text-white font-bold text-xl mb-6 flex items-center">
                <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-2 h-8 mr-3 rounded`}></span>
                {area.nombre_area}
              </h1>
              <AlertsList areaId={area.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;