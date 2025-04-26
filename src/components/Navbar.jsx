import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Moon, Sun } from 'lucide-react';

import AlertsList from './AlertsList';

const Navbar = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: ''
  });

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const storedData = JSON.parse(userDataStr);
        setUserData({
          nombre: storedData.nombre_usuario || storedData.nombre || '',
          apellido: storedData.apellido_usuario || storedData.apellido || '',
          correo_electronico: storedData.correo_electronico || ''
        });
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    }

    // Cargar áreas desde la API
    const fetchAreas = async () => {
      try {
        const response = await fetch('https://apisensoresmina-production.up.railway.app/api/areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('Error al cargar las áreas');
        }

        const areasData = await response.json();
        setAreas(areasData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          
          
          {/* <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}



          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="fixed right-0 mt-4 w-80 md:w-96 lg:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2" style={{ right: '10px', top: '60px' }}>
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 p-3">
                    {loading ? (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Cargando áreas...</div>
                    ) : error ? (
                      <div className="text-red-500 text-sm">Error: {error}</div>
                    ) : (
                      areas.map((area, index) => (
                        <div key={area.id} className="pb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <span className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} w-1.5 h-5 mr-2 rounded`}></span>
                            {area.nombre_area}
                          </h4>
                          <AlertsList areaId={area.id} compact={true} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center border-l dark:border-gray-600 pl-3 ml-3">
            <div className="h-9 w-9 rounded-full bg-accent-600 text-white flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{userData.nombre} {userData.apellido}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userData.correo_electronico}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;