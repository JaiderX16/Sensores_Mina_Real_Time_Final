import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';
const API_THRESHOLDS = `${API_BASE_URL}/thresholds`;

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [thresholds, setThresholds] = useState({
    temperature: { min: 20, max: 30 },
    velocity: { min: 10, max: 50 },
    flow: { min: 5, max: 25 }
  });

  // Fetch thresholds from database
  const fetchThresholds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/area1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los límites');
      }

      const sensors = await response.json();
      
      // Find sensors by type and extract their thresholds
      const tempSensor = sensors.find(s => s.tipo === 'temperatura') || {};
      const velSensor = sensors.find(s => s.tipo === 'velocidad') || {};
      const flowSensor = sensors.find(s => s.tipo === 'flujo') || {};

      const formattedThresholds = {
        temperature: { 
          min: tempSensor.umbral_min || 20, 
          max: tempSensor.umbral_max || 30 
        },
        velocity: { 
          min: velSensor.umbral_min || 10, 
          max: velSensor.umbral_max || 50 
        },
        flow: { 
          min: flowSensor.umbral_min || 5, 
          max: flowSensor.umbral_max || 25 
        }
      };
      
      setThresholds(formattedThresholds);
      localStorage.setItem('thresholds', JSON.stringify(formattedThresholds));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveThresholds = async () => {
    try {
      const apiData = {
        temperatura: {
          umbral_min: thresholds.temperature.min,
          umbral_max: thresholds.temperature.max
        },
        velocidad: {
          umbral_min: thresholds.velocity.min,
          umbral_max: thresholds.velocity.max
        },
        flujo: {
          umbral_min: thresholds.flow.min,
          umbral_max: thresholds.flow.max
        }
      };

      const response = await fetch(`${API_BASE_URL}/sensores/area1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar los límites');
      }

      localStorage.setItem('thresholds', JSON.stringify(thresholds));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchThresholds();
  }, [token, navigate]);

  const handleChange = (sensor, bound, value) => {
    setThresholds(prev => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [bound]: Number(value)
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">Cargando configuración...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configuración de Rangos</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Temperatura (°C)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Mínimo</label>
                <input
                  type="number"
                  value={thresholds.temperature.min}
                  onChange={(e) => handleChange('temperature', 'min', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Máximo</label>
                <input
                  type="number"
                  value={thresholds.temperature.max}
                  onChange={(e) => handleChange('temperature', 'max', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Velocidad (m/s)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Mínimo</label>
                <input
                  type="number"
                  value={thresholds.velocity.min}
                  onChange={(e) => handleChange('velocity', 'min', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Máximo</label>
                <input
                  type="number"
                  value={thresholds.velocity.max}
                  onChange={(e) => handleChange('velocity', 'max', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Flujo (m³/h)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Mínimo</label>
                <input
                  type="number"
                  value={thresholds.flow.min}
                  onChange={(e) => handleChange('flow', 'min', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Máximo</label>
                <input
                  type="number"
                  value={thresholds.flow.max}
                  onChange={(e) => handleChange('flow', 'max', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={saveThresholds}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}