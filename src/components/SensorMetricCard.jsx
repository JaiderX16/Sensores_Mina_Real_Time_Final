import React from 'react';
import { Wind, Thermometer, Droplets } from 'lucide-react';
import Metric from './Metric.jsx';

export default function SensorMetricCard({
  icon,
  title,
  value,
  color,
  minThreshold,
  maxThreshold,
  unit
}) {
  const getIcon = () => {
    switch(icon) {
      case 'Wind': return <Wind className="text-blue-500" size={24} />;
      case 'Thermometer': return <Thermometer className="text-blue-500" size={24} />;
      case 'Droplets': return <Droplets className="text-blue-500" size={24} />;
      default: return null;
    }
  };
   
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        {getIcon()}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="flex flex-col items-center justify-center h-full mt-1">
        <Metric
          label="SENSOR VALUE"
          unit=""
          value={value}
          color={color}
        />
        <p className="text-sm text-gray-400 mt-3 pb-2">
          Límite: {minThreshold} - {maxThreshold} {unit}
        </p>
      </div>
    </div>
  );
}