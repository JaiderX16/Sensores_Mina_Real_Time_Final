import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Wind, Thermometer, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import LogoutButton from './LogoutButton.jsx';

import Metric from './Metric.jsx'

import { DigitalClock } from './DigitalClock.jsx';

// Umbral de valores (no cambia)
const thresholds = {
  minVelocity: 18,
  maxVelocity: 25,
  minFlow: 100,
  maxFlow: 150,
  minTemperature: 20,
  maxTemperature: 35,
};

// URL de la API Magic Loops
const API_URL = 'https://magicloops.dev/api/loop/59547e33-7723-4348-8dc8-b0a2f4473763/run';

export default function Dashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función para generar datos aleatorios (solo se usa si necesitamos crear nuevos datos)
  const generateRandomData = () => {
    return {
      velocity: 18 + Math.random() * 8, // Entre 18 y 26 m/s
      flow: 90 + Math.random() * 70, // Entre 90 y 160 m³/h
      temperature: 19 + Math.random() * 17, // Entre 19 y 36 °C
      timestamp: new Date().toISOString()
    };
  };

  useEffect(() => {
    // Hacer la llamada a la API y obtener los datos
    const fetchData = async () => {
      try {
        setLoading(true);
        // Llamar a la API de Magic Loops con los parámetros adecuados
        const response = await fetch(`${API_URL}?method=GET&path=%2Fsensor-data`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Procesar fechas y asegurar que los valores numéricos sean números
        const processedData = data.map(item => ({
          ...item,
          velocity: parseFloat(item.velocity),
          flow: parseFloat(item.flow),
          temperature: parseFloat(item.temperature),
          timestamp: new Date(item.timestamp).toISOString()
        }));
        
        // Ordenar los datos por timestamp para asegurar que estén en el orden correcto
        const sortedData = [...processedData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setSensorData(sortedData);
        setLastUpdate(new Date());
        
        // Comprobar los umbrales para generar alertas
        if (sortedData.length > 0) {
          const latestReading = sortedData[sortedData.length - 1];
          checkThresholds(latestReading);
        }
        
        setError(null);
      } 
      
      catch (error) {
        console.error('Error al obtener los datos:', error);
        setError('No se pudieron cargar los datos desde la API.');
      } 
      
      finally {
        setLoading(false);
      }
    };

    fetchData();

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkThresholds = (data) => {
    const newAlerts = [];

    if (data.velocity < thresholds.minVelocity) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'error',
        message: `Baja velocidad detectada: ${data.velocity.toFixed(2)} m/s`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.velocity > thresholds.maxVelocity) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'error',
        message: `Alta velocidad detectada: ${data.velocity.toFixed(2)} m/s`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.flow < thresholds.minFlow) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'warning',
        message: `Caudal bajo: ${data.flow.toFixed(2)} m³/h`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.flow > thresholds.maxFlow) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'warning',
        message: `Alto caudal: ${data.flow.toFixed(2)} m³/h`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.temperature < thresholds.minTemperature) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'warning',
        message: `Baja temperatura: ${data.temperature.toFixed(2)} °C`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.temperature > thresholds.maxTemperature) {
      newAlerts.push({
        id: Math.random().toString(36).substring(2),
        type: 'error',
        message: `Temperatura alta: ${data.temperature.toFixed(2)} °C`,
        timestamp: new Date().toISOString(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
    }
  };

  const getLatestReading = () => {
    if (sensorData.length === 0) return null;
    return sensorData[sensorData.length - 1];
  };

  const latestReading = getLatestReading();

  // Función para el dominio del eje Y en gráficos
  const getYDomain = (dataKey, minThreshold, maxThreshold) => {
    if (sensorData.length === 0) return [0, 100];
    
    const values = sensorData.map(d => d[dataKey]);
    const min = Math.min(...values, minThreshold);
    const max = Math.max(...values, maxThreshold);
    
    // Añadir un margen para mejor visualización
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  if (loading && sensorData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex justify-center items-center">
        <div className="text-white text-xl">Cargando datos de sensores...</div>
      </div>
    );
  }

  if (error && sensorData.length === 0) {
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




  return (
    <div className="min-h-screen bg-gray-900 mx-1 p-6 flex flex-col justify-center items-center">

      <DigitalClock />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-400 text-sm">
            {lastUpdate && (
              <>Última actualización: {format(lastUpdate, 'HH:mm:ss')} {loading && '(actualizando...)'}</>
            )}

          </div>
          
        </div>

        <LogoutButton/>

        {/* Current Readings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Wind className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Velocidad (m/s)</h2>
            </div>
            <div className="flex flex-col items-center justify-center h-full mt-1">
              <Metric 
                label="WIND SPEED" 
                unit="" 
                value={latestReading ? latestReading.velocity.toFixed(2) : '—'} 
                color="#3877de"
              />
              <p className="text-sm text-gray-400 mt-3 pb-2">
                Límite: {thresholds.minVelocity} - {thresholds.maxVelocity} m/s
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Droplets className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Caudal (m³/h)</h2>
            </div>


            <div className="flex flex-col items-center justify-center h-full mt-1">
              <Metric 
                label="WIND SPEED" 
                unit="" 
                value={latestReading ? latestReading.flow.toFixed(2) : '—'} 
                color="#009578"
              />
              <p className="text-sm text-gray-400 mt-3 pb-2">
                Límite: {thresholds.minFlow} - {thresholds.maxFlow} m³/h
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Thermometer className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Temperatura (°C)</h2>
            </div>

            <div className="flex flex-col items-center justify-center h-full mt-1">
              <Metric 
                label="WIND SPEED" 
                unit="" 
                value={latestReading ? latestReading.temperature.toFixed(2) : '—'} 
                color="#ef4444"
              />
              <p className="text-sm text-gray-400 mt-3 pb-2">
                Límite: {thresholds.minTemperature} - {thresholds.maxTemperature} °C
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Alertas Recientes</h2>
          <div className="bg-gray-800 rounded-lg shadow divide-y divide-gray-700">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 flex items-center gap-3 ${
                    alert.type === 'error'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  <AlertCircle size={20} />
                  <span>{alert.message}</span>
                  <span className="ml-auto text-sm text-gray-400">
                    {format(new Date(alert.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-green-400 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span>Todos los sistemas funcionan dentro de parámetros normales.</span>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Grafico de Velocidad del Viento */}
          <div className="bg-gray-800 rounded-lg shadow pr-6 py-4 pl-2">
            <h2 className="text-xl font-semibold mb-4 text-white ml-6">Tendencia de la Velocidad</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={getYDomain('velocity', thresholds.minVelocity, thresholds.maxVelocity)}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip
                    labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#2563eb"
                    name="Velocidad (m/s)"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {/* Líneas de umbral */}
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.minVelocity}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    name="Min Umbral"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.maxVelocity}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    name="Max Umbral"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico deL Caudal */}
          <div className="bg-gray-800 rounded-lg shadow pr-6 py-4 pl-2">
            <h2 className="text-xl font-semibold mb-4 text-white ml-6">Tendencia del Caudal</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={getYDomain('flow', thresholds.minFlow, thresholds.maxFlow)}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip
                    labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="flow"
                    stroke="#0891b2"
                    name="Caudal (m³/h)"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {/* Líneas de umbral */}
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.minFlow}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    name="Min Umbral"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.maxFlow}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    name="Max Umbral"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico de Temperatura */}
          <div className="bg-gray-800 rounded-lg shadow pr-6 py-4 pl-2">
            <h2 className="text-xl font-semibold mb-4 text-white ml-6">Tendencia de la Temperatura</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={getYDomain('temperature', thresholds.minTemperature, thresholds.maxTemperature)}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip
                    labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#dc2626"
                    name="Temperatura (°C)"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {/* Líneas de umbral */}
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.minTemperature}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    name="Min Umbral"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.maxTemperature}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    name="Max Umbral"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}