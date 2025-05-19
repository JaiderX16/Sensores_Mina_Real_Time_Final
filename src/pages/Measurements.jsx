import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Wind, Thermometer, Activity, Map, Filter } from 'lucide-react';

const locations = [
  'Bocamina Nv. 4490',
  'Rampa 4490-2W'
];

// Mapeo de area_id a nombres de ubicación
const areaIdToLocation = {
  1: 'Bocamina Nv. 4490',
  2: 'Rampa 4490-2W'
};

const Measurements = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el filtrado por fechas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredMeasurements, setFilteredMeasurements] = useState([]);

  // Función para cargar los datos de la API
  useEffect(() => {
    const fetchMeasurements = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones');
        if (!response.ok) {
          throw new Error(`Error al obtener datos: ${response.status}`);
        }
        const data = await response.json();
        
        // Transformar los datos para que coincidan con nuestro formato
        const formattedData = data.map(item => {
          const date = new Date(item.timestamp);
          return {
            id: item.id,
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().split(':').slice(0, 2).join(':'),
            location: areaIdToLocation[item.area_id] || `Área ${item.area_id}`,
            allValues: {
              temperature: item.temperature,
              velocity: item.velocity,
              flow: item.flow,
              coverage: item.coverage
            }
          };
        });
        
        setMeasurements(formattedData);
        setFilteredMeasurements(formattedData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar mediciones:', err);
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeasurements();
  }, []);

  // Función para filtrar mediciones por fecha y ubicación
  const filterMeasurements = () => {
    let filtered = [...measurements];
    
    // Filtrar por fecha
    if (startDate || endDate) {
      filtered = filtered.filter(measurement => {
        const measurementDate = measurement.date;
        
        if (startDate && endDate) {
          return measurementDate >= startDate && measurementDate <= endDate;
        } else if (startDate) {
          return measurementDate >= startDate;
        } else if (endDate) {
          return measurementDate <= endDate;
        }
        
        return true;
      });
    }
    
    // Filtrar por ubicación
    if (selectedLocation) {
      filtered = filtered.filter(measurement => 
        measurement.location === selectedLocation
      );
    }
    
    setFilteredMeasurements(filtered);
  };

  // Efecto para aplicar filtros cuando cambian las fechas o la ubicación
  useEffect(() => {
    filterMeasurements();
  }, [startDate, endDate, selectedLocation, measurements]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Mediciones</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Seguimiento y registro de mediciones desde diferentes ubicaciones.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Filter size={18} className="mr-2 text-primary-500" />
          Filtros
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha Inicial</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha Final</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ubicación</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">
            Registro de Mediciones
            {loading ? (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
            ) : (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({filteredMeasurements.length} registros)
              </span>
            )}
          </h3>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Cargando datos de mediciones...
            </div>
          ) : filteredMeasurements.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No se encontraron mediciones para los filtros seleccionados.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Temperatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Velocidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Caudal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredMeasurements.map((measurement) => (
                  <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {measurement.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {measurement.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {measurement.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {measurement.allValues?.temperature} °C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {measurement.allValues?.velocity} m/s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {measurement.allValues?.flow} m³/s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {measurement.allValues?.coverage} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Measurements;