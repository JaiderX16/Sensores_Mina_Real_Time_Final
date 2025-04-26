import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const logout = () => {
        // Eliminar el token y los datos del usuario del localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        // Redirigir al usuario a la página de inicio de sesión
        navigate('/login');
    };

    return (
        <button 
            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:from-red-600 hover:to-red-800 transition ease-in-out duration-150"
            onClick={logout}
        >
            Cerrar Sesión
        </button>
    );
};

export default LogoutButton;