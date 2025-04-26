import React from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SensorChart({
  title,
  data,
  dataKey,
  lineColor,
  name,
  minThreshold,
  maxThreshold,
  thresholdColor = "#dc2626"
}) {
  // Función renombrada para evitar conflicto con el prop
  const calculateYDomain = (dataKey, minThreshold, maxThreshold) => {
    if (data.length === 0) return [0, 100];
   
    const values = data.map(d => d[dataKey]);
    const min = Math.min(...values, minThreshold);
    const max = Math.max(...values, maxThreshold);
   
    // Añadir margen para mejor visualización
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow pr-2 py-4">
      <h2 className="text-xl font-semibold mb-4 text-white ml-6">{title}</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
              stroke="#9CA3AF"
            />
            <YAxis 
              domain={calculateYDomain(dataKey, minThreshold, maxThreshold)}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip 
              labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
              }}
            />
            <Legend />
            
            {/* Líneas de umbral */}
            <ReferenceLine 
              y={minThreshold}
              stroke={thresholdColor}
              strokeDasharray="3 3"
              name="Min Umbral"
              dot={false}
            />
            <ReferenceLine 
              y={maxThreshold}
              stroke={thresholdColor}
              strokeDasharray="3 3"
              name="Max Umbral"
              dot={false}
            />
            
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              activeDot={{ r: 6 }}
              name={name}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}