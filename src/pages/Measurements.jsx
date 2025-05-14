import React, { useState } from 'react';
import { Calendar, Clock, Wind, Thermometer, Activity, Map } from 'lucide-react';

const locations = [
  'Bocamina Nv. 4490',
  'Rampa 4490-2W'
];

const parameters = [
  { id: 'airSpeed', name: 'Velocidad de Aire', icon: <Wind size={20} />, unit: 'm/s' },
  { id: 'temperature', name: 'Temperatura', icon: <Thermometer size={20} />, unit: '°C' },
  { id: 'airFlow', name: 'Caudal de Aire', icon: <Activity size={20} />, unit: 'm³/s' },
  { id: 'coverage', name: 'Cobertura', icon: <Map size={20} />, unit: '%' }
];

const Measurements = () => {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [selectedParameter, setSelectedParameter] = useState(parameters[0]);
  const [measurements, setMeasurements] = useState([
    {
      id: 1,
      date: '2025-03-15',
      time: '14:30',
      location: 'Bocamina Nv. 4490',
      parameter: 'airSpeed',
      value: '5.2'
    },
    {
      id: 2,
      date: '2025-03-15',
      time: '15:45',
      location: 'Rampa 4490-2W',
      parameter: 'temperature',
      value: '23.5'
    }
  ]);

  const handleAddMeasurement = () => {
    const now = new Date();
    const newMeasurement = {
      id: measurements.length + 1,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(':').slice(0, 2).join(':'),
      location: selectedLocation,
      parameter: selectedParameter.id,
      value: (Math.random() * 10).toFixed(1) // Simulated measurement value
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Measurements</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track and record measurements from different locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Location</h3>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Parameter</h3>
          <div className="grid grid-cols-2 gap-2">
            {parameters.map(param => (
              <button
                key={param.id}
                onClick={() => setSelectedParameter(param)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  selectedParameter.id === param.id
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {param.icon}
                <span>{param.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">Measurement Records</h3>
          <button
            onClick={handleAddMeasurement}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Measurement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {measurements.map((measurement) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{measurement.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {parameters.find(p => p.id === measurement.parameter)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                    {measurement.value} {parameters.find(p => p.id === measurement.parameter)?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Measurements;