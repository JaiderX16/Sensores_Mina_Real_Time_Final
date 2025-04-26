import React, { useEffect, useState } from 'react';

export function UserList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://apisensoresmina-production.up.railway.app/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });
            
            if (!response.ok) {
            throw new Error('Error al cargar los usuarios');
            }
            
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        }
        };

        fetchUsers();
    }, []);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    const handleDelete = async (id) => {
        if (!id) {
        alert('Error: ID de usuario no válido');
        return;
        }

        try {
        const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
        
        if (!confirmar) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autorización');
        }

        const response = await fetch(`https://apisensoresmina-production.up.railway.app/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Error al eliminar el usuario (${response.status})`);
        }

        setUsers(users.filter(user => user.id !== id));
        alert('Usuario eliminado exitosamente');
        
        } catch (err) {
        console.error('Error al eliminar:', err);
        alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-7xl mx-auto">
            <div className="w-full bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-left">
                    Nombre
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-left">
                    Apellido
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-left">
                    Correo
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-left">
                    Rol
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-left">
                    Cargo
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider text-center">
                    Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                {users.map((user, index) => (
                    <tr key={user.id || index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {user.nombre_usuario}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {user.apellido_usuario}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {user.correo_electronico}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {user.rol}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {user.cargo}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center space-x-4">
                        <button className="text-blue-400 hover:text-blue-300 bg-blue-900/30 p-2 rounded-full transition-all duration-300 hover:bg-blue-800/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        </button>
                        <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300 bg-red-900/30 p-2 rounded-full transition-all duration-300 hover:bg-red-800/50"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}