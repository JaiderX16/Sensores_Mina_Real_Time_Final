import React, { useState, useEffect } from 'react';
import { Calculator, Loader2, Wind, Users, AlertTriangle, RefreshCw } from 'lucide-react';

const Environment = () => {
  const [areas, setAreas] = useState([
    { id: 1, name: 'Bocamina Nv. 4490', height: 0, width: 0, correction: 0, result: 0 },
    { id: 2, name: 'Rampa 4490-2W', height: 0, width: 0, correction: 0, result: 0 }
  ]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  // Estados para el cálculo de caudal de aire
  const [equipoHP, setEquipoHP] = useState(0);
  const [numPersonas, setNumPersonas] = useState(0);
  const [caudalRequerido, setCaudalRequerido] = useState(0);
  const [caudalRequeridoBD, setCaudalRequeridoBD] = useState(0);
  const [caudalMedido, setCaudalMedido] = useState(0);
  const [cobertura, setCobertura] = useState(0);
  const [coberturaBD, setCoberturaBD] = useState(0);
  const [loadingCaudal, setLoadingCaudal] = useState(false);
  const [actualizandoCobertura, setActualizandoCobertura] = useState(false);
  const [actualizandoCaudalRequerido, setActualizandoCaudalRequerido] = useState(false);

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

  // Función para obtener datos de mediciones en tiempo real
  const fetchMedicionesData = async () => {
    try {
      setLoadingCaudal(true);
      
      // Obtener datos de mediciones en tiempo real
      const responseMediciones = await fetch('https://apisensoresmina-production.up.railway.app/api/mediciones-tiempo-real');
      
      if (!responseMediciones.ok) {
        throw new Error(`Error al obtener mediciones: ${responseMediciones.status}`);
      }
      
      const dataMediciones = await responseMediciones.json();
      
      // Buscar los datos del área 2
      const medicionArea2 = dataMediciones.find(item => item.area_id === 2);
      
      if (medicionArea2) {
        // Actualizar el caudal medido con el valor de "flow" del área 2
        setCaudalMedido(parseFloat(medicionArea2.flow) || 0);
        
        // Obtener la cobertura de la base de datos
        setCoberturaBD(parseFloat(medicionArea2.coverage) || 0);
      }
      
      // Obtener datos de variables de entorno
      const responseVariables = await fetch('https://apisensoresmina-production.up.railway.app/api/variables-entorno');
      
      if (!responseVariables.ok) {
        throw new Error(`Error al obtener variables de entorno: ${responseVariables.status}`);
      }
      
      const dataVariables = await responseVariables.json();
      
      // Buscar los datos del área 2
      const variablesArea2 = dataVariables.find(item => item.area_id === 2);
      
      if (variablesArea2) {
        // Actualizar el caudal requerido de la BD
        setCaudalRequeridoBD(parseFloat(variablesArea2.caudal_requerido) || 0);
        
        // Si ya tenemos un caudal medido, actualizar la cobertura calculada
        if (caudalMedido > 0 && variablesArea2.caudal_requerido > 0) {
          const coberturaCalculada = (caudalMedido / parseFloat(variablesArea2.caudal_requerido)) * 100;
          setCobertura(coberturaCalculada);
        }
      }
      
    } catch (error) {
      setError(`Error al cargar datos: ${error.message}`);
    } finally {
      setLoadingCaudal(false);
    }
  };

  // Nueva función para actualizar el caudal requerido en la API
  const actualizarCaudalRequerido = async () => {
    try {
      setActualizandoCaudalRequerido(true);
      
      // Obtener los datos actuales del área 2
      const response = await fetch('https://apisensoresmina-production.up.railway.app/api/variables-entorno');
      
      if (!response.ok) {
        throw new Error(`Error al obtener variables de entorno: ${response.status}`);
      }
      
      const data = await response.json();
      const variablesArea2 = data.find(item => item.area_id === 2);
      
      if (!variablesArea2) {
        throw new Error("No se encontraron datos para el Área 2");
      }
      
      // Preparar los datos para actualizar
      const datosActualizados = {
        ...variablesArea2,
        caudal_requerido: caudalRequerido.toString()  // Convertir a string para mantener consistencia con la API
      };
      
      // Actualizar los datos en la API
      const updateResponse = await fetch(`https://apisensoresmina-production.up.railway.app/api/variables-entorno/${variablesArea2.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados)
      });
      
      if (!updateResponse.ok) {
        const errorMessage = await updateResponse.text();
        throw new Error(`No se pudo actualizar el caudal requerido: ${errorMessage}`);
      }
      
      // Actualizar el valor de caudal requerido en la BD
      setCaudalRequeridoBD(caudalRequerido);
      
      // Recalcular la cobertura
      if (caudalRequerido > 0) {
        const coberturaCalculada = (caudalMedido / caudalRequerido) * 100;
        setCobertura(coberturaCalculada);
      }
      
      // Mostrar mensaje de éxito
      setError(null);
      
    } catch (error) {
      console.error('Error al actualizar caudal requerido:', error);
      setError(`Error al actualizar caudal requerido: ${error.message}`);
    } finally {
      setActualizandoCaudalRequerido(false);
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

  const handleInputChange = (id, field, value) => {
    setAreas(areas.map(area => {
      if (area.id === id) {
        const updatedArea = {
          ...area,
          [field]: parseFloat(value) || 0
        };
        return updatedArea;
      }
      return area;
    }));
  };

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

  // Manejador para cambios en los inputs de caudal
  const handleCaudalInputChange = (e, setter) => {
    const value = e.target.value;
    setter(parseFloat(value) || 0);
  };

  // Función para solo calcular el área sin actualizar la BD
  const handleCalculate = (area) => {
    const resultado = area.height * area.width * area.correction;
    setAreas(areas.map(a => {
      if (a.id === area.id) {
        return {
          ...a,
          calculatedResult: resultado // Guardamos el resultado calculado en una propiedad separada
        };
      }
      return a;
    }));
  };
  
  // Función para actualizar áreas en la BD (la función existente)
  const handleUpdate = async (area) => {
    setError(null);
    setUpdating(area.id);
    const data = {
      height: area.height,
      width: area.width,
      correction: area.correction,
      superficie_area: area.calculatedResult || (area.height * area.width * area.correction)
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
                  result: superficie,
                  calculatedResult: superficie // Sincronizamos el resultado calculado con el de la BD
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

      {/* Sección para cálculo de caudal de aire */}
      <div className="mb-10 bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
        <div className="bg-gray-750 p-5 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-200">Cálculo de Caudal de Aire</h3>
          <button 
            onClick={fetchMedicionesData}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
            disabled={loadingCaudal}
          >
            <RefreshCw size={16} className={loadingCaudal ? "animate-spin" : ""} />
            <span className="text-sm">Actualizar</span>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">
                Número de HP de Equipo (X)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={equipoHP}
                  onChange={(e) => handleCaudalInputChange(e, setEquipoHP)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-base"
                  placeholder="Ingrese HP"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">HP</span>
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">
                Número de Personas (Y)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={numPersonas}
                  onChange={(e) => handleCaudalInputChange(e, setNumPersonas)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-base"
                  placeholder="Ingrese cantidad"
                />
                <Users size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Wind size={18} className="mr-2 text-blue-400" />
                <span className="text-base text-gray-300 font-medium">Caudal Medido (Sensor):</span>
              </div>
              <div className="text-lg font-bold text-gray-200">
                {loadingCaudal ? (
                  <Loader2 size={18} className="animate-spin ml-2" />
                ) : (
                  <>{caudalMedido.toFixed(2)} <span className="text-sm text-gray-400">m³/min</span></>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Datos obtenidos de Rampa 4490-2W en tiempo real</p>
          </div>
          
          <div className="flex justify-center mb-5">
            <button
              onClick={calcularCaudalRequerido}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-base font-medium rounded-lg transition-colors"
              disabled={loadingCaudal}
            >
              {loadingCaudal ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  <span>Calcular</span>
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-700 rounded-lg p-5">
              <h3 className="text-base font-medium text-gray-300 mb-3 flex items-center">
                <Wind size={18} className="mr-2 text-blue-400" />
                Caudal de Aire Requerido 
              </h3>
              <p className="text-2xl font-bold text-gray-200">
                {caudalRequerido.toFixed(2)} <span className="text-base text-gray-400">m³/min</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Fórmula: 3 × HP + 6 × Personas = {caudalRequerido.toFixed(2)} m³/min
              </p>
              {caudalRequeridoBD !== 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Valor en BD: <span className="font-medium text-gray-300">{caudalRequeridoBD.toFixed(2)} m³/min</span>
                  <a 
                    href="https://apisensoresmina-production.up.railway.app/api/variables-entorno" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    (Ver API)
                  </a>
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={actualizarCaudalRequerido}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    actualizandoCaudalRequerido 
                      ? 'bg-blue-700 text-blue-200 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                  disabled={actualizandoCaudalRequerido || loadingCaudal || caudalRequerido <= 0}
                >
                  {actualizandoCaudalRequerido ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`bg-gray-700 rounded-lg p-5 ${cobertura < 100 ? 'border border-red-500' : ''}`}>
              <h3 className="text-base font-medium text-gray-300 mb-3 flex items-center">
                {cobertura < 100 ? (
                  <AlertTriangle size={18} className="mr-2 text-red-500" />
                ) : (
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
                Cobertura
              </h3>
              <p className={`text-2xl font-bold ${cobertura < 100 ? 'text-red-500' : 'text-green-500'}`}>
                {cobertura.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Caudal Medido / Caudal Requerido × 100
              </p>
              <div className="mt-3 h-3 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${cobertura >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(cobertura, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {cobertura < 100 
                  ? "La cobertura actual es insuficiente para las necesidades operativas."
                  : "La cobertura actual cumple con los requisitos mínimos de ventilación."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección para cálculo de áreas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {areas.map((area) => (
          <div key={area.id} className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
            <div className="bg-gray-750 p-4 border-b border-gray-700">
              <h3 className="text-base font-medium text-gray-200">{area.name}</h3>
              <p className="text-sm text-gray-400 mt-1">Cálculo de área de sección</p>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Altura (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={area.height}
                    onChange={(e) => handleInputChange(area.id, 'height', e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Ancho (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={area.width}
                    onChange={(e) => handleInputChange(area.id, 'width', e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200"
                    min="0"
                  />
                </div>
                {/* // En la sección de renderizado de las áreas */}
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    F. Corrección (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={area.correction * 100} // Multiplicar por 100 para mostrar como porcentaje
                    onChange={(e) => handleInputChange(area.id, 'correction', e.target.value / 100)} // Dividir por 100 al guardar
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 text-base"
                    min="0"
                    max="100" // Cambiar el máximo a 100 para porcentaje
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-medium text-gray-300">Resultado:</span>
                  <span className="ml-2 text-xl font-semibold text-gray-200">
                    {(area.calculatedResult || (area.height * area.width * area.correction)).toFixed(2)} m²
                  </span>
                  <p className="text-sm text-gray-400 mt-1">
                    Valor en BD: <span className="font-medium text-gray-300">{area.result.toFixed(2)} m²</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-end ml-0.5">
                  <button 
                    onClick={() => handleCalculate(area)} 
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-base font-medium shadow-sm hover:shadow-md"
                  > 
                    <span className="flex items-center justify-center"> 
                      <Calculator size={20} className="mr-2" /> 
                      <span>Calcular</span> 
                    </span> 
                  </button> 
                  
                  <button 
                    onClick={() => handleUpdate(area)} 
                    disabled={updating === area.id} 
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-base font-medium shadow-sm hover:shadow-md transition-all ${
                      updating === area.id 
                        ? 'bg-blue-700 text-blue-100 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  > 
                    {updating === area.id ? ( 
                      <span className="flex items-center justify-center"> 
                        <Loader2 size={20} className="animate-spin mr-2" /> 
                        <span>Actualizando...</span> 
                      </span> 
                    ) : ( 
                      <span className="flex items-center justify-center"> 
                        <RefreshCw size={20} className="mr-2" /> 
                        <span>Actualizar</span> 
                      </span> 
                    )} 
                  </button> 
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Environment;