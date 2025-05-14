import React, { useState, useEffect } from 'react';
import { Calculator, Loader2, Wind, Users, AlertTriangle, RefreshCw } from 'lucide-react';

const Environment = () => {
  const [areas, setAreas] = useState([
    { id: 1, name: 'Área 1', height: 0, width: 0, correction: 0, result: 0 },
    { id: 2, name: 'Área 2', height: 0, width: 0, correction: 0, result: 0 }
  ]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  // Nuevos estados para el cálculo de caudal de aire
  const [equipoHP, setEquipoHP] = useState(0);
  const [numPersonas, setNumPersonas] = useState(0);
  const [caudalRequerido, setCaudalRequerido] = useState(0);
  const [caudalMedido, setCaudalMedido] = useState(0);
  const [cobertura, setCobertura] = useState(0);
  const [loadingCaudal, setLoadingCaudal] = useState(false);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAreaData = async (id, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/variables-entorno/${id}`);
        
        if (response.ok) {
          return await response.json();
        }

        // Si el área no existe (404), no es necesario reintentar
        if (response.status === 404) {
          console.log(`Área ${id} no encontrada, creando nueva.`);
          return null;
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            throw new Error('Acceso no autorizado');
          case 403:
            throw new Error('Acceso prohibido');
          case 500:
            throw new Error('Error interno del servidor');
          default:
            throw new Error(`El servidor respondió con estado: ${response.status}`);
        }
      } catch (error) {
        // En el último reintento, lanzar el error
        if (attempt === retries - 1) {
          console.error(`No se pudo obtener el área ${id} después de ${retries} intentos:`, error);
          throw error;
        }

        // Esperar con retroceso exponencial antes de reintentar
        const backoffTime = Math.pow(2, attempt) * 1000;
        console.warn(`Intento ${attempt + 1} falló, reintentando en ${backoffTime}ms...`);
        await sleep(backoffTime);
      }
    }
  };

  const createAreaData = async (id, data) => {
    try {
      // Corregir la URL de la API para crear áreas
      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/variables-entorno/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`No se pudo crear el área ${id}: ${errorMessage}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear datos del área:', error);
      setError(`Error al crear: ${error.message}`);
      return null;
    }
  };

  const updateAreaData = async (id, data) => {
    try {
      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/variables-entorno/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`No se pudo actualizar el área ${id}: ${errorMessage}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error al actualizar datos del área:', error);
      setError(`Error al actualizar: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    const loadAreas = async () => {
      try {
        setError(null);
        setLoading(true);
        const updatedAreas = [...areas];
        
        for (const area of updatedAreas) {
          try {
            let data = await fetchAreaData(area.id);
            
            // Si el área no existe, intentar crearla solo si la API lo permite
            if (!data) {
              const newData = {
                height: area.height || 0,
                width: area.width || 0,
                correction: area.correction || 0,
                superficie_area: 0 // Añadir el campo superficie_area
              };
              
              try {
                data = await createAreaData(area.id, newData);
              } catch (createError) {
                console.warn(`No se pudo crear el área ${area.id}, usando datos locales.`);
                // Si no podemos crear el área, usamos los datos locales
                data = newData;
              }
            }
            
            if (data) {
              area.height = parseFloat(data.height) || 0;
              area.width = parseFloat(data.width) || 0;
              area.correction = parseFloat(data.correction) || 0;
              // Ensure result is a number
              area.result = data.superficie_area !== undefined ? 
                parseFloat(data.superficie_area) || 0 : 
                parseFloat(data.height * data.width * data.correction) || 0;
            }
          } catch (areaError) {
            console.error(`Error al cargar el área ${area.id}:`, areaError);
            // Continuar cargando otras áreas incluso si una falla
          }
        }
        
        setAreas(updatedAreas);
      } catch (error) {
        setError(`Error al cargar áreas: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadAreas();
  }, []);

  const handleInputChange = (id, field, value) => {
    setAreas(areas.map(area => {
      if (area.id === id) {
        const updatedArea = {
          ...area,
          [field]: parseFloat(value) || 0
        };
        // Ya no actualizamos result aquí, solo lo mantenemos como estaba
        return updatedArea;
      }
      return area;
    }));
  };

  // Nueva función para obtener datos de mediciones en tiempo real
  const fetchMedicionesData = async () => {
    try {
      setLoadingCaudal(true);
      const response = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones-tiempo-real');
      
      if (!response.ok) {
        throw new Error(`Error al obtener mediciones: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Buscar los datos del área 2 (según lo indicado)
      const medicionArea2 = data.find(item => item.area_id === 2);
      
      if (medicionArea2) {
        // Actualizar el caudal medido con el valor de "flow" del área 2
        setCaudalMedido(parseFloat(medicionArea2.flow) || 0);
        
        // Si ya tenemos un caudal requerido calculado, actualizar la cobertura
        if (caudalRequerido > 0) {
          const coberturaCalculada = (parseFloat(medicionArea2.flow) / caudalRequerido) * 100;
          setCobertura(coberturaCalculada);
        }
      } else {
        setError("No se encontraron datos para el Área 2");
      }
    } catch (error) {
      setError(`Error al cargar mediciones: ${error.message}`);
    } finally {
      setLoadingCaudal(false);
    }
  };

  // Cargar los datos de mediciones al iniciar y configurar actualización periódica
  useEffect(() => {
    // Cargar datos iniciales
    fetchMedicionesData();
    
    // Configurar intervalo para actualización cada 10 segundos
    const intervalo = setInterval(() => {
      fetchMedicionesData();
    }, 10000); // 10 segundos
    
    // Limpiar intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, []);

  // Nueva función para calcular el caudal de aire requerido
  const calcularCaudalRequerido = () => {
    const caudal = 3 * parseFloat(equipoHP) + 6 * parseFloat(numPersonas);
    setCaudalRequerido(caudal);
    
    // Calcular la cobertura con el caudal medido actual
    if (caudal > 0) {
      const coberturaCalculada = (parseFloat(caudalMedido) / caudal) * 100;
      setCobertura(coberturaCalculada);
    } else {
      setCobertura(0);
    }
  };

  // Nueva función para calcular la cobertura
  const calcularCobertura = (caudal) => {
    if (caudal > 0) {
      const coberturaCalculada = (parseFloat(caudalMedido) / caudal) * 100;
      setCobertura(coberturaCalculada);
    } else {
      setCobertura(0);
    }
  };

  // Manejador para cambios en los inputs de caudal
  const handleCaudalInputChange = (e, setter) => {
    const value = e.target.value;
    setter(parseFloat(value) || 0);
  };

  // Función handleUpdate única y corregida
  const handleUpdate = async (area) => {
    setError(null);
    setUpdating(area.id);
    const data = {
      height: area.height,
      width: area.width,
      correction: area.correction,
      superficie_area: area.height * area.width * area.correction
    };
    
    try {
      const success = await updateAreaData(area.id, data);
      if (success) {
        try {
          const newData = await fetchAreaData(area.id);
          if (newData) {
            setAreas(areas.map(a => {
              if (a.id === area.id) {
                const superficie = parseFloat(newData.superficie_area) || 0;
                return {
                  ...a,
                  height: parseFloat(newData.height) || 0,
                  width: parseFloat(newData.width) || 0,
                  correction: parseFloat(newData.correction) || 0,
                  result: superficie
                };
              }
              return a;
            }));
          }
        } catch (error) {
          setError(`Error al actualizar datos: ${error.message}`);
        }
      }
    } catch (error) {
      setError(`Error al actualizar: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Variables de Entorno</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Configuración de variables ambientales para cálculos de superficie y caudal de aire.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-600/30 rounded-lg flex items-start">
          <div className="text-red-200 font-medium">{error}</div>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-300 hover:text-red-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Nueva sección para cálculo de caudal de aire */}
      <div className="mb-10 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Cálculo de Caudal de Aire</h2>
          <button 
            onClick={fetchMedicionesData}
            className="flex items-center gap-1 text-blue-300 hover:text-blue-100 transition-colors"
            disabled={loadingCaudal}
          >
            <RefreshCw size={16} className={loadingCaudal ? "animate-spin" : ""} />
            <span className="text-sm">Actualizar datos</span>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de HP de Equipo (X)
              </label>
              <div className="relative">
                <input
                  value={equipoHP}
                  onChange={(e) => handleCaudalInputChange(e, setEquipoHP)}
                  className="w-full p-3 pl-4 bg-gray-700/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ingrese HP"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">HP</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Personas (Y)
              </label>
              <div className="relative">
                <input
                  value={numPersonas}
                  onChange={(e) => handleCaudalInputChange(e, setNumPersonas)}
                  className="w-full p-3 pl-4 bg-gray-700/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ingrese cantidad"
                />
                <Users size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Wind size={20} className="mr-2 text-blue-400" />
                <span className="text-gray-300 font-medium">Caudal Medido (Sensor):</span>
              </div>
              <div className="text-xl font-bold text-white">
                {loadingCaudal ? (
                  <Loader2 size={18} className="animate-spin ml-2" />
                ) : (
                  <>{caudalMedido.toFixed(2)} <span className="text-sm text-gray-400">m³/min</span></>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Datos obtenidos del Área 2 en tiempo real</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <button
              onClick={calcularCaudalRequerido}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all"
            >
              <Calculator size={18} />
              <span>Calcular</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                <Wind size={20} className="mr-2 text-blue-400" />
                Caudal de Aire Requerido
              </h3>
              <p className="text-3xl font-bold text-white">
                {caudalRequerido.toFixed(2)} <span className="text-lg text-gray-400">m³/min</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Fórmula: 3 × HP + 6 × Personas = {caudalRequerido.toFixed(2)} m³/min
              </p>
            </div>
            
            <div className={`bg-gray-700/50 rounded-lg p-5 ${cobertura < 100 ? 'border-2 border-red-500' : ''}`}>
              <h3 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                {cobertura < 100 ? (
                  <AlertTriangle size={20} className="mr-2 text-red-500" />
                ) : (
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
                Cobertura
              </h3>
              <p className={`text-3xl font-bold ${cobertura < 100 ? 'text-red-400' : 'text-green-400'}`}>
                {cobertura.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Fórmula: (Caudal Medido / Caudal Requerido) × 100%
              </p>
              {cobertura < 100 && (
                <div className="mt-3 p-2 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                  <AlertTriangle size={16} className="inline-block mr-1" />
                  ¡Alerta! La cobertura es menor al 100% requerido.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map(area => (
            <div key={area.id} className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">{area.name}</h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Altura (m)
                  </label>
                  <div className="relative">
                    <input
                      value={area.height}
                      onChange={(e) => handleInputChange(area.id, 'height', e.target.value)}
                      className="w-full p-3 pl-4 bg-gray-700/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Ingrese la altura"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">m</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ancho (m)
                  </label>
                  <div className="relative">
                    <input
                      value={area.width}
                      onChange={(e) => handleInputChange(area.id, 'width', e.target.value)}
                      className="w-full p-3 pl-4 bg-gray-700/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Ingrese el ancho"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">m</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Factor de Corrección
                  </label>
                  <input
                    value={area.correction}
                    onChange={(e) => handleInputChange(area.id, 'correction', e.target.value)}
                    className="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ingrese el factor de corrección"
                    step="0.01"
                  />
                </div>
                
                <div className="border-t border-gray-700 pt-5 mt-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Superficie Calculada:</p>
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {(area.height * area.width * area.correction).toFixed(2)} m<sup>2</sup>
                        </p>
                        <p className="text-md text-gray-400 mt-1">
                          Valor en BD: <span className="font-medium text-gray-300">{typeof area.result === 'number' ? area.result.toFixed(2) : '0.00'} m<sup>2</sup></span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdate(area)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                        updating === area.id 
                          ? 'bg-blue-700 text-blue-200 cursor-wait' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                      disabled={updating === area.id}
                    >
                      {updating === area.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Actualizando...</span>
                        </>
                      ) : (
                        <>
                          <Calculator size={18} />
                          <span>Actualizar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Environment;