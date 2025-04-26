// components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import AdminControls from "./AdminControls";
import { RegisterUser } from "./RegisterUser";

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar los datos del usuario desde localStorage (o desde donde los tengas)
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = (e) => {
    // Se puede mejorar para cerrar el modal haciendo clic fuera, etc.
    setModalOpen(false);
  };

  return (
    <div>
      {/* AdminControls recibe la función para abrir el modal */}
      <AdminControls user={user} onOpenModal={handleOpenModal} />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            {/* Botón para cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-white text-xl font-bold"
            >
              &times;
            </button>
            <RegisterUser />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
