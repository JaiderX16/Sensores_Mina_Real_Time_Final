import React, { useState } from 'react';

import { UserList } from '../components/UserList';

import AlertsList from '../components/AlertsList';

import SensorSettings from '../components/SensorSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cuenta');

  const tabs = {
    
    
    
    cuenta: {
      title: 'Cuenta',
      description: 'Administra la información de tu cuenta y tus preferencias.',
      content: (
        <div className="w-full">
          <div className="max-w-3xl mx-auto">
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                    defaultValue="Jaider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                    defaultValue="Paraguay Junco" 
                    // Eliom,inar esa locura del default, eso se debe completar con los datos de la base de datos
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                  defaultValue="jaider@gmail.com"
                />
              </div>
              
              <div>
                <label
                  htmlFor="editRol"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Rol
                </label>
                <select
                  id="editRol"
                  name="rol"
                  required
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="user"
                  disabled={true}  // El rol no debería ser editable por el usuario
                >
                  <option value="user" className="bg-gray-700">Usuario</option>
                  <option value="admin" className="bg-gray-700">Administrador</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  El rol solo puede ser modificado por un administrador del sistema
                </p>
              </div>
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                  defaultValue="Desarrollador"
                />
              </div>
              
              <div className="pt-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )
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