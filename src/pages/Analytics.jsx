import React, { useState, useEffect } from 'react';
import SensorChart from '../components/SensorChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const Analytics = () => {
  const [areas, setAreas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener áreas
        const areasResponse = await fetch('https://apisensoresmina-production.up.railway.app/api/areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!areasResponse.ok) {
          throw new Error('Error al cargar las áreas');
        }

        const areasData = await areasResponse.json();
        setAreas(areasData);

        // Obtener sensores
        const sensoresResponse = await fetch('https://apisensoresmina-production.up.railway.app/api/sensores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!sensoresResponse.ok) {
          throw new Error('Error al cargar los sensores');
        }

        const sensoresData = await sensoresResponse.json();
        setSensores(sensoresData);

        // Obtener todas las mediciones de una sola vez
        const medicionesResponse = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!medicionesResponse.ok) {
          throw new Error('Error al cargar las mediciones');
        }

        const medicionesData = await medicionesResponse.json();
        setMediciones(medicionesData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener mediciones por área
  const getMedicionesByArea = (areaId) => {
    return mediciones.filter(medicion => medicion.area_id === areaId);
  };

  // Función para formatear los datos para los gráficos
  const formatChartData = (areaId, tipoMedicion) => {
    const areaMediciones = getMedicionesByArea(areaId);
    
    if (!areaMediciones || areaMediciones.length === 0) return [];
    
    // Ordenar por timestamp
    const sortedData = [...areaMediciones].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    return sortedData.map(medicion => {
      let valor = 0;
      
      if (tipoMedicion === "temperature") {
        valor = parseFloat(medicion.temperature || 0);
      } else if (tipoMedicion === "velocity") {
        valor = parseFloat(medicion.velocity || 0);
      } else if (tipoMedicion === "flow") {
        valor = parseFloat(medicion.flow || 0);
      }
      
      return {
        timestamp: medicion.timestamp,
        valor: valor
      };
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="animate-fade-in p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visualización de datos históricos de sensores.</p>
      </div>
      
      {/* Renderizar áreas dinámicamente */}
      {areas.map((area, index) => {
        const areaId = area.id;
        
        // Obtener la última medición para mostrar valores actuales
        const areaMediciones = getMedicionesByArea(areaId);
        const ultimaMedicion = areaMediciones.length > 0 ? 
          areaMediciones.reduce((latest, current) => 
            new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
          ) : null;
        
        return (
          <div className="mb-12" key={area.id}>
            <h1 className='text-white font-bold text-2xl mb-6 flex items-center'>
              <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-2 h-8 mr-3 rounded`}></span>
              {area.nombre_area}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gráfico de Temperatura */}
              <div>
                <SensorChart
                  title={`Temperatura (${ultimaMedicion ? parseFloat(ultimaMedicion.temperature).toFixed(2) : 'N/A'} °C)`}
                  data={formatChartData(areaId, "temperature")}
                  dataKey="valor"
                  lineColor="#ef4444"
                  name="Temperatura"
                  minThreshold={20}
                  maxThreshold={40}
                />
              </div>
              
              {/* Gráfico de Velocidad */}
              <div>
                <SensorChart
                  title={`Velocidad del Viento (${ultimaMedicion ? parseFloat(ultimaMedicion.velocity).toFixed(2) : 'N/A'} m/s)`}
                  data={formatChartData(areaId, "velocity")}
                  dataKey="valor"
                  lineColor="#3b82f6"
                  name="Velocidad"
                  minThreshold={5}
                  maxThreshold={30}
                />
              </div>
              
              {/* Gráfico de Flujo */}
              <div>
                <SensorChart
                  title={`Flujo de Aire (${ultimaMedicion ? parseFloat(ultimaMedicion.flow).toFixed(2) : 'N/A'} m³/h)`}
                  data={formatChartData(areaId, "flow")}
                  dataKey="valor"
                  lineColor="#10b981"
                  name="Flujo"
                  minThreshold={60}
                  maxThreshold={120}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Analytics;