import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, LogOut, Home, Settings, Users, Edit, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SensorSettings = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openArea, setOpenArea] = useState(null);
  const [notification, setNotification] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);
  const [areaForm, setAreaForm] = useState({
    nombre_area: '',
    descripcion: ''
  });
  const [sensorForm, setSensorForm] = useState({
    nombre_sensor: '',
    ubicacion: '',
    tipo_sensor: '',
    umbral_min: '',
    umbral_max: ''
  });

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

  const startEditingArea = (area) => {
    setEditingArea(area.id);
    setAreaForm({
      nombre_area: area.nombre_area,
      descripcion: area.descripcion || ''
    });
  };

  const cancelEditingArea = () => {
    setEditingArea(null);
  };

  const handleAreaFormChange = (e) => {
    const { name, value } = e.target;
    setAreaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateArea = async (areaId) => {
    try {
      if (!areaForm.nombre_area.trim()) {
        throw new Error('El nombre del área no puede estar vacío');
      }

      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/areas/${areaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(areaForm)
      });
      
      if (response.ok) {
        showNotification('Área actualizada correctamente');
        loadSensors();
        setEditingArea(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el área');
      }
    } catch (err) {
      console.error('Error:', err);
      showNotification(err.message || 'Error al actualizar el área', 'error');
    }
  };

  // Nuevas funciones para editar sensores
  const startEditingSensor = (sensor) => {
    setEditingSensor(sensor.id);
    setSensorForm({
      nombre_sensor: sensor.nombre_sensor,
      ubicacion: sensor.ubicacion,
      tipo_sensor: sensor.tipo_sensor,
      umbral_min: sensor.umbral_min,
      umbral_max: sensor.umbral_max
    });
  };

  const cancelEditingSensor = () => {
    setEditingSensor(null);
  };

  const handleSensorFormChange = (e) => {
    const { name, value } = e.target;
    setSensorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateSensorComplete = async (sensorId) => {
    try {
      if (!sensorForm.nombre_sensor.trim()) {
        throw new Error('El nombre del sensor no puede estar vacío');
      }

      if (!sensorForm.ubicacion.trim()) {
        throw new Error('La ubicación del sensor no puede estar vacía');
      }

      if (!sensorForm.tipo_sensor.trim()) {
        throw new Error('El tipo de sensor no puede estar vacío');
      }

      // Validar umbrales
      const { umbral_min, umbral_max } = validateThresholds(
        sensorForm.umbral_min,
        sensorForm.umbral_max
      );

      const dataToSend = {
        ...sensorForm,
        umbral_min,
        umbral_max
      };

      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/sensores/${sensorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
        showNotification('Sensor actualizado correctamente');
        loadSensors();
        setEditingSensor(null);
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
        <div className={`fixed bottom-4 right-8 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-bold`}>
          {notification.message}
        </div>
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
            const isOpen = openArea === area.id;
            const isEditing = editingArea === area.id;
            
            return (
              <div key={area.id} className="border border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-800">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-700 transition-colors">
                  {isEditing ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Nombre del Área</label>
                        <div className="text-sm text-gray-400 mb-1">Nombre actual: {area.nombre_area}</div>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                          name="nombre_area" 
                          value={areaForm.nombre_area}
                          onChange={handleAreaFormChange}
                          placeholder="Nuevo nombre del área"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Descripción</label>
                        <div className="text-sm text-gray-400 mb-1">Descripción actual: {area.descripcion || 'Sin descripción'}</div>
                        <textarea 
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                          name="descripcion" 
                          value={areaForm.descripcion}
                          onChange={handleAreaFormChange}
                          placeholder="Nueva descripción"
                          rows="2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateArea(area.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center gap-1"
                        >
                          <Check size={16} /> Guardar
                        </button>
                        <button 
                          onClick={cancelEditingArea}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center gap-1"
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="flex-1 text-left"
                        onClick={() => toggleArea(area.id)}
                      >
                        <h2 className="text-xl font-semibold text-gray-100">{area.nombre_area}</h2>
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEditingArea(area)}
                          className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                          title="Editar área"
                        >
                          <Edit size={18} />
                        </button>
                        {isOpen ? <ChevronUp size={20} onClick={() => toggleArea(area.id)} /> : <ChevronDown size={20} onClick={() => toggleArea(area.id)} />}
                      </div>
                    </>
                  )}
                </div>
                
                {isOpen && !isEditing && (
                  <div className="px-6 py-4 border-t border-gray-700">
                    <p className="text-gray-400 mb-6">{area.descripcion || 'Sin descripción'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {areaSensors.map(sensor => {
                        const isEditingSensorItem = editingSensor === sensor.id;
                        
                        return (
                          <div key={sensor.id} className="bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500 shadow-sm">
                            {isEditingSensorItem ? (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="text-lg font-semibold text-gray-100">Editar Sensor</h3>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => updateSensorComplete(sensor.id)}
                                      className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                      title="Guardar cambios"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      onClick={cancelEditingSensor}
                                      className="p-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                      title="Cancelar"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 mb-1 text-sm font-medium">Nombre del Sensor</label>
                                  <div className="text-xs text-gray-400 mb-1">Actual: {sensor.nombre_sensor}</div>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                    name="nombre_sensor" 
                                    value={sensorForm.nombre_sensor}
                                    onChange={handleSensorFormChange}
                                    required 
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 mb-1 text-sm font-medium">Ubicación</label>
                                  <div className="text-xs text-gray-400 mb-1">Actual: {sensor.ubicacion}</div>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                    name="ubicacion" 
                                    value={sensorForm.ubicacion}
                                    onChange={handleSensorFormChange}
                                    required 
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 mb-1 text-sm font-medium">Tipo de Sensor</label>
                                  <div className="text-xs text-gray-400 mb-1">Actual: {sensor.tipo_sensor}</div>
                                  <select
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                    name="tipo_sensor"
                                    value={sensorForm.tipo_sensor}
                                    onChange={handleSensorFormChange}
                                    required
                                  >
                                    <option value="">Seleccionar tipo</option>
                                    <option value="temperatura">Temperatura</option>
                                    <option value="velocidad">Velocidad</option>
                                    <option value="caudal">Caudal</option>
                                    <option value="cobertura">Cobertura</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 mb-1 text-sm font-medium">Umbral Mínimo</label>
                                  <div className="text-xs text-gray-400 mb-1">Actual: {sensor.umbral_min}</div>
                                  <input 
                                    type="number" 
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                    step="0.01" 
                                    name="umbral_min" 
                                    value={sensorForm.umbral_min}
                                    onChange={handleSensorFormChange}
                                    required 
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 mb-1 text-sm font-medium">Umbral Máximo</label>
                                  <div className="text-xs text-gray-400 mb-1">Actual: {sensor.umbral_max}</div>
                                  <input 
                                    type="number" 
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                    step="0.01" 
                                    name="umbral_max" 
                                    value={sensorForm.umbral_max}
                                    onChange={handleSensorFormChange}
                                    required 
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-semibold text-gray-100">{sensor.nombre_sensor}</h3>
                                  <button 
                                    onClick={() => startEditingSensor(sensor)}
                                    className="p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                                    title="Editar sensor"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
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
                                    Guardar Umbrales
                                  </button>
                                </form>
                              </>
                            )}
                          </div>
                        );
                      })}
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