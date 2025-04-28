import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Moon, Sun, LogOut, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AlertsList from './AlertsList';

const Navbar = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: '',
    cargo: ''
  });

  useEffect(() => {
    // Cargar datos del usuario desde la API
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://apisensoresmina-production.up.railway.app/api/usuarios', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('Error al cargar los datos del usuario');
        }

        const usuariosData = await response.json();
        // Tomamos el primer usuario (o podrías filtrar por ID si es necesario)
        const usuario = usuariosData[0];
        
        if (usuario) {
          setUserData({
            nombre: usuario.nombre_usuario || '',
            apellido: usuario.apellido_usuario || '',
            correo_electronico: usuario.correo_electronico || '',
            cargo: usuario.cargo || ''
          });
        }
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
      }
    };

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

    fetchUserData();
    fetchAreas();
  }, []);

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el elemento existe antes de comprobar si contiene el objetivo del clic
      const notificationContainer = document.querySelector('.notifications-container');
      const userMenuContainer = document.querySelector('.user-menu-container');
      
      if (showNotifications && notificationContainer && !notificationContainer.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (showUserMenu && userMenuContainer && !userMenuContainer.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  const logout = (e) => {
    e.preventDefault(); // Prevenir la navegación por defecto del enlace
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

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

          <div className="relative notifications-container">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              aria-label="Mostrar notificaciones"
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
          
          <div className="relative user-menu-container">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center pl-3 pr-3 mx-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
              aria-label="Menú de usuario"
            >
              <div className="h-9 w-9 rounded-full bg-accent-600 text-white flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{userData.nombre} {userData.apellido}</p>
                { /* <p className="text-xs text-gray-500 dark:text-gray-400">{userData.correo_electronico}</p> */ }              
                <p className="text-xs text-gray-500 dark:text-gray-400">{userData.cargo}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="fixed right-0 mt-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2" style={{ right: '10px', top: '60px' }}>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Mi Perfil</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{userData.correo_electronico}</p>
                </div>
                <div className="py-2">
                  <a href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <UserCircle size={18} className="mr-2" />
                    Ver perfil
                  </a>
                  { /* <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings size={18} className="mr-2" />
                    Configuración
                  </a> */ }
                  <a href="#" onClick={logout} className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogOut size={18} className="mr-2" />
                    Cerrar sesión
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;