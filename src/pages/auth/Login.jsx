import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';


export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();

    // Si ya existe el token, redirige al dashboard
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('https://apisensoresmina-production.up.railway.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo_electronico: email,
                    contrasena: password
                })
            });

            const data = await response.json();
            console.log("Datos recibidos en login:", data);


            if (response.ok) {
                setMessageType('success');
                setMessage('¡Login exitoso!');
                // Store the token correctly
                localStorage.setItem('token', data.token);
                // Store only the userData object
                localStorage.setItem('userData', JSON.stringify(data.userData));

                // Redirige al dashboard después de 1 segundo
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1000);
            } else {
                setMessageType('error');
                setMessage(data.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            setMessageType('error');
            setMessage('Error de conexión');
        }
    };

    return (

        <div className="flex flex-col items-center justify-center h-screen dark mx-3">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="flex justify-center w-full text-2xl font-bold text-gray-200 mb-4">
                    Iniciar Sesión
                </h2>
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <input 
                        placeholder="Email address" 
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        placeholder="Password" 
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    {message && (
                        <div className={`mt-4 p-2 rounded-md ${
                            messageType === 'error' 
                                ? 'bg-red-900/50 text-red-200' 
                                : 'bg-green-900/50 text-green-200'
                        }`}>
                            {message}
                        </div>
                    )}
                    
                    <p className="text-white mt-4"> 
                        ¿No tienes una cuenta?
                        <a className="ml-2 text-sm text-blue-500 hover:underline" href="#">
                            Solicita una al administrador
                        </a>
                    </p>
                    <button 
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150" 
                        type="submit"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
