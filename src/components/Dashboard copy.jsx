import React from "react";
import { useState, useEffect } from "react";
import { DigitalClock } from "./DigitalClock";
import SensorChart from "./SensorChart";
import { AlertCircle, RefreshCw, Server, WifiOff } from "lucide-react";
import SensorMetricCard from "./SensorMetricCard";


import AdminPanel from "./AdminPanel";



const API_URL = 'https://magicloops.dev/api/loop/59547e33-7723-4348-8dc8-b0a2f4473763/run?method=GET&path=%2Fsensor-data';

export default function Dashboard() {
  
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // Nuevo estado para tipo de error
  const [lastUpdate, setLastUpdate] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // Contador de reintentos
    
  // Define thresholds for different sensors
  const thresholds = {
    temperature: { min: 20, max: 30 },
    velocity: { min: 10, max: 50 },
    flow: { min: 5, max: 25 }
  };
  
  // Function to check if readings exceed thresholds
  const checkThresholds = (reading) => {
    const alerts = [];
    
    // Check temperature
    if (reading.temperature < thresholds.temperature.min || 
        reading.temperature > thresholds.temperature.max) {
      alerts.push(`Temperatura: ${reading.temperature}°C (fuera del rango ${thresholds.temperature.min}-${thresholds.temperature.max}°C)`);
    }
    
    // Check velocity
    if (reading.velocity < thresholds.velocity.min || 
        reading.velocity > thresholds.velocity.max) {
      alerts.push(`Velocidad: ${reading.velocity}m/s (fuera del rango ${thresholds.velocity.min}-${thresholds.velocity.max}m/s)`);
    }
    
    // Check flow
    if (reading.flow < thresholds.flow.min || 
        reading.flow > thresholds.flow.max) {
      alerts.push(`Flujo: ${reading.flow}m³/h (fuera del rango ${thresholds.flow.min}-${thresholds.flow.max}m³/h)`);
    }
    
    // Log alerts to console
    if (alerts.length > 0) {
      console.warn("Alertas detectadas:", alerts);
    }
    
    return alerts;
  };

  // Función mejorada para manejar los reintentos
  const fetchDataWithRetry = async (retries = 3, delay = 2000) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}?method=GET&path=%2Fsensor-data`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ruta de API no encontrada');
        } else if (response.status >= 500) {
          throw new Error(`Error del servidor: ${response.status}`);
        } else {
          throw new Error(`Error de respuesta: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No se recibieron datos válidos de la API');
      }
      
      // Procesar fechas y asegurar que los valores numéricos sean números
      const processedData = data.map(item => ({
        ...item,
        velocity: parseFloat(item.velocity || 0),
        flow: parseFloat(item.flow || 0),
        temperature: parseFloat(item.temperature || 0),
        timestamp: new Date(item.timestamp).toISOString()
      }));
      
      // Ordenar los datos por timestamp para asegurar que estén en el orden correcto
      const sortedData = [...processedData].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setSensorData(sortedData);
      setLastUpdate(new Date());
      setError(null);
      setErrorType(null);
      setRetryCount(0); // Resetear contador de reintentos cuando hay éxito
      
      // Comprobar los umbrales para generar alertas y establecer el último registro
      if (sortedData.length > 0) {
        const latest = sortedData[sortedData.length - 1];
        setLatestReading(latest);
        checkThresholds(latest);
      }
    }
    catch (error) {
      console.error('Error al obtener los datos:', error);
      
      // Determinar el tipo de error para mostrar el mensaje apropiado
      if (error.message.includes('Failed to fetch') || error.cause?.code === 'ECONNREFUSED') {
        setErrorType('connection');
        setError('Error de conexión. No se pudo conectar a la API.');
      } else if (error.message.includes('Timeout')) {
        setErrorType('timeout');
        setError('La conexión a la API ha excedido el tiempo de espera.');
      } else if (error.message.includes('servidor')) {
        setErrorType('server');
        setError(error.message);
      } else if (error.message.includes('No se recibieron datos')) {
        setErrorType('noData');
        setError('La API no devolvió los datos esperados.');
      } else {
        setErrorType('unknown');
        setError('Ha ocurrido un error inesperado al cargar los datos.');
      }
      
      // Intento de reintento automático si quedan reintentos
      if (retries > 0 && sensorData.length === 0) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchDataWithRetry(retries - 1, delay * 1.5), delay);
      }
    }
    finally {
      setLoading(false);
    }
  };

  // Función para manejar el reintento manual
  const handleManualRetry = () => {
    setRetryCount(0);
    fetchDataWithRetry();
  };
  
  useEffect(() => {
    fetchDataWithRetry();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchDataWithRetry();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Renderizado de componentes de error según el tipo
  const renderErrorMessage = () => {
    const errorIcons = {
      connection: <WifiOff size={48} className="text-red-500 mx-auto mb-4" />,
      timeout: <RefreshCw size={48} className="text-yellow-500 mx-auto mb-4" />,
      server: <Server size={48} className="text-orange-500 mx-auto mb-4" />,
      noData: <AlertCircle size={48} className="text-blue-500 mx-auto mb-4" />,
      unknown: <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
    };
    
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex flex-col justify-center items-center">
        <div className="text-red-500 text-xl mb-4 text-center">
          {errorIcons[errorType] || <AlertCircle size={48} className="mx-auto mb-4" />}
          {error}
        </div>
        
        <div className="text-white text-md max-w-lg text-center mb-6">
          {errorType === 'connection' && "Por favor, verifique su conexión a internet y asegúrese de que el servidor de API esté disponible."}
          {errorType === 'timeout' && "El servidor está tardando demasiado en responder. Puede ser debido a una sobrecarga del servidor o problemas de red."}
          {errorType === 'server' && "El servidor ha encontrado un problema al procesar la solicitud. Por favor, intente nuevamente más tarde."}
          {errorType === 'noData' && "El servidor no proporcionó datos en el formato esperado. Es posible que la API haya cambiado o esté en mantenimiento."}
          {errorType === 'unknown' && "Ha ocurrido un error inesperado. Por favor, intente nuevamente o contacte a soporte técnico."}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={handleManualRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center shadow-lg transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Intentar nuevamente
          </button>
          
          {retryCount > 0 && (
            <div className="text-gray-400 text-sm flex items-center ">
              <p className="text-center">Intentos automáticos: </p> {retryCount}
            </div>
          )}
        </div>
        
        {sensorData.length > 0 && (
          <div className="mt-8 text-amber-400 text-sm text-center">
            Mostrando datos de la última actualización exitosa.
          </div>
        )}
      </div>
    );
  };

  // Componente de carga con animación
  const renderLoading = () => (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col justify-center items-center">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
      </div>
      <div className="text-white text-xl">Cargando datos de sensores...</div>
      <div className="text-gray-400 text-sm mt-2">Conectando a la API de sensores</div>
    </div>
  );

  // Mostrar pantalla de carga solo en carga inicial
  if (loading && sensorData.length === 0) {
    return renderLoading();
  }

  // Mostrar error solo si no hay datos previos
  if (error && sensorData.length === 0) {
    return renderErrorMessage();
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen md:px-8 lg:px-18 2xl:px-1">

      <DigitalClock />
      <AdminPanel />
      
      
      <header className="mb-8 xl:mx-14 2xl:mx-80">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sensor Dashboard</h1>
          
          {/* Indicador de estado de la conexión */}
          <div className="flex items-center">
            {error ? (
              <button 
                onClick={handleManualRetry}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center"
              >
                <WifiOff size={14} className="mr-1" />
                Sin conexión
              </button>
            ) : loading ? (
              <div className="text-sm text-gray-400 flex items-center">
                <RefreshCw size={14} className="mr-1 animate-spin" />
                Actualizando...
              </div>
            ) : (
              <div className="text-sm text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                Conectado
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {lastUpdate && (
            <div className="text-sm text-gray-400">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          
          {/* Botón para actualización manual */}
          <button 
            onClick={handleManualRetry}
            disabled={loading}
            className={`text-sm flex items-center ${loading ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
          >
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>
        
        {/* Banner de error si hay error pero tenemos datos previos */}
        {error && sensorData.length > 0 && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md flex items-start">
            <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-1" />
            <div>
              <div className="text-red-400 font-medium">Error de conexión</div>
              <div className="text-gray-300 text-sm">{error}</div>
              <div className="text-amber-400 text-xs mt-1">Mostrando datos de la última actualización exitosa.</div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 xl:mx-14 2xl:mx-80">
        <SensorMetricCard
          icon="Droplets"
          title="Caudal (m³/h)"
          value={latestReading ? latestReading.flow.toFixed(2) : '—'}
          color="#009578"
          minThreshold={thresholds.flow.min}
          maxThreshold={thresholds.flow.max}
          unit="m³/h"
          isOffline={error !== null}
        />

        <SensorMetricCard
          icon="Wind"
          title="Velocidad (m/s)"
          value={latestReading ? latestReading.velocity.toFixed(2) : '—'}
          color="#3877de"
          minThreshold={thresholds.velocity.min}
          maxThreshold={thresholds.velocity.max}
          unit="m/s"
          isOffline={error !== null}
        />

        <SensorMetricCard
          icon="Thermometer"
          title="Temperatura (°C)"
          value={latestReading ? latestReading.temperature.toFixed(2) : '—'}
          color="#ef4444"
          minThreshold={thresholds.temperature.min}
          maxThreshold={thresholds.temperature.max}
          unit="°C"
          isOffline={error !== null}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8 xl:mx-14 2xl:mx-80">
        <SensorChart
          title="Temperatura"
          data={sensorData}
          dataKey="temperature"
          lineColor="#ef4444"
          name="Temperatura"
          minThreshold={thresholds.temperature.min}
          maxThreshold={thresholds.temperature.max}
          isOffline={error !== null}
        />
        
        <SensorChart
          title="Velocidad"
          data={sensorData}
          dataKey="velocity"
          lineColor="#3b82f6"
          name="Velocidad"
          minThreshold={thresholds.velocity.min}
          maxThreshold={thresholds.velocity.max}
          isOffline={error !== null}
        />
        
        <SensorChart
          title="Flujo"
          data={sensorData}
          dataKey="flow"
          lineColor="#10b981"
          name="Flujo"
          minThreshold={thresholds.flow.min}
          maxThreshold={thresholds.flow.max}
          isOffline={error !== null}
        />
      </div>
    </div>
  );
}