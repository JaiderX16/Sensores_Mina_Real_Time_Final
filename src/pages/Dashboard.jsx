import React, { useState, useEffect } from 'react';
import { DigitalClock } from '../components/DigitalClock';
import SensorMetricCard from '../components/SensorMetricCard';

const Dashboard = () => {
  const [areas, setAreas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        // Obtener mediciones en tiempo real
        const medicionesResponse = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones-tiempo-real', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!medicionesResponse.ok) {
          throw new Error('Error al cargar las mediciones en tiempo real');
        }

        const medicionesData = await medicionesResponse.json();
        setMediciones(medicionesData);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Actualizar datos cada 10 segundos para datos en tiempo real
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Función para obtener la última medición de un sensor específico
  const getLastMeasurement = (areaId, tipoSensor) => {
    // Filtrar mediciones por área
    const areaMediciones = mediciones.filter(medicion => medicion.area_id === areaId);
    
    if (!areaMediciones || areaMediciones.length === 0) {
      return { valor: 0, timestamp: new Date() };
    }
    
    // Ordenar por timestamp (más recientes primero)
    const sortedData = [...areaMediciones].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Obtener el valor según el tipo de sensor
    // Tomamos el último elemento después de ordenar, que será el más reciente
    const ultimaMedicion = sortedData[sortedData.length - 1];
    let valor = 0;
    
    if (tipoSensor === "temperatura") {
      valor = parseFloat(ultimaMedicion.temperature || 0);
    } else if (tipoSensor === "velocidad") {
      valor = parseFloat(ultimaMedicion.velocity || 0);
    } else if (tipoSensor === "flujo") {
      valor = parseFloat(ultimaMedicion.flow || 0);
    }
    
    return { valor, timestamp: ultimaMedicion.timestamp };
  };

  // Función para obtener los umbrales de un tipo de sensor específico
  const getSensorThresholds = (areaId, tipoSensor) => {
    // Filtrar sensores por área y tipo
    const sensorFiltrado = sensores.find(sensor => 
      sensor.area_id === areaId && 
      (sensor.tipo_sensor === tipoSensor || 
       sensor.nombre_sensor.includes(tipoSensor))
    );
    
    if (sensorFiltrado) {
      return {
        min: parseFloat(sensorFiltrado.umbral_min || 0),
        max: parseFloat(sensorFiltrado.umbral_max || 100)
      };
    }
    
    // Valores predeterminados si no se encuentra el sensor
    const defaultThresholds = {
      temperatura: { min: 20, max: 40 },
      velocidad: { min: 5, max: 30 },
      flujo: { min: 60, max: 120 }
    };
    
    return defaultThresholds[tipoSensor] || { min: 0, max: 100 };
  };

  if (loading && areas.length === 0) {
    return <div className="text-white text-xl p-8">Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-xl p-8">Error: {error}</div>;
  }

  return (
    <div className="animate-fade-in p-4">

      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-6xl text-white font-bold my-12">Acumulación Yumpag</h1>
      </div>

      <div>
        <DigitalClock />
        {lastUpdate && (
          <div className="text-gray-400 text-sm mb-4">
            Última actualización: {lastUpdate.toLocaleTimeString()} {loading && '(actualizando...)'}
          </div>
        )}
      </div>

      {/* Renderizar áreas dinámicamente */}
      {areas.map((area, index) => {
        const areaId = area.id;
        
        // Obtener mediciones y umbrales para cada tipo de sensor
        const velocidadData = getLastMeasurement(areaId, "velocidad");
        const temperaturaData = getLastMeasurement(areaId, "temperatura");
        const flujoData = getLastMeasurement(areaId, "flujo");
        
        const velocidadThresholds = getSensorThresholds(areaId, "velocidad");
        const temperaturaThresholds = getSensorThresholds(areaId, "temperatura");
        const flujoThresholds = getSensorThresholds(areaId, "flujo");
        
        return (
          <div className="mb-8" key={area.id}>
            <h1 className='text-white font-bold text-3xl mb-6 flex items-center'>
              <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-2 h-8 mr-3 rounded`}></span>
              {area.nombre_area}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SensorMetricCard
                icon="Wind"
                title="Viento"
                value={velocidadData.valor.toFixed(2)}
                color="#3b82f6"
                minThreshold={velocidadThresholds.min.toFixed(2)}
                maxThreshold={velocidadThresholds.max.toFixed(2)}
                unit="m/s"
              />
              <SensorMetricCard
                icon="Thermometer"
                title="Temperatura"
                value={temperaturaData.valor.toFixed(2)}
                color="#10b981"
                minThreshold={temperaturaThresholds.min.toFixed(2)}
                maxThreshold={temperaturaThresholds.max.toFixed(2)}
                unit="°C"
              />
              <SensorMetricCard
                icon="Droplets"
                title="Caudal"
                value={flujoData.valor.toFixed(2)}
                color="#f59e0b"
                minThreshold={flujoThresholds.min.toFixed(2)}
                maxThreshold={flujoThresholds.max.toFixed(2)}
                unit="m³/h"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;