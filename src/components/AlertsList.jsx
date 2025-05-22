import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { AlertCircle, WifiOff, ExternalLink, Filter, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlertsList = ({ areaId, thresholdAlerts = [], inactivityAlerts = [], filterTimeRange }) => {
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const navigate = useNavigate();
  
  // Usamos useRef para evitar bucles infinitos
  const processedAlertsRef = useRef(false);

  // Efecto para cargar alertas
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = `https://apisensoresmina-production.up.railway.app/api/alertas?area_id=${areaId}`;
        
        console.log('Cargando alertas para área:', areaId);

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
        let alertasFiltradas = data.filter(alerta => {
          // Verificar si el sensor pertenece al área correcta
          // Incluir también el sensor de cobertura (ID 7) para el área 2
          return (alerta.sensor_id >= (areaId * 3 - 2) && alerta.sensor_id <= (areaId * 3)) || 
                 (areaId === 2 && alerta.sensor_id === 7);
        });
        
        console.log(`Alertas cargadas para área ${areaId}: ${alertasFiltradas.length}`);
        setAlertas(alertasFiltradas);
        // Reiniciamos el flag cuando se cargan nuevas alertas
        processedAlertsRef.current = false;
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar alertas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [areaId]);

  // Efecto para aplicar filtros - CORREGIDO para evitar bucle infinito
  useEffect(() => {
    // Si ya procesamos las alertas, no lo hacemos de nuevo
    if (processedAlertsRef.current) {
      return;
    }
    
    // Crear una función para procesar las alertas
    const processAlerts = () => {
      if (!alertas.length && !thresholdAlerts.length && !inactivityAlerts.length) {
        return [];
      }

      console.log('Aplicando filtros:', filterTimeRange ? 'Sí' : 'No');
      
      // Combinar todas las alertas
      let allAlerts = [
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
        ...inactivityAlerts.map((alert, index) => ({
          id_alerta: `inactivity-${index}`,
          descripcion: alert.mensaje,
          nivel_alerta: 'alto',
          fecha_hora: alert.timestamp || new Date().toISOString(),
          tipo: 'inactivity',
          area: alert.area,
          areaId: alert.areaId
        }))
      ];
      
      // Aplicar filtros de tiempo si existen
      if (filterTimeRange) {
        console.log('Filtrando por rango de tiempo:', 
          `${filterTimeRange.start.toLocaleString()} - ${filterTimeRange.end.toLocaleString()}`);
        
        allAlerts = allAlerts.filter(alert => {
          try {
            // Convertir la fecha de la alerta a objeto Date
            const alertDate = new Date(alert.fecha_hora);
            
            // Verificar si la fecha es válida
            if (isNaN(alertDate.getTime())) {
              console.error('Fecha inválida en alerta:', alert.id_alerta, alert.fecha_hora);
              return false;
            }
            
            // Comparar con el rango de fechas del filtro
            const isInTimeRange = alertDate >= filterTimeRange.start && alertDate <= filterTimeRange.end;
            
            // Filtrar por área para alertas de inactividad
            const isInArea = alert.tipo === 'inactivity' 
              ? (alert.areaId === areaId || areaId === 0)
              : true;
            
            return isInTimeRange && isInArea;
          } catch (error) {
            console.error('Error al filtrar alerta:', error);
            return false;
          }
        });
        
        console.log(`Filtrado completado: ${allAlerts.length} alertas cumplen los criterios`);
      }
      
      // Ordenar por fecha, más recientes primero
      allAlerts.sort((a, b) => {
        try {
          return new Date(b.fecha_hora) - new Date(a.fecha_hora);
        } catch (error) {
          return 0;
        }
      });
      
      return allAlerts;
    };

    // Procesar las alertas y actualizar el estado una sola vez
    const processedAlerts = processAlerts();
    setFilteredAlerts(processedAlerts);
    
    // Marcamos que ya procesamos las alertas para evitar bucles
    processedAlertsRef.current = true;
    
  }, [alertas, thresholdAlerts, inactivityAlerts, filterTimeRange, areaId]);

  // Resto del componente sin cambios
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (loading) {
    return <div className="text-gray-400 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      Cargando alertas...
    </div>;
  }

  const handleAlertClick = (alert) => {
    localStorage.setItem('selectedAlert', JSON.stringify(alert));
    navigate(`/dashboard/alert-details/${alert.id_alerta}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Alertas Recientes</h2>
        
        {filterTimeRange && (
          <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
            <Filter size={14} />
            <span>Filtros aplicados</span>
          </div>
        )}
      </div>
      
      {/* Panel de información de filtros activos */}
      {filterTimeRange && (
        <div className="bg-gray-700/50 p-3 rounded-lg mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Calendar size={14} className="text-blue-400" />
            <span>Desde: {filterTimeRange.start.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Calendar size={14} className="text-blue-400" />
            <span>Hasta: {filterTimeRange.end.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Clock size={14} className="text-blue-400" />
            <span>Hora inicio: {filterTimeRange.start.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Clock size={14} className="text-blue-400" />
            <span>Hora fin: {filterTimeRange.end.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow divide-y divide-gray-700">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
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
              } cursor-pointer hover:bg-gray-700 transition-colors`}
              onClick={() => handleAlertClick(alert)}
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
                <span className="text-sm text-gray-400">
                  Fecha: {new Date(alert.fecha_hora).toLocaleDateString()} {new Date(alert.fecha_hora).toLocaleTimeString()}
                </span>
              </div>
              <span className="ml-auto text-sm text-gray-400">
                {format(new Date(alert.fecha_hora), 'HH:mm:ss')}
              </span>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
          ))
        ) : (
          <div className="p-4 text-green-400 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span>
              {filterTimeRange 
                ? "No hay alertas que coincidan con los filtros seleccionados." 
                : "Todos los sistemas funcionan dentro de parámetros normales."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsList;
