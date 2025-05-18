import React, { useState, useEffect } from 'react';
import { DigitalClock } from '../components/DigitalClock';
import SensorMetricCard from '../components/SensorMetricCard';
import SensorActivityMonitor from '../components/SensorActivityMonitor';

const Dashboard = () => {
  const [areas, setAreas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [inactivityAlerts, setInactivityAlerts] = useState([]);
  const [thresholdAlertsArea1, setThresholdAlertsArea1] = useState([]);
  const [thresholdAlertsArea2, setThresholdAlertsArea2] = useState([]);

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

        // Obtener mediciones usando la nueva URL
        const medicionesResponse = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones-tiempo-real', {
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
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Obtener el valor según el tipo de sensor
    // Tomamos el primer elemento después de ordenar, que será el más reciente
    const ultimaMedicion = sortedData[0];
    let valor = 0;
    
    if (tipoSensor === "temperatura") {
      valor = parseFloat(ultimaMedicion.temperature || 0);
    } else if (tipoSensor === "velocidad") {
      valor = parseFloat(ultimaMedicion.velocity || 0);
    } else if (tipoSensor === "flujo") {
      valor = parseFloat(ultimaMedicion.flow || 0);
    } else if (tipoSensor === "cobertura") {
      valor = parseFloat(ultimaMedicion.coverage || 0);
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

  // Función para manejar alertas de inactividad
  const handleInactivityAlert = (area, mensaje) => {
    // Crear nueva alerta
    const newAlert = {
      areaId: area === "Bocamina Nv. 4490" ? 1 : 2,
      area: area,
      mensaje: mensaje,
      timestamp: new Date().toISOString()
    };

    // Añadir a la lista de alertas
    setInactivityAlerts(prevAlerts => {
      // Verificar si ya existe una alerta similar para no duplicar
      const existingAlertIndex = prevAlerts.findIndex(
        alert => alert.areaId === newAlert.areaId && alert.mensaje === newAlert.mensaje
      );

      if (existingAlertIndex >= 0) {
        // Actualizar la alerta existente con la nueva marca de tiempo
        const updatedAlerts = [...prevAlerts];
        updatedAlerts[existingAlertIndex] = {
          ...updatedAlerts[existingAlertIndex],
          timestamp: newAlert.timestamp
        };
        return updatedAlerts;
      } else {
        // Añadir nueva alerta
        return [...prevAlerts, newAlert];
      }
    });
  };

  if (loading && areas.length === 0) {
    return <div className="text-white text-xl p-8">Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-xl p-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/src/img/Osinergmin.png" 
            alt="Logo Osinergmin" 
            className="h-20 object-contain"
          />
        </div>
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

      {/* Monitor de actividad de sensores */}
      <SensorActivityMonitor onInactiveAlert={handleInactivityAlert} areas={areas} />

      {/* Resto del dashboard */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          {/* Área 1 - Usando nombre dinámico desde la base de datos */}
          {areas.filter(area => area.id === 1).map((area, index) => {
            const areaId = area.id;
            const areaNombre = area.nombre_area || "Área 1"; // Nombre dinámico con fallback
            
            // Obtener mediciones y umbrales para cada tipo de sensor
            const velocidadData = getLastMeasurement(areaId, "velocidad");
            const temperaturaData = getLastMeasurement(areaId, "temperatura");
            const flujoData = getLastMeasurement(areaId, "flujo");
            
            const velocidadThresholds = getSensorThresholds(areaId, "velocidad");
            const temperaturaThresholds = getSensorThresholds(areaId, "temperatura");
            const flujoThresholds = getSensorThresholds(areaId, "flujo");
            
            return (
              <div className="mb-8" key={area.id}>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  {areaNombre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SensorMetricCard
                    icon="Wind"
                    title="Velocidad de Aire"
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
                    title="Caudal de Aire"
                    value={flujoData.valor.toFixed(2)}
                    color="#ef4444"
                    minThreshold={flujoThresholds.min.toFixed(2)}
                    maxThreshold={flujoThresholds.max.toFixed(2)}
                    unit="m³/h"
                  />
                </div>
              </div>
            );
          })}
          
          {/* Aquí iría el AlertsList para el área 1 */}
          {/* Necesitamos importar o crear este componente */}
          {/* <AlertsList 
            areaId={1} 
            thresholdAlerts={thresholdAlertsArea1}
            inactivityAlerts={inactivityAlerts.filter(alert => alert.areaId === 1)}
          /> */}
        </div>

        <div>
          {/* Área 2 - Usando nombre dinámico desde la base de datos */}
          {areas.filter(area => area.id === 2).map((area, index) => {
            const areaId = area.id;
            const areaNombre = area.nombre_area || "Área 2"; // Nombre dinámico con fallback
            
            // Obtener mediciones y umbrales para cada tipo de sensor
            const velocidadData = getLastMeasurement(areaId, "velocidad");
            const temperaturaData = getLastMeasurement(areaId, "temperatura");
            const flujoData = getLastMeasurement(areaId, "flujo");
            const coberturaData = getLastMeasurement(areaId, "cobertura");
            
            const velocidadThresholds = getSensorThresholds(areaId, "velocidad");
            const temperaturaThresholds = getSensorThresholds(areaId, "temperatura");
            const flujoThresholds = getSensorThresholds(areaId, "flujo");
            
            return (
              <div className="mb-8" key={area.id}>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  {areaNombre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SensorMetricCard
                    icon="Wind"
                    title="Velocidad de Aire"
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
                    title="Caudal de Aire"
                    value={flujoData.valor.toFixed(2)}
                    color="#ef4444"
                    minThreshold={flujoThresholds.min.toFixed(2)}
                    maxThreshold={flujoThresholds.max.toFixed(2)}
                    unit="m³/h"
                  />
                  <SensorMetricCard
                    icon="Cloud"
                    title="Cobertura"
                    value={coberturaData.valor.toFixed(2)}
                    color="#9333ea"
                    minThreshold={getSensorThresholds(areaId, "cobertura").min.toFixed(2)}
                    maxThreshold={getSensorThresholds(areaId, "cobertura").max.toFixed(2)}
                    unit="%"
                  />
                </div>
              </div>
            );
          })}
          
          {/* Aquí iría el AlertsList para el área 2 */}
          {/* Necesitamos importar o crear este componente */}
          {/* <AlertsList 
            areaId={2} 
            thresholdAlerts={thresholdAlertsArea2}
            inactivityAlerts={inactivityAlerts.filter(alert => alert.areaId === 2)}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
