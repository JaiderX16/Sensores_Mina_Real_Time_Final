import React, { useState, useEffect } from 'react';

import { UserList } from '../components/UserList';
import { RegisterUser } from '../components/RegisterUser';

import SensorSettings from '../components/SensorSettings';

import UserProfile from '../components/UserProfile';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cuenta');
  const [userRole, setUserRole] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

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

  useEffect(() => {
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

  const tabs = {
    cuenta: {
      title: 'Cuenta',
      description: 'Administra la información de tu cuenta y tus preferencias.',
      content: <UserProfile />
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
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md hover:from-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
              >
                Agregar Usuario
              </button>
            </div>
            <UserList />
          </div>
        )
      }
    } : {})
  };

  // Modal para agregar usuario
  const AddUserModal = () => {
    if (!showAddUserModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl pt-6 w-full max-w-md mx-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-center text-white ml-6">Registro de Usuario</h3>
            <button 
              onClick={() => setShowAddUserModal(false)}
              className="text-gray-400 hover:text-white mr-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <RegisterUser />
        </div>
      </div>
    );
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
      
      {/* Modal para agregar usuario */}
      <AddUserModal />
    </div>
  );
};

export default Settings;