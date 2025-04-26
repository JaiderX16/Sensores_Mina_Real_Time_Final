import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, LogOut, Home, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SensorSettings = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openArea, setOpenArea] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      setLoading(true);
      const [areasRes, sensoresRes] = await Promise.all([
        fetch('https://apisensoresmina-production.up.railway.app/api/areas', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        }),
        fetch('https://apisensoresmina-production.up.railway.app/api/sensores', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        })
      ]);
      
      if (!areasRes.ok || !sensoresRes.ok) {
        throw new Error('Error al cargar los datos');
      }
      
      const [areasData, sensoresData] = await Promise.all([
        areasRes.json(),
        sensoresRes.json()
      ]);
      
      if (!Array.isArray(sensoresData)) {
        throw new Error('Formato de datos inválido');
      }
      
      setAreas(areasData);
      setSensores(sensoresData);
      
      if (areasData.length > 0) {
        setOpenArea(areasData[0].id);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateThresholds = (min, max) => {
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    
    if (isNaN(minVal) || isNaN(maxVal)) {
      throw new Error('Los umbrales deben ser números válidos');
    }
    
    if (minVal >= maxVal) {
      throw new Error('El umbral mínimo debe ser menor que el máximo');
    }
    
    return { umbral_min: minVal, umbral_max: maxVal };
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSensor = async (e, sensorId) => {
    e.preventDefault();
    const form = e.target;
    
    try {
      const data = validateThresholds(
        form.umbral_min.value,
        form.umbral_max.value
      );
      
      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/sensores/${sensorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('Sensor actualizado correctamente');
        loadSensors();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el sensor');
      }
    } catch (err) {
      console.error('Error:', err);
      showNotification(err.message || 'Error al actualizar el sensor', 'error');
    }
  };

  const logout = () => {
    navigate('/login');
  };

  const toggleArea = (areaId) => {
    setOpenArea(openArea === areaId ? null : areaId);
  };

  return (
    <div className="min-h-screen text-gray-100">
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
        // analizar
      )}

      {/* Main Content */}
      <div className="container mx-auto ">
        
        {loading && (
          <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-100 p-4 mb-6 rounded">
            <p className="font-medium">Cargando información de sensores...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          {areas.map((area) => {
            const areaSensors = sensores.filter(s => s.area_id === area.id);
            
            if (areaSensors.length === 0) return null;
            
            const isOpen = openArea === area.id;
            
            return (
              <div key={area.id} className="border border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-800">
                <button 
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-700 transition-colors"
                  onClick={() => toggleArea(area.id)}
                >
                  <h2 className="text-xl font-semibold text-gray-100">{area.nombre_area}</h2>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {isOpen && (
                  <div className="px-6 py-4 border-t border-gray-700">
                    <p className="text-gray-400 mb-6">{area.descripcion || 'Sin descripción'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {areaSensors.map(sensor => (
                        <div key={sensor.id} className="bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500 shadow-sm">
                          
                          

                          <h3 className="text-lg font-semibold text-gray-100 mb-2">{sensor.nombre_sensor}</h3>
                          <p className="text-gray-300 mb-1">Ubicación: {sensor.ubicacion}</p>
                          <p className="text-gray-300 mb-4">Tipo: {sensor.tipo_sensor}</p>
                          
                          <form onSubmit={(e) => updateSensor(e, sensor.id)} className="space-y-4">
                            <div>
                              <label className="block text-gray-300 mb-2 font-medium">Umbral Mínimo</label>
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                step="0.01" 
                                defaultValue={sensor.umbral_min} 
                                name="umbral_min" 
                                required 
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 mb-2 font-medium">Umbral Máximo</label>
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                step="0.01" 
                                defaultValue={sensor.umbral_max} 
                                name="umbral_max" 
                                required 
                              />
                            </div>
                            <button 
                              type="submit" 
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                              Guardar Cambios
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SensorSettings;