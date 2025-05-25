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

  // Colores para los umbrales
  const minThresholdColor = "#FBBF24"; // Amarillo
  const maxThresholdColor = "#EF4444"; // Rojo

  // Personalizar la leyenda para incluir los umbrales
  const CustomLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 mt-2">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center">
            <svg width="16" height="16" viewBox="0 0 32 32" className="mr-1">
              <path d="M0,14h10v4H0z" fill={entry.color} />
              <path d="M22,14h10v4H22z" fill={entry.color} />
              <circle cx="16" cy="16" r="6" fill="none" stroke={entry.color} strokeWidth="3" />
            </svg>
            <span style={{ color: entry.color }} className="text-sm font-medium">{entry.value}</span>
          </div>
        ))}
        <div className="flex items-center">
          <svg width="16" height="16" viewBox="0 0 32 32" className="mr-1">
            <path d="M0,14h10v4H0z" fill={minThresholdColor} />
            <path d="M22,14h10v4H22z" fill={minThresholdColor} />
            <circle cx="16" cy="16" r="6" fill="none" stroke={minThresholdColor} strokeWidth="3" />
          </svg>
          <span style={{ color: minThresholdColor }} className="text-sm font-medium">Mín: {minThreshold}</span>
        </div>
        <div className="flex items-center">
          <svg width="16" height="16" viewBox="0 0 32 32" className="mr-1">
            <path d="M0,14h10v4H0z" fill={maxThresholdColor} />
            <path d="M22,14h10v4H22z" fill={maxThresholdColor} />
            <circle cx="16" cy="16" r="6" fill="none" stroke={maxThresholdColor} strokeWidth="3" />
          </svg>
          <span style={{ color: maxThresholdColor }} className="text-sm font-medium">Máx: {maxThreshold}</span>
        </div>
      </div>
    );
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
              tickFormatter={(timestamp) => ''}
              // tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
              stroke="#9CA3AF"
            />
            <YAxis 
              domain={calculateYDomain(dataKey, minThreshold, maxThreshold)}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip 
              labelFormatter={(timestamp) => ''}
              // tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
              }}
            />
            <Legend content={<CustomLegend />} />
            
            {/* Líneas de umbral con colores diferentes */}
            <ReferenceLine 
              y={minThreshold}
              stroke={minThresholdColor}
              strokeDasharray="3 3"
              name="Min Umbral"
              dot={false}
            />
            <ReferenceLine 
              y={maxThreshold}
              stroke={maxThresholdColor}
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