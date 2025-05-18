import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, WifiOff } from 'lucide-react';

const AlertsList = ({ areaId, thresholdAlerts = [], inactivityAlerts = [] }) => {
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = `https://apisensoresmina-production.up.railway.app/api/alertas?area_id=${areaId}`;
        
        console.log('Fetching alertas para área:', areaId);
        console.log('URL de la petición:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las alertas');
        }

        const data = await response.json();
        // Filtrar las alertas por área_id
        const alertasFiltradas = data.filter(alerta => {
          // Verificar si el sensor pertenece al área correcta
          // Incluir también el sensor de cobertura (ID 7) para el área 2
          return (alerta.sensor_id >= (areaId * 3 - 2) && alerta.sensor_id <= (areaId * 3)) || 
                 (areaId === 2 && alerta.sensor_id === 7);
        });
        
        console.log('Alertas filtradas para área', areaId, ':', alertasFiltradas);
        setAlertas(alertasFiltradas);

      } catch (err) {
        setError(err.message);
        console.error('Error al cargar alertas:', err);
      }
    };

    fetchAlertas();
  }, [areaId]);

  // Combinar alertas de la API con alertas de umbral y alertas de inactividad
  const formattedAlerts = [
    ...alertas.map(alerta => ({
      id_alerta: alerta.id,
      descripcion: alerta.descripcion,
      nivel_alerta: alerta.estado === 'activa' ? 'alto' : 'bajo',
      fecha_hora: alerta.marca_temporal,
      sensor_id: alerta.sensor_id,
      estado: alerta.estado,
      tipo: 'api'
    })),
    ...thresholdAlerts.map((alert, index) => ({
      id_alerta: `threshold-${index}`,
      descripcion: alert,
      nivel_alerta: 'alto',
      fecha_hora: new Date().toISOString(),
      tipo: 'threshold'
    })),
    ...inactivityAlerts
      .filter(alert => alert.areaId === areaId || areaId === 0) // Filtrar por área o mostrar todas si areaId es 0
      .map((alert, index) => ({
        id_alerta: `inactivity-${index}`,
        descripcion: alert.mensaje,
        nivel_alerta: 'alto',
        fecha_hora: alert.timestamp || new Date().toISOString(),
        tipo: 'inactivity',
        area: alert.area
      }))
  ].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)); // Ordenar por fecha, más recientes primero

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Alertas Recientes</h2>
      <div className="bg-gray-800 rounded-lg shadow divide-y divide-gray-700">
        {formattedAlerts.length > 0 ? (
          formattedAlerts.map(alert => (
            <div
              key={alert.id_alerta}
              className={`p-4 flex items-center gap-3 ${
                alert.tipo === 'inactivity' 
                  ? 'text-orange-400'
                  : typeof alert.id_alerta === 'string' && alert.id_alerta.startsWith('threshold-')
                    ? 'text-red-400'
                    : alert.nivel_alerta === 'alto'
                      ? 'text-red-400'
                      : alert.nivel_alerta === 'medio'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
              }`}
            >
              {alert.tipo === 'inactivity' ? (
                <WifiOff size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <div className="flex flex-col">
                <span className="font-medium">{alert.descripcion}</span>
                {alert.tipo === 'inactivity' && (
                  <span className="text-sm text-gray-400">
                    Área: {alert.area}
                  </span>
                )}
                {alert.tipo === 'api' && (
                  <>
                    <span className="text-sm text-gray-400">
                      Sensor ID: {alert.sensor_id}
                    </span>
                    <span className="text-sm text-gray-400">
                      Estado: {alert.estado}
                    </span>
                  </>
                )}
              </div>
              <span className="ml-auto text-sm text-gray-400">
                {format(new Date(alert.fecha_hora), 'HH:mm:ss')}
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
  );
};

export default AlertsList;
