// components/RegisterUser.jsx
import { useState } from "react";

export function RegisterUser() {
    const [formData, setFormData] = useState({
        nombre_usuario: "",
        apellido_usuario: "",
        correo_electronico: "",
        contrasena: "",
        rol: "user", // Valor por defecto para el select
        cargo: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
        // Aquí enviarías los datos al backend mediante fetch o axios
    };

    return (
        <div className="flex flex-col items-center justify-center mx-1">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="flex justify-center text-2xl font-bold text-gray-200 mb-4">
                    Registrar Usuario
                </h2>
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <input
                        name="nombre_usuario"
                        placeholder="Nombre de Usuario"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="text"
                        value={formData.nombre_usuario}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="apellido_usuario"
                        placeholder="Apellido de Usuario"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="text"
                        value={formData.apellido_usuario}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="correo_electronico"
                        placeholder="Correo Electrónico"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="email"
                        value={formData.correo_electronico}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="contrasena"
                        placeholder="Contraseña"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="password"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                    />

                    <label className="text-sm mb-2 text-gray-200" htmlFor="rol">
                        Rol
                    </label>

                    <select
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4"
                        required
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>

                    <input
                        name="cargo"
                        placeholder="Cargo"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="text"
                        value={formData.cargo}
                        onChange={handleChange}
                        required
                    />
                    <button
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 transition"
                        type="submit"
                    >
                        Registrar Usuario
                    </button>
                </form>
            </div>
        </div>
    );
}