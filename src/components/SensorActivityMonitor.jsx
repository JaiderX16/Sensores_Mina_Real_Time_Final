import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Clock, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

// Constantes
const INACTIVITY_THRESHOLD = 20 * 60 * 1000; // 20 minutos en ms
const FETCH_INTERVAL = 5000; // 5 segundos
const CHECK_INTERVAL = 5000; // 5 segundos
const API_ENDPOINT = 'https://apisensoresmina-production.up.railway.app/api/mediciones';
const EMAIL_NOTIFICATION_ENDPOINT = 'jaiderpj16@gmail.com';

// Función para enviar notificación por email
const sendEmailNotification = async (areaName, sensorType, sensorValue) => {
  try {
    const emailData = {
      to_email: EMAIL_NOTIFICATION_ENDPOINT,
      subject: `🚨 Alerta de Sensor - ${areaName}`,
      area_name: areaName,
      sensor_type: sensorType.charAt(0).toUpperCase() + sensorType.slice(1),
      sensor_value: sensorValue,
      timestamp: new Date().toLocaleString('es-ES', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      message: `Se ha detectado una posible falla en el sensor de ${sensorType} en el área "${areaName}". El sensor reporta un valor de ${sensorValue}, lo que indica una posible falla del equipo. Se requiere revisión inmediata.`
    };
    
    console.log('🔔 Enviando notificación por email:', emailData);
    
    // Implementación usando EmailJS (requiere configuración previa)
    // Para usar EmailJS, necesitarías:
    // 1. Instalar: npm install @emailjs/browser
    // 2. Configurar una cuenta en EmailJS
    // 3. Descomentar el código siguiente:
    
    /*
    import emailjs from '@emailjs/browser';
    
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',     // ID del servicio de EmailJS
      'YOUR_TEMPLATE_ID',    // ID de la plantilla de email
      emailData,
      'YOUR_PUBLIC_KEY'      // Clave pública de EmailJS
    );
    
    console.log('✅ Email enviado exitosamente:', result.text);
    */
    
    // Alternativa: Envío a través de un endpoint personalizado
    // Si tienes un backend que maneje el envío de emails:
    /*
    const response = await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(emailData)
    });
    
    if (response.ok) {
      console.log('✅ Notificación enviada exitosamente');
    } else {
      throw new Error('Error al enviar la notificación');
    }
    */
    
    // Por ahora, solo registramos la notificación en consola
    console.log('📧 Notificación preparada para envío a:', EMAIL_NOTIFICATION_ENDPOINT);
    
  } catch (error) {
    console.error('❌ Error al enviar notificación por email:', error);
  }
};

// Configuración inicial de áreas
const initialSensorState = {
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
};

const SensorActivityMonitor = ({ onInactiveAlert, areas }) => {
  // Estados
  const [sensorData, setSensorData] = useState(initialSensorState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Nombres de áreas
  const areaNames = useMemo(() => ({
    area1: areas?.find(a => a.id === 1)?.nombre_area || "Bocamina Nv. 4490",
    area2: areas?.find(a => a.id === 2)?.nombre_area || "Rampa 4490-2W"
  }), [areas]);

  // Comprobar si existe alguna condición de alarma
  const hasAlarmCondition = useCallback(() => {
    return Object.values(sensorData).some(
      area => area.isInactive || !area.isAreaActive
    );
  }, [sensorData]);

  // Función para manejar alertas
  const triggerAlert = useCallback((areaKey, message) => {
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
      Object.keys(prevData).forEach(areaKey => {
        const area = prevData[areaKey];
        if (!area.lastUpdate) return;
        
        const timeSinceUpdate = now - new Date(area.lastUpdate).getTime();
        const isNowInactive = timeSinceUpdate > INACTIVITY_THRESHOLD;
        
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

  // Obtener datos de sensores
  const fetchSensorData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(API_ENDPOINT);
      
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
          
          const sensorValues = {
            velocidad: parseFloat(latestData.velocity),
            temperatura: parseFloat(latestData.temperature),
            flujo: parseFloat(latestData.flow),
            ...(areaId === 2 ? { cobertura: parseFloat(latestData.coverage) } : {})
          };
          
          // Nuevo estado de sensores
          const sensors = {};
          let allSensorsActive = true;
          
          // Procesar cada sensor con nueva lógica
          Object.entries(sensorValues).forEach(([key, value]) => {
            // Para temperatura, cualquier valor es válido (positivo, negativo o cero)
            // Para otros sensores, valor cero indica falla
            const isActive = key === 'temperatura' ? true : value !== 0;
            sensors[key] = { value, isActive };
            
            if (!isActive) allSensorsActive = false;
          });
          
          newData[areaKey] = {
            lastUpdate: latestData.timestamp,
            isInactive: prevData[areaKey].isInactive, // Se mantiene, se actualiza en checkLastActivity
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

  // Efecto para manejar alertas - Usando una referencia para evitar llamadas infinitas
  const prevSensorDataRef = useRef();
  
  useEffect(() => {
    // Compara si los datos han cambiado realmente para evitar alertas repetidas
    const prevData = prevSensorDataRef.current;
    if (!prevData) {
      prevSensorDataRef.current = sensorData;
      return;
    }
    
    // Verificar inactividad solo cuando cambian los valores relevantes
    Object.entries(sensorData).forEach(([areaKey, area]) => {
      const prevArea = prevData[areaKey];
      
      // Alerta para áreas inactivas - solo si el estado cambió
      if (area.isInactive && !prevArea.isInactive) {
        triggerAlert(
          areaKey,
          "Estado de Operatividad de Equipos de Comunicación: Sin datos por más de 20 minutos"
        );
      }
      
      // Alerta para sensores con valor cero - solo para sensores no de temperatura
      Object.entries(area.sensors).forEach(([sensorKey, sensor]) => {
        const prevSensor = prevArea.sensors[sensorKey];
        // Solo alertar si no es temperatura y el valor cambió a 0
        if (sensorKey !== 'temperatura' && sensor.value === 0 && (prevSensor.value !== 0 && prevSensor.value !== null)) {
          const alertMessage = `Sensor de ${sensorKey.charAt(0).toUpperCase() + sensorKey.slice(1)} inactivo: Valor 0 detectado`;
          triggerAlert(areaKey, alertMessage);
          // Enviar notificación por email
          sendEmailNotification(areaNames[areaKey], sensorKey, sensor.value);
        }
      });
    });
    
    prevSensorDataRef.current = sensorData;
  }, [sensorData, triggerAlert]);

  // Configurar intervalos para obtener datos y verificar actividad
  useEffect(() => {    
    // Cargar datos iniciales
    fetchSensorData();
    
    // Verificar inactividad después de cargar datos
    const initialCheckTimeout = setTimeout(checkLastActivity, 1000);
    
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

  // Componente para renderizar un sensor individual
  const SensorItem = ({ name, sensor }) => (
    <div className={`rounded p-2 flex justify-between items-center border ${
      sensor.isActive 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-red-900/30 border-red-700'
    }`}>
      <span className="text-gray-300">{name}</span>
      <div className="flex items-center">
        {sensor.value !== null ? (
          <span className={`text-sm font-medium ${
            sensor.isActive 
              ? 'text-white' 
              : 'text-red-400'
          }`}>
            {sensor.value !== null ? sensor.value.toFixed(2) : "--"}
          </span>
        ) : (
          <span className="text-sm text-gray-400">--</span>
        )}
        {sensor.isActive ? (
          <CheckCircle size={16} className="ml-2 text-green-400" />
        ) : (
          <AlertTriangle size={16} className="ml-2 text-red-400" />
        )}
      </div>
    </div>
  );

  // Componente para renderizar un área completa
  const AreaCard = ({ areaKey, data, areaName }) => (
    <div className={`rounded-lg p-4 border ${
      data.isInactive 
        ? 'bg-red-900/30 border-red-700' 
        : !data.isAreaActive 
          ? 'bg-orange-900/30 border-orange-700' 
          : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-white">{areaName}</h3>
        <div className={`flex items-center ${
          data.isInactive 
            ? 'text-red-400' 
            : !data.isAreaActive 
              ? 'text-orange-400' 
              : 'text-green-400'
        }`}>
          {data.isInactive ? (
            <>
              <WifiOff size={16} className="mr-1" />
              <span className="text-sm">Inactivo</span>
            </>
          ) : !data.isAreaActive ? (
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
        {Object.entries(data.sensors).map(([key, sensor]) => (
          <SensorItem 
            key={key} 
            name={key.charAt(0).toUpperCase() + key.slice(1)} 
            sensor={sensor} 
          />
        ))}
      </div>
      
      {data.lastUpdate && (
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <Clock size={12} className="mr-1" />
          <span>Última actualización: {formatTimeSince(data.lastUpdate)}</span>
        </div>
      )}
    </div>
  );

  // Renderizar componente principal
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Estado de Operatividad de Equipos</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AreaCard 
          areaKey="area1" 
          data={sensorData.area1} 
          areaName={areaNames.area1} 
        />
        <AreaCard 
          areaKey="area2" 
          data={sensorData.area2} 
          areaName={areaNames.area2} 
        />
      </div>
    </div>
  );
};

export default SensorActivityMonitor;