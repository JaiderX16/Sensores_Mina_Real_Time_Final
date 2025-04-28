import React, { useState, useEffect } from 'react';
import { DigitalClock } from '../components/DigitalClock';
import SensorMetricCard from '../components/SensorMetricCard';

const Dashboard = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) {
    return <div className="text-white text-xl p-8">Cargando áreas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-xl p-8">Error: {error}</div>;
  }

  return (
    <div className="animate-fade-in p-4">
      <div>
        <DigitalClock />
      </div>

      {/* Renderizar áreas dinámicamente */}
      {areas.map((area, index) => (
        <div className="mb-8" key={area.id}>
          <h1 className='text-white font-bold text-3xl mb-6 flex items-center'>
            <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-2 h-8 mr-3 rounded`}></span>
            {area.nombre_area}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SensorMetricCard
              icon="Wind"
              title="Velocidad del viento"
              value="10"
              color="#3b82f6"
              minThreshold="0"
              maxThreshold="20"
              unit="m/s"
            />
            <SensorMetricCard
              icon="Thermometer"
              title="Temperatura"
              value="25"
              color="#10b981"
              minThreshold="10"
              maxThreshold="30"
              unit="°C"
            />
            <SensorMetricCard
              icon="Droplets"
              title="Humedad"
              value="50"
              color="#f59e0b"
              minThreshold="0"
              maxThreshold="100"
              unit="%"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;