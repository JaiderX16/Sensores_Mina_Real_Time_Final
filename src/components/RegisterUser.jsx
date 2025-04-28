// components/RegisterUser.jsx
import { useState } from "react";
import { User, Mail, Briefcase, Lock, UserCheck } from "lucide-react";

export function RegisterUser() {
    const [formData, setFormData] = useState({
        nombre_usuario: "",
        apellido_usuario: "",
        correo_electronico: "",
        contrasena: "",
        rol: "user", // Valor por defecto para el select
        cargo: "",
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autorización');
            }
            
            const response = await fetch('https://apisensoresmina-production.up.railway.app/api/usuarios', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el usuario');
            }
            
            setMessage({ text: '¡Usuario creado exitosamente!', type: 'success' });
            setFormData({
                nombre_usuario: "",
                apellido_usuario: "",
                correo_electronico: "",
                contrasena: "",
                rol: "user",
                cargo: "",
            });
            
            // Recargar la página después de 2 segundos para mostrar el nuevo usuario
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center mx-1">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-md p-6">
                
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${
                        message.type === 'error' 
                            ? 'bg-red-500/20 text-red-200 border-l-4 border-red-500' 
                            : 'bg-green-500/20 text-green-200 border-l-4 border-green-500'
                    }`}>
                        <span className={`mr-2 ${message.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
                            {message.type === 'error' ? '⚠️' : '✅'}
                        </span>
                        {message.text}
                    </div>
                )}
                
                <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                name="nombre_usuario"
                                placeholder="Nombre"
                                className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={formData.nombre_usuario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                name="apellido_usuario"
                                placeholder="Apellido"
                                className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={formData.apellido_usuario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            name="correo_electronico"
                            placeholder="Correo Electrónico"
                            className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            type="email"
                            value={formData.correo_electronico}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            name="contrasena"
                            placeholder="Contraseña"
                            className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 pr-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            type={showPassword ? "text" : "password"}
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-300" htmlFor="rol">
                                Rol de Usuario
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <UserCheck size={18} />
                                </div>
                                <select
                                    id="rol"
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                                    required
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2 text-gray-300" htmlFor="cargo">
                                Cargo
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <Briefcase size={18} />
                                </div>
                                <input
                                    id="cargo"
                                    name="cargo"
                                    placeholder="Cargo en la empresa"
                                    className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 pl-10 w-full focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    type="text"
                                    value={formData.cargo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button
                        className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-3 px-4 rounded-md mt-6 hover:from-indigo-600 hover:to-blue-600 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registrando...
                            </div>
                        ) : 'Registrar Usuario'}
                    </button>
                </form>
            </div>
        </div>
    );
}