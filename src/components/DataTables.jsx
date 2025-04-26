import React from 'react';

const DataTables = ({ sensores, mediciones, alertas }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Sensores Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Sensores</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Ubicación</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Umbral Mín</th>
                <th className="p-3 text-left">Umbral Máx</th>
              </tr>
            </thead>
            <tbody>
              {sensores.map(sensor => (
                <tr key={sensor.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{sensor.id}</td>
                  <td className="p-3">{sensor.nombre_sensor}</td>
                  <td className="p-3">{sensor.ubicacion}</td>
                  <td className="p-3">{sensor.tipo}</td>
                  <td className="p-3">{sensor.umbral_min}</td>
                  <td className="p-3">{sensor.umbral_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mediciones Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Mediciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Zona</th>
                <th className="p-3 text-left">Velocidad (m/s)</th>
                <th className="p-3 text-left">Caudal (m³/s)</th>
                <th className="p-3 text-left">Temperatura (°C)</th>
                <th className="p-3 text-left">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {mediciones.map(medicion => (
                <tr key={medicion.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{medicion.id}</td>
                  <td className="p-3">{medicion.ubicacion}</td>
                  <td className="p-3">{medicion.velocity ? `${medicion.velocity} m/s` : '-'}</td>
                  <td className="p-3">{medicion.flow ? `${medicion.flow} m³/s` : '-'}</td>
                  <td className="p-3">{medicion.temperature ? `${medicion.temperature} °C` : '-'}</td>
                  <td className="p-3">{medicion.timestamp ? new Date(medicion.timestamp).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Alertas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Sensor ID</th>
                <th className="p-3 text-left">Usuario ID</th>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(alerta => (
                <tr key={alerta.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{alerta.id}</td>
                  <td className="p-3">{alerta.sensor_id}</td>
                  <td className="p-3">{alerta.usuario_id}</td>
                  <td className="p-3">{alerta.descripcion}</td>
                  <td className="p-3">{alerta.estado}</td>
                  <td className="p-3">{alerta.marca_temporal ? new Date(alerta.marca_temporal).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTables;