import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: '',
    rol: '',
    cargo: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userDataStr) {
      try {
        const storedData = JSON.parse(userDataStr);
        const userId = storedData.id;
        const isAdmin = storedData.rol === 'admin';

        // Hacer una petición a la API para obtener los datos completos del usuario
        fetch(`https://apisensoresmina-production.up.railway.app/api/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
          }
          return response.json();
        })
        .then(user => {
          console.log('Respuesta de la API:', user);
          
          const userData = {
            nombre: user.nombre_usuario || user.nombre || user.user?.nombre || '',
            apellido: user.apellido_usuario || user.apellido || user.user?.apellido || '',
            correo_electronico: user.correo_electronico || user.email || user.user?.correo_electronico || '',
            rol: storedData.rol || user.rol || 'user',
            cargo: user.cargo || user.position || user.user?.cargo || '',
            isAdmin: isAdmin // Agregamos esta bandera
          };

          console.log('Datos procesados:', userData);
          setUserData(userData);
        })
        .catch(error => {
          console.error('Error al cargar datos:', error);
          // Si hay error en la API, intentamos usar los datos del localStorage
          setUserData({
            nombre: storedData.nombre_usuario || storedData.nombre || '',
            apellido: storedData.apellido_usuario || storedData.apellido || '',
            correo_electronico: storedData.correo_electronico || '',
            rol: storedData.rol || 'user',
            cargo: storedData.cargo || ''
          });
          setMessage({
            text: 'Error al cargar los datos actualizados del usuario',
            type: 'error'
          });
        });
      } catch (error) {
        console.error('Error al parsear datos del localStorage:', error);
        setMessage({
          text: 'Error al cargar los datos del usuario',
          type: 'error'
        });
      }
    }
  }, [navigate]);

  // En el render, modificamos el select del rol
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Rol
    </label>
    <select
      id="editRol"
      name="rol"
      required
      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={userData.rol}
      disabled={!userData.isAdmin} // Deshabilitamos si no es admin
      onChange={(e) => setUserData({...userData, rol: e.target.value})}
    >
      <option value="user" className="bg-gray-700">Usuario</option>
      <option value="admin" className="bg-gray-700">Administrador</option>
    </select>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {userData.isAdmin 
        ? "Como administrador, puedes modificar roles de usuario"
        : "El rol solo puede ser modificado por un administrador del sistema"}
    </p>
  </div>

  // En el handleSubmit, protegemos contra cambios no autorizados
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const userId = storedData.id;
      
      // Si no es admin, aseguramos que no se modifique el rol
      const dataToUpdate = {
        nombre_usuario: userData.nombre,
        apellido_usuario: userData.apellido,
        correo_electronico: userData.correo_electronico,
        cargo: userData.cargo
      };

      // Solo incluimos el rol si es administrador
      if (userData.isAdmin) {
        dataToUpdate.rol = userData.rol;
      }

      const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToUpdate)
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizamos el localStorage manteniendo el ID y el rol
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          id: storedData.id,
          rol: userData.rol
        }));

        setMessage({
          text: '¡Perfil actualizado exitosamente!',
          type: 'success'
        });
      } else {
        setMessage({
          text: data.message || 'Error al actualizar el perfil',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error en la actualización:', error);
      setMessage({
        text: 'Error de conexión al actualizar el perfil',
        type: 'error'
      });
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-500/20 text-red-200' 
              : 'bg-green-500/20 text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                value={userData.nombre}
                onChange={(e) => setUserData({...userData, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                value={userData.apellido}
                onChange={(e) => setUserData({...userData, apellido: e.target.value})}
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
              value={userData.correo_electronico}
              onChange={(e) => setUserData({...userData, correo_electronico: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              id="editRol"
              name="rol"
              required
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={userData.rol}
              disabled={!userData.isAdmin} // Añadimos esta línea para deshabilitar si no es admin
              onChange={(e) => setUserData({...userData, rol: e.target.value})}
            >
              <option value="user" className="bg-gray-700">Usuario</option>
              <option value="admin" className="bg-gray-700">Administrador</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {userData.isAdmin 
                ? "Como administrador, puedes modificar roles de usuario"
                : "El rol solo puede ser modificado por un administrador del sistema"}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cargo
            </label>
            <input
              type="text"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              value={userData.cargo}
              onChange={(e) => setUserData({...userData, cargo: e.target.value})}
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;