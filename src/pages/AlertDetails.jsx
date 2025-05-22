import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, AlertCircle, WifiOff, Clock, Calendar, Info, Gauge, ThermometerSun, Droplets, MapPin } from 'lucide-react';

const AlertDetails = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sensor, setSensor] = useState(null);
  const [sensores, setSensores] = useState([]);

  useEffect(() => {
    // Cargar todos los sensores primero
    fetchAllSensores().then(() => {
      // Recuperar los detalles de la alerta desde localStorage
      const alertData = localStorage.getItem('selectedAlert');
      
      if (alertData) {
        const parsedAlert = JSON.parse(alertData);
        setAlert(parsedAlert);
        
        // Si la alerta tiene un sensor_id, buscar los detalles del sensor
        if (parsedAlert.sensor_id) {
          fetchSensorDetails(parsedAlert.sensor_id);
        }
      } else {
        // Si no hay datos en localStorage, intentar obtener de la API
        fetchAlertDetails(alertId);
      }
      
      setLoading(false);
    });
  }, [alertId]);

  const fetchAllSensores = async () => {
    try {
      const response = await fetch('https://apisensoresmina-production.up.railway.app/api/sensores');
      if (response.ok) {
        const data = await response.json();
        console.log("Sensores cargados:", data); // Para depuración
        setSensores(data);
        return data;
      }
    } catch (error) {
      console.error('Error al obtener sensores:', error);
    }
    return [];
  };

  const getSensorName = (sensorId) => {
    if (!sensorId) return "Sensor no especificado";
    const sensor = sensores.find(s => s.id === parseInt(sensorId));
    return sensor ? sensor.nombre_sensor : `Sensor ${sensorId}`;
  };

  const fetchSensorDetails = async (sensorId) => {
    try {
      console.log("Buscando sensor con ID:", sensorId); // Para depuración
      console.log("Sensores disponibles:", sensores); // Para depuración
      
      // Convertir a número si es string
      const sensorIdNum = parseInt(sensorId);
      
      const sensorData = sensores.find(s => s.id === sensorIdNum);
      console.log("Sensor encontrado:", sensorData); // Para depuración
      
      if (sensorData) {
        setSensor(sensorData);
      } else {
        console.warn(`No se encontró sensor con ID ${sensorId}`);
        
        // Intentar obtener el sensor directamente de la API como respaldo
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/sensores/${sensorId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setSensor(data);
          }
        } catch (error) {
          console.error('Error al obtener sensor individual:', error);
        }
      }
    } catch (error) {
      console.error('Error al obtener detalles del sensor:', error);
    }
  };

  const fetchAlertDetails = async (id) => {
    try {
      // Solo para alertas de la API, no para las generadas localmente
      if (!id.startsWith('threshold-') && !id.startsWith('inactivity-')) {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/alertas/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const alertData = {
            id_alerta: data.id,
            descripcion: data.descripcion,
            nivel_alerta: data.estado === 'activa' ? 'alto' : 'bajo',
            fecha_hora: data.marca_temporal,
            sensor_id: data.sensor_id,
            estado: data.estado,
            tipo: 'api',
            area_id: data.area_id
          };
          
          setAlert(alertData);
          
          // Si la alerta tiene un sensor_id, buscar los detalles del sensor
          if (data.sensor_id) {
            fetchSensorDetails(data.sensor_id);
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener detalles de la alerta:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm:ss');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="bg-red-500/20 text-red-200 p-4 rounded-lg">
        No se encontraron detalles para esta alerta.
      </div>
    );
  }

  // Obtener el nombre del sensor
  const sensorName = sensor?.nombre_sensor || getSensorName(alert.sensor_id);

  // SOLO PARA PRUEBAS - Eliminar en producción
  if (alert.tipo === 'api' && !sensor && alert.sensor_id) {
    const sensorPrueba = {
      id: parseInt(alert.sensor_id),
      nombre_sensor: "Sensor Temperatura BM-11",
      tipo_sensor: "temperatura",
      ubicacion: "Entrada Principal",
      umbral_max: "24.00",
      umbral_min: "-10.00"
    };
    
    if (!sensor) {
      setSensor(sensorPrueba);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-200">Detalles de la Alerta</h1>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          {alert.tipo === 'inactivity' ? (
            <div className="p-3 bg-orange-500/20 rounded-full mr-4">
              <WifiOff size={24} className="text-orange-400" />
            </div>
          ) : (
            <div className={`p-3 ${
              alert.nivel_alerta === 'alto' 
                ? 'bg-red-500/20' 
                : alert.nivel_alerta === 'medio' 
                  ? 'bg-yellow-500/20' 
                  : 'bg-blue-500/20'
            } rounded-full mr-4`}>
              <AlertCircle size={24} className={
                alert.nivel_alerta === 'alto' 
                  ? 'text-red-400' 
                  : alert.nivel_alerta === 'medio' 
                    ? 'text-yellow-400' 
                    : 'text-blue-400'
              } />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{alert.descripcion}</h2>
            <p className={`text-sm ${
              alert.nivel_alerta === 'alto' 
                ? 'text-red-400' 
                : alert.nivel_alerta === 'medio' 
                  ? 'text-yellow-400' 
                  : 'text-blue-400'
            }`}>
              Nivel de alerta: {alert.nivel_alerta.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Información de sensores relacionados */}
        {alert.tipo === 'threshold' && (
          <div className="mb-8 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Gauge size={20} className="mr-2 text-yellow-400" />
              Información del Sensor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <ThermometerSun size={20} className="text-red-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipo de Sensor</p>
                  <p className="text-lg font-medium text-white">
                    {alert.tipoSensor || sensor?.tipo_sensor || "No especificado"}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <Gauge size={20} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Valor Registrado</p>
                  <p className="text-lg font-medium text-white">
                    {alert.valor ? `${alert.valor} ${alert.tipoSensor === 'temperatura' ? '°C' : alert.tipoSensor === 'velocidad' ? 'm/min' : alert.tipoSensor === 'flujo' ? 'm³/h' : ''}` : "No disponible"}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <Droplets size={20} className="text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Umbral</p>
                  <p className="text-lg font-medium text-white">
                    {alert.umbralMin && alert.umbralMax ? `${alert.umbralMin} - ${alert.umbralMax} ${alert.tipoSensor === 'temperatura' ? '°C' : alert.tipoSensor === 'velocidad' ? 'm/min' : alert.tipoSensor === 'flujo' ? 'm³/h' : ''}` : 
                    sensor ? `${sensor.umbral_min} - ${sensor.umbral_max} ${sensor.tipo_sensor === 'temperatura' ? '°C' : sensor.tipo_sensor === 'velocidad' ? 'm/min' : sensor.tipo_sensor === 'caudal' ? 'm³/h' : ''}` : 
                    "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-700 p-4 rounded-lg flex items-center">
            <div className="p-3 bg-gray-600 rounded-full mr-4">
              <Calendar size={20} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Fecha</p>
              <p className="text-lg font-medium text-white">{formatDate(alert.fecha_hora)}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center">
            <div className="p-3 bg-gray-600 rounded-full mr-4">
              <Clock size={20} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Hora</p>
              <p className="text-lg font-medium text-white">{formatTime(alert.fecha_hora)}</p>
            </div>
          </div>

          {alert.tipo === 'api' && (
            <>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <Info size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sensor</p>
                  <p className="text-lg font-medium text-white">{sensorName}</p>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <MapPin size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ubicación</p>
                  <p className="text-lg font-medium text-white">{sensor?.ubicacion || "No especificada"}</p>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <ThermometerSun size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipo de Sensor</p>
                  <p className="text-lg font-medium text-white">{sensor?.tipo_sensor || "No especificado"}</p>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-gray-600 rounded-full mr-4">
                  <Droplets size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Umbrales</p>
                  <p className="text-lg font-medium text-white">
                    {sensor?.umbral_min && sensor?.umbral_max 
                      ? `${sensor.umbral_min} - ${sensor.umbral_max} ${sensor.tipo_sensor === 'temperatura' ? '°C' : sensor.tipo_sensor === 'velocidad' ? 'm/min' : sensor.tipo_sensor === 'caudal' ? 'm³/h' : ''}` 
                      : "No disponibles"}
                  </p>
                </div>
              </div>
            </>
          )}

          {alert.tipo === 'inactivity' && alert.area && (
            <div className="bg-gray-700 p-4 rounded-lg flex items-center">
              <div className="p-3 bg-gray-600 rounded-full mr-4">
                <Info size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Área</p>
                <p className="text-lg font-medium text-white">{alert.area}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;


// Justo antes del return final, agrega:
// SOLO PARA PRUEBAS - Eliminar en producción
if (alert.tipo === 'api' && !sensor && alert.sensor_id) {
  const sensorPrueba = {
    id: parseInt(alert.sensor_id),
    nombre_sensor: "Sensor Temperatura BM-11",
    tipo_sensor: "temperatura",
    ubicacion: "Entrada Principal",
    umbral_max: "24.00",
    umbral_min: "-10.00"
  };
  
  if (!sensor) {
    setSensor(sensorPrueba);
  }
}