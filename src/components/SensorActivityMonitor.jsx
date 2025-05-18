import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

// Constantes
const INACTIVITY_THRESHOLD = 20 * 60 * 1000; // 20 minutos en ms
const FETCH_INTERVAL = 5000; // 5 segundos
const CHECK_INTERVAL = 5000; // 5 segundos

const SensorActivityMonitor = ({ onInactiveAlert, areas }) => {
  // Estados
  const [sensorData, setSensorData] = useState({
    area1: {
      lastUpdate: null,
      isInactive: false,
      isAreaActive: true,
      sensors: {
        velocidad: { value: null, isActive: true },
        temperatura: { value: null, isActive: true },
        flujo: { value: null, isActive: true }
      }
    },
    area2: {
      lastUpdate: null,
      isInactive: false,
      isAreaActive: true,
      sensors: {
        velocidad: { value: null, isActive: true },
        temperatura: { value: null, isActive: true },
        flujo: { value: null, isActive: true },
        cobertura: { value: null, isActive: true }
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Referencias
  const apiEndpoint = 'https://apisensoresmina-production.up.railway.app/api/mediciones';
  
  // Nombres de áreas
  const areaNames = useMemo(() => ({
    area1: areas?.find(a => a.id === 1)?.nombre_area || "Bocamina Nv. 4490",
    area2: areas?.find(a => a.id === 2)?.nombre_area || "Rampa 4490-2W"
  }), [areas]);

  // Comprobar si existe alguna condición de alarma
  const hasAlarmCondition = useCallback(() => {
    const { area1, area2 } = sensorData;
    
    // Verificar inactividad
    if (area1.isInactive || area2.isInactive) {
      return true;
    }
    
    // Verificar áreas activas
    if (!area1.isAreaActive || !area2.isAreaActive) {
      return true;
    }
    
    return false;
  }, [sensorData]);

  // Función segura para manejar alertas
  const triggerAlert = useCallback((areaKey, message) => {
    // Llamar al callback de alerta de forma segura
    if (onInactiveAlert) {
      onInactiveAlert(areaNames[areaKey], message);
    }
  }, [areaNames, onInactiveAlert]);

  // Verificar última actividad
  const checkLastActivity = useCallback(() => {
    const now = new Date().getTime();
    
    setSensorData(prevData => {
      const updatedData = { ...prevData };
      let hasChanges = false;
      
      // Comprobar cada área
      ['area1', 'area2'].forEach(areaKey => {
        const area = prevData[areaKey];
        if (!area.lastUpdate) return;
        
        const timeSinceUpdate = now - new Date(area.lastUpdate).getTime();
        const isNowInactive = timeSinceUpdate > INACTIVITY_THRESHOLD;
        
        // Si hay cambio de estado (de activo a inactivo) o si ya está inactivo pero no se ha marcado
        if (isNowInactive !== area.isInactive) {
          updatedData[areaKey] = {
            ...area,
            isInactive: isNowInactive
          };
          hasChanges = true;
        }
      });
      
      return hasChanges ? updatedData : prevData;
    });
  }, []);

  // Efecto para manejar alertas de inactividad
  useEffect(() => {
    // Verificar inactividad y disparar alertas si es necesario
    ['area1', 'area2'].forEach(areaKey => {
      const area = sensorData[areaKey];
      if (area.isInactive) {
        triggerAlert(
          areaKey,
          "Estado de Operatividad de Equipos de Comunicación: Sin datos por más de 20 minutos"
        );
      }
    });
  }, [sensorData, triggerAlert]);

  // Obtener datos de sensores
  const fetchSensorData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn('No se recibieron datos de la API');
        setError('No se recibieron datos de mediciones');
        return;
      }
      
      // Ordenar datos por timestamp (más recientes primero)
      const sortedData = [...data].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // Obtener datos más recientes por área
      const latestByArea = {
        1: sortedData.find(item => item.area_id === 1),
        2: sortedData.find(item => item.area_id === 2)
      };
      
      setSensorData(prevData => {
        const newData = { ...prevData };
        
        // Procesar datos para cada área
        [1, 2].forEach(areaId => {
          const areaKey = `area${areaId}`;
          const latestData = latestByArea[areaId];
          
          if (!latestData) return;
          
          const prevAreaData = prevData[areaKey];
          const sensorValues = {
            velocidad: parseFloat(latestData.velocity),
            temperatura: parseFloat(latestData.temperature),
            flujo: parseFloat(latestData.flow),
            ...(areaId === 2 ? { cobertura: parseFloat(latestData.coverage) } : {})
          };
          
          // Nuevo estado de sensores
          const sensors = {};
          let allSensorsActive = true;
          
          // Procesar cada sensor
          Object.entries(sensorValues).forEach(([key, value]) => {
            const isActive = value > 0;
            sensors[key] = { value, isActive };
            
            if (!isActive) allSensorsActive = false;
          });
          
          newData[areaKey] = {
            lastUpdate: latestData.timestamp,
            isInactive: prevAreaData.isInactive, // Se actualiza en checkLastActivity
            isAreaActive: allSensorsActive,
            sensors
          };
        });
        
        return newData;
      });
      
      setError(null);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para detectar sensores con valor cero y disparar alertas
  useEffect(() => {
    // Verificar cada área y sensor
    ['area1', 'area2'].forEach(areaKey => {
      const area = sensorData[areaKey];
      
      Object.entries(area.sensors).forEach(([sensorKey, sensor]) => {
        if (sensor.value === 0) {
          triggerAlert(
            areaKey,
            `Sensor de ${sensorKey.charAt(0).toUpperCase() + sensorKey.slice(1)} inactivo: Valor 0 detectado`
          );
        }
      });
    });
  }, [sensorData, triggerAlert]);

  // Formateo de tiempo desde la última actualización
  const formatTimeSince = useCallback((timestamp) => {
    if (!timestamp) return 'Sin datos';
    
    const now = new Date().getTime();
    const lastUpdate = new Date(timestamp).getTime();
    const diffMs = now - lastUpdate;
    const minutes = Math.floor(diffMs / 60000);
    
    if (minutes < 1) return 'Hace menos de un minuto';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Hace 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hace 1 día';
    return `Hace ${days} días`;
  }, []);

  // Configurar intervalos para obtener datos y verificar actividad
  useEffect(() => {    
    // Cargar datos iniciales
    fetchSensorData();
    
    // Verificar inactividad después de cargar datos
    const initialCheckTimeout = setTimeout(() => {
      checkLastActivity();
    }, 1000);
    
    // Configurar intervalos
    const fetchInterval = setInterval(fetchSensorData, FETCH_INTERVAL);
    const checkInterval = setInterval(checkLastActivity, CHECK_INTERVAL);
    
    // Limpiar intervalos al desmontar
    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(fetchInterval);
      clearInterval(checkInterval);
    };
  }, [fetchSensorData, checkLastActivity]);

  // Renderizar componente
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Estado de Operatividad de Equipos</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Área 1 */}
        <div className={`rounded-lg p-4 border ${
          sensorData.area1.isInactive 
            ? 'bg-red-900/30 border-red-700' 
            : !sensorData.area1.isAreaActive 
              ? 'bg-orange-900/30 border-orange-700' 
              : 'bg-gray-800 border-gray-700'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-white">{areaNames.area1}</h3>
            <div className={`flex items-center ${
              sensorData.area1.isInactive 
                ? 'text-red-400' 
                : !sensorData.area1.isAreaActive 
                  ? 'text-orange-400' 
                  : 'text-green-400'
            }`}>
              {sensorData.area1.isInactive ? (
                <>
                  <WifiOff size={16} className="mr-1" />
                  <span className="text-sm">Inactivo</span>
                </>
              ) : !sensorData.area1.isAreaActive ? (
                <>
                  <AlertTriangle size={16} className="mr-1" />
                  <span className="text-sm">Error en sensores</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-sm">Activo</span>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area1.sensors.velocidad.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Velocidad</span>
              <div className="flex items-center">
                {sensorData.area1.sensors.velocidad.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area1.sensors.velocidad.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area1.sensors.velocidad.value ? sensorData.area1.sensors.velocidad.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area1.sensors.velocidad.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
            
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area1.sensors.temperatura.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Temperatura</span>
              <div className="flex items-center">
                {sensorData.area1.sensors.temperatura.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area1.sensors.temperatura.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area1.sensors.temperatura.value ? sensorData.area1.sensors.temperatura.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area1.sensors.temperatura.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
            
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area1.sensors.flujo.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Flujo</span>
              <div className="flex items-center">
                {sensorData.area1.sensors.flujo.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area1.sensors.flujo.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area1.sensors.flujo.value ? sensorData.area1.sensors.flujo.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area1.sensors.flujo.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
          </div>
          
          {sensorData.area1.lastUpdate && (
            <div className="mt-3 flex items-center text-xs text-gray-400">
              <Clock size={12} className="mr-1" />
              <span>Última actualización: {formatTimeSince(sensorData.area1.lastUpdate)}</span>
            </div>
          )}
        </div>
        
        {/* Área 2 */}
        <div className={`rounded-lg p-4 border ${
          sensorData.area2.isInactive 
            ? 'bg-red-900/30 border-red-700' 
            : !sensorData.area2.isAreaActive 
              ? 'bg-orange-900/30 border-orange-700' 
              : 'bg-gray-800 border-gray-700'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-white">{areaNames.area2}</h3>
            <div className={`flex items-center ${
              sensorData.area2.isInactive 
                ? 'text-red-400' 
                : !sensorData.area2.isAreaActive 
                  ? 'text-orange-400' 
                  : 'text-green-400'
            }`}>
              {sensorData.area2.isInactive ? (
                <>
                  <WifiOff size={16} className="mr-1" />
                  <span className="text-sm">Inactivo</span>
                </>
              ) : !sensorData.area2.isAreaActive ? (
                <>
                  <AlertTriangle size={16} className="mr-1" />
                  <span className="text-sm">Error en sensores</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-sm">Activo</span>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area2.sensors.velocidad.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Velocidad</span>
              <div className="flex items-center">
                {sensorData.area2.sensors.velocidad.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area2.sensors.velocidad.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area2.sensors.velocidad.value ? sensorData.area2.sensors.velocidad.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area2.sensors.velocidad.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
            
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area2.sensors.temperatura.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Temperatura</span>
              <div className="flex items-center">
                {sensorData.area2.sensors.temperatura.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area2.sensors.temperatura.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area2.sensors.temperatura.value ? sensorData.area2.sensors.temperatura.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area2.sensors.temperatura.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
            
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area2.sensors.flujo.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Flujo</span>
              <div className="flex items-center">
                {sensorData.area2.sensors.flujo.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area2.sensors.flujo.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area2.sensors.flujo.value ? sensorData.area2.sensors.flujo.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area2.sensors.flujo.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
            
            <div className={`rounded p-2 flex justify-between items-center border ${
              sensorData.area2.sensors.cobertura.isActive 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <span className="text-gray-300">Cobertura</span>
              <div className="flex items-center">
                {sensorData.area2.sensors.cobertura.value !== null ? (
                  <span className={`text-sm font-medium ${
                    sensorData.area2.sensors.cobertura.isActive 
                      ? 'text-white' 
                      : 'text-red-400'
                  }`}>
                    {sensorData.area2.sensors.cobertura.value ? sensorData.area2.sensors.cobertura.value.toFixed(2) : "0.00"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                {sensorData.area2.sensors.cobertura.isActive ? (
                  <CheckCircle size={16} className="ml-2 text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="ml-2 text-red-400" />
                )}
              </div>
            </div>
          </div>
          
          {sensorData.area2.lastUpdate && (
            <div className="mt-3 flex items-center text-xs text-gray-400">
              <Clock size={12} className="mr-1" />
              <span>Última actualización: {formatTimeSince(sensorData.area2.lastUpdate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorActivityMonitor;