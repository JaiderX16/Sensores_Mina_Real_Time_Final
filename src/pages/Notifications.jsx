import React, { useState, useEffect } from 'react';
import AlertsList from '../components/AlertsList';
import { Calendar, Clock, Filter } from 'lucide-react';

const Notifications = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArea, setSelectedArea] = useState('all');
  // Estados para filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // Cargar áreas desde la API
    const fetchAreas = async () => {
      try {
        const response = await fetch('https://apisensoresmina-production.up.railway.app/api/areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('Error al cargar las áreas');
        }

        const areasData = await response.json();
        setAreas(areasData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  // Calcular el rango de tiempo para el filtro
  const getFilterTimeRange = () => {
    if (!startDate && !endDate && !startTime && !endTime) {
      return null;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Fecha de inicio (usa hoy si no se especifica)
    const start = new Date(startDate || today);
    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      start.setHours(0, 0, 0, 0);
    }
    
    // Fecha de fin (usa hoy si no se especifica)
    const end = new Date(endDate || today);
    if (endTime) {
      const [hours, minutes] = endTime.split(':');
      end.setHours(parseInt(hours), parseInt(minutes), 59, 999);
    } else {
      end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  };

  const filterTimeRange = getFilterTimeRange();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Notificaciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Administra las notificaciones del sistema.</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 animate-fade-in">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center">
            <Filter size={20} className="mr-2 text-blue-400" />
            Filtros
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha Inicial */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Fecha Inicial</label>
              <div className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                  <Calendar size={20} className="absolute left-3 text-gray-400" />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent border-none pl-10 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    placeholder="dd/mm/aaaa"
                  />
                  <button 
                    className="absolute right-2 p-1 text-gray-400 hover:text-white"
                    onClick={() => setStartDate('')}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Fecha Final */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Fecha Final</label>
              <div className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                  <Calendar size={20} className="absolute left-3 text-gray-400" />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent border-none pl-10 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    placeholder="dd/mm/aaaa"
                  />
                  <button 
                    className="absolute right-2 p-1 text-gray-400 hover:text-white"
                    onClick={() => setEndDate('')}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hora Inicial */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Hora Inicial</label>
              <div className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                  <Clock size={20} className="absolute left-3 text-gray-400" />
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-transparent border-none pl-10 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    placeholder="--:--"
                  />
                  <button 
                    className="absolute right-2 p-1 text-gray-400 hover:text-white"
                    onClick={() => setStartTime('')}
                  >
                    <Clock size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hora Final */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Hora Final</label>
              <div className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                  <Clock size={20} className="absolute left-3 text-gray-400" />
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-transparent border-none pl-10 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    placeholder="--:--"
                  />
                  <button 
                    className="absolute right-2 p-1 text-gray-400 hover:text-white"
                    onClick={() => setEndTime('')}
                  >
                    <Clock size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filtro de Área */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-2 text-sm">Área</label>
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-gray-700 border-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <option value="all">Todas las áreas</option>
                  <option value="rampa">Rampa</option>
                  <option value="bocamina">Bocamina</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end mt-6 gap-3">
            <button 
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setStartTime('');
                setEndTime('');
                setSelectedArea('all');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
            <button 
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-gray-500 dark:text-white">Cargando áreas...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          areas
            .filter(area => selectedArea === 'all' || 
              (selectedArea === 'rampa' && area.nombre_area.toLowerCase().includes('rampa')) ||
              (selectedArea === 'bocamina' && area.nombre_area.toLowerCase().includes('bocamina')))
            .map((area, index) => (
              <div key={area.id}>
                <h1 className="text-gray-800 dark:text-white font-bold text-xl mb-6 flex items-center">
                  <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-2 h-8 mr-3 rounded`}></span>
                  {area.nombre_area}
                </h1>
                <AlertsList areaId={area.id} filterTimeRange={filterTimeRange} />
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Notifications;