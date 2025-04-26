import React from 'react';
import { DigitalClock } from '../components/DigitalClock';
import SensorMetricCard from '../components/SensorMetricCard';

const Dashboard = () => {
  return (
    <div className="animate-fade-in p-4">
      <div>
        <DigitalClock />
      </div>

      {/* Área Externa */}
      <div className="mb-8">
        <h1 className='text-white font-bold text-3xl mb-6 flex items-center'>
          <span className="bg-blue-500 w-2 h-8 mr-3 rounded"></span>
          Área Externa - Bocamina
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SensorMetricCard
            icon="Wind"
            title="Velocidad del viento"
            value="10"
            color="#3b82f6"
            minThreshold="0"
            maxThreshold="20"
            unit="m/s"
          />
          <SensorMetricCard
            icon="Thermometer"
            title="Temperatura"
            value="25"
            color="#10b981"
            minThreshold="10"
            maxThreshold="30"
            unit="°C"
          />
          <SensorMetricCard
            icon="Droplets"
            title="Humedad"
            value="50"
            color="#f59e0b"
            minThreshold="0"
            maxThreshold="100"
            unit="%"
          />
        </div>
      </div>

      {/* Área Interna */}
      <div className="mb-8">
        <h1 className='text-white font-bold text-3xl mb-6 flex items-center'>
          <span className="bg-green-500 w-2 h-8 mr-3 rounded"></span>
          Área de Operación - Rampa
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SensorMetricCard
            icon="Wind"
            title="Velocidad del viento"
            value="10"
            color="#3b82f6"
            minThreshold="0"
            maxThreshold="20"
            unit="m/s"
          />
          <SensorMetricCard
            icon="Thermometer"
            title="Temperatura"
            value="25"
            color="#10b981"
            minThreshold="10"
            maxThreshold="30"
            unit="°C"
          />
          <SensorMetricCard
            icon="Droplets"
            title="Humedad"
            value="50"
            color="#f59e0b"
            minThreshold="0"
            maxThreshold="100"
            unit="%"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;