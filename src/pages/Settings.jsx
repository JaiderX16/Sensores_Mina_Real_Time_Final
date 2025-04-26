import React, { useState, useEffect } from 'react';

import { UserList } from '../components/UserList';

import AlertsList from '../components/AlertsList';

import SensorSettings from '../components/SensorSettings';

import UserProfile from '../components/UserProfile';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cuenta');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      setUserRole('user'); // Establecemos un rol por defecto si no hay datos
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      setUserRole(userData?.rol || 'user'); // Si no hay rol, establecemos 'user' por defecto
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      setUserRole('user'); // En caso de error, establecemos un rol por defecto
    }
  }, []);

  const tabs = {
    cuenta: {
      title: 'Cuenta',
      description: 'Administra la información de tu cuenta y tus preferencias.',
      content: <UserProfile />
    },



    notificaciones: {
      title: 'Notificaciones',
      description: 'Administra las notificaciones.',
      content: (
        <div className="space-y-6">
          
     
          <div>
            <h1 className="text-white font-bold text-xl mb-6 flex items-center">
              <span className="bg-blue-500 w-2 h-8 mr-3 rounded"></span>
              Área Externa - Bocamina
            </h1>
            <AlertsList areaId={1} /> {/* Pasamos el ID del área */}
          </div>
     


          <div>
            <h1 className="text-white font-bold text-xl mb-6 flex items-center">
              <span className="bg-green-500 w-2 h-8 mr-3 rounded"></span>
              Área de Operación - Rampa
            </h1>
            <AlertsList areaId={2} /> 
          </div>
        </div>
      )
    },







    ...(userRole === 'admin' ? {
      sensores: {
        title: 'Configuración de Sensores',
        description: 'Administra la configuración y preferencias de tus sensores',
        content: (
          <div className="space-y-6">
            <SensorSettings />
          </div>
        )
      },

      usuarios: {
        title: 'Usuarios',
        description: 'Administra los perfiles, permisos y configuraciones de los usuarios de tu plataforma',
        content: (
          <div className="space-y-6">
            <UserList />
          </div>
        )
      }
    } : {})
  };



  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{tabs[activeTab].title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{tabs[activeTab].description}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {Object.entries(tabs).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-4 ${
                activeTab === key
                  ? 'border-b-2 border-primary-600 font-medium text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              } transition-colors`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  );
};

export default Settings;